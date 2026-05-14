import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];

export function validateImageUpload(
  file: Express.Multer.File,
  maxFileSize = 5 * 1024 * 1024,
) {
  if (!file) {
    throw new BadRequestException('Image file is required');
  }

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new BadRequestException('Unsupported image mime type');
  }

  const extension = extname(file.originalname).toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    throw new BadRequestException('Unsupported image extension');
  }

  if (file.size > maxFileSize) {
    throw new BadRequestException('Image exceeds the allowed size limit');
  }
}

export { allowedMimeTypes, allowedExtensions };
