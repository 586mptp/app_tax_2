import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function deleteImages(publicIds: string[]) {
  if (publicIds.length === 0) return;

  await cloudinary.api.delete_resources(publicIds, {
    resource_type: "image",
  });
}
export async function uploadImages(files: File[], folder: string) {
  const uploadedImages = await Promise.all(
    files.map(async (file) => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder,
              resource_type: "image",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          )
          .end(buffer);
      });

      return {
        name: file.name,
        type: file.type,
        size: file.size,
        url: result!.secure_url,
        publicId: result!.public_id,
      };
    }),
  );

  return uploadedImages;
}
