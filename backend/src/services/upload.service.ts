import cloudinary, { UPLOAD_FOLDERS, IMAGE_TRANSFORMATIONS } from '../config/cloudinary';

type UploadType = 'product' | 'review' | 'avatar';

export async function uploadImage(
  filePath: string,
  type: UploadType
): Promise<{ url: string; publicId: string }> {
  const folder = UPLOAD_FOLDERS[`${type}s` as keyof typeof UPLOAD_FOLDERS];
  const transformation = IMAGE_TRANSFORMATIONS[type];

  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    transformation: [transformation],
    resource_type: 'image',
  });

  return { url: result.secure_url, publicId: result.public_id };
}

export async function uploadImageBuffer(
  buffer: Buffer,
  type: UploadType
): Promise<{ url: string; publicId: string }> {
  const folder = UPLOAD_FOLDERS[`${type}s` as keyof typeof UPLOAD_FOLDERS];
  const transformation = IMAGE_TRANSFORMATIONS[type];

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          transformation: [transformation],
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Upload failed'));
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      )
      .end(buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function validateImageMimeType(mimetype: string): boolean {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return allowedTypes.includes(mimetype);
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_FILES_PER_REVIEW = 5;
export const MAX_FILES_PER_PRODUCT = 10;
