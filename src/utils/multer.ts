import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from './multer.config';

export function imageUploadInterceptor(folder: string, maxFileSize?: number) {
  return FileInterceptor('file', multerConfig(folder, maxFileSize));
}
