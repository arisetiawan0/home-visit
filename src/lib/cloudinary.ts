import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(fileBuffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `home-visit/${folder}`,
      },
      (error, result) => {
        if (error) return reject(error);
        if (result) return resolve(result.secure_url);
        return reject(new Error("Cloudinary upload returned no result"));
      }
    );
    uploadStream.end(fileBuffer);
  });
}
