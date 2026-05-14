import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { allowedExtensions, allowedMimeTypes } from './image-upload-validation';

export function multerConfig(folder: string, maxFileSize = 5 * 1024 * 1024) {
  const destination = join(process.cwd(), 'uploads', folder);

  return {
    storage: diskStorage({
      destination: (_req, _file, callback) => {
        mkdirSync(destination, { recursive: true });
        callback(null, destination);
      },
      filename: (_req, file, callback) => {
        const extension = extname(file.originalname).toLowerCase();
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
        callback(null, uniqueName);
      },
    }),
    limits: { fileSize: maxFileSize },
    fileFilter: (
      _req: Express.Request,
      file: Express.Multer.File,
      callback: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      const extension = extname(file.originalname).toLowerCase();
      const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
      const isValidExtension = allowedExtensions.includes(extension);

      if (!isValidMimeType || !isValidExtension) {
        callback(new BadRequestException('Only JPG, PNG, and WEBP images are allowed'), false);
        return;
      }

      callback(null, true);
    },
  };
}
