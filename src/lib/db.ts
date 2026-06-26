import mysql from "mysql2/promise";

const globalForDb = global as unknown as { pool: mysql.Pool | undefined };

export function getDbPool(): mysql.Pool {
  if (!globalForDb.pool) {
    const host = process.env.TIDB_HOST;
    const port = parseInt(process.env.TIDB_PORT || "4000", 10);
    const user = process.env.TIDB_USER;
    const password = process.env.TIDB_PASSWORD;
    const database = process.env.TIDB_DATABASE;
    const sslDisabled = process.env.TIDB_SSL_DISABLED === "true";

    globalForDb.pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      ssl: sslDisabled
        ? undefined
        : {
            minVersion: "TLSv1.2",
            rejectUnauthorized: true,
          },
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 30000, // close idle connections after 30 seconds
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
    });
  }
  return globalForDb.pool;
}

export async function query(sql: string, params?: any[]): Promise<any> {
  const db = getDbPool();
  try {
    const [rows] = await db.execute(sql, params);
    return rows;
  } catch (error: any) {
    // If connection was reset or closed, recreate the pool and retry once
    const isConnectionError =
      error.code === "ECONNRESET" ||
      error.code === "PROTOCOL_CONNECTION_LOST" ||
      error.fatal;

    if (isConnectionError) {
      console.warn("Database connection lost or reset. Retrying query...", error.message);
      
      // Close the old pool to free resources
      if (globalForDb.pool) {
        try {
          await globalForDb.pool.end();
        } catch (e) {
          console.error("Error closing old database pool:", e);
        }
        globalForDb.pool = undefined;
      }

      // Recreate pool and run query again
      const freshDb = getDbPool();
      const [rows] = await freshDb.execute(sql, params);
      return rows;
    }
    
    throw error;
  }
}
