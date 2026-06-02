import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

export const UPLOAD_FOLDERS = {
  products: 'reviewhub/products',
  reviews: 'reviewhub/reviews',
  avatars: 'reviewhub/avatars',
} as const;

export const IMAGE_TRANSFORMATIONS = {
  product: {
    width: 800,
    height: 800,
    crop: 'limit',
    quality: 'auto',
    fetch_format: 'auto',
  },
  review: {
    width: 1200,
    height: 900,
    crop: 'limit',
    quality: 'auto',
    fetch_format: 'auto',
  },
  avatar: {
    width: 200,
    height: 200,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto',
    fetch_format: 'auto',
  },
};
