const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

// Parse .env.local
const envPath = path.join(__dirname, ".env.local");
if (!fs.existsSync(envPath)) {
  console.error(".env.local file not found!");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, "utf8");
const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[match[1]] = value;
  }
});

async function run() {
  console.log("Connecting to TiDB database...");
  console.log(`Host: ${env.TIDB_HOST}`);
  console.log(`Database: ${env.TIDB_DATABASE}`);

  const connection = await mysql.createConnection({
    host: env.TIDB_HOST,
    port: parseInt(env.TIDB_PORT || "4000", 10),
    user: env.TIDB_USER,
    password: env.TIDB_PASSWORD,
    database: env.TIDB_DATABASE,
    ssl: env.TIDB_SSL_DISABLED === "true"
      ? undefined
      : {
          minVersion: "TLSv1.2",
          rejectUnauthorized: true,
        },
    multipleStatements: true, // Execute entire files at once
  });

  console.log("Connected successfully!");

  // Run schema
  const schemaPath = path.join(__dirname, "tidb-schema.sql");
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, "utf8");
    console.log("Running tidb-schema.sql...");
    await connection.query(schemaSql);
    console.log("Database schema created successfully.");
  } else {
    console.warn("Schema file tidb-schema.sql not found!");
  }

  // Run seed
  const seedPath = path.join(__dirname, "tidb-seed.sql");
  if (fs.existsSync(seedPath)) {
    const seedSql = fs.readFileSync(seedPath, "utf8");
    console.log("Running tidb-seed.sql...");
    await connection.query(seedSql);
    console.log("Database seeded successfully!");
  } else {
    console.warn("Seed file tidb-seed.sql not found!");
  }

  await connection.end();
  console.log("All done!");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
