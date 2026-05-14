import { Injectable } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { fileExists } from '../utils/fileExists';

@Injectable()
export class UploadsService {
  buildFileUrl(folder: string, filename: string) {
    return `/uploads/${folder}/${filename}`;
  }

  async deleteFile(fileUrl?: string | null) {
    if (!fileUrl) {
      return;
    }

    const relativePath = fileUrl.replace(/^\/uploads\//, '');
    const absolutePath = join(process.cwd(), 'uploads', relativePath);

    if (await fileExists(absolutePath)) {
      await unlink(absolutePath);
    }
  }
}
