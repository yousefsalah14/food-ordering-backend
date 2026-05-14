import { BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';

export function validateUUID(id: string, fieldName = 'id'): string {
  if (!isUUID(id, '4')) {
    throw new BadRequestException(`${fieldName} must be a valid UUID`);
  }

  return id;
}
