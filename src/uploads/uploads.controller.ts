import {
  Controller,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { validateImageUpload } from '../utils/image-upload-validation';
import { imageUploadInterceptor } from '../utils/multer';
import { UploadsService } from './uploads.service';

@ApiTags('Uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(imageUploadInterceptor('products'))
  @Post('products')
  uploadProductImage(@UploadedFile() file: Express.Multer.File) {
    validateImageUpload(file);

    return {
      url: this.uploadsService.buildFileUrl('products', file.filename),
    };
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(imageUploadInterceptor('categories'))
  @Post('categories')
  uploadCategoryImage(@UploadedFile() file: Express.Multer.File) {
    validateImageUpload(file);

    return {
      url: this.uploadsService.buildFileUrl('categories', file.filename),
    };
  }

  @ApiConsumes('multipart/form-data')
  @UseInterceptors(imageUploadInterceptor('users'))
  @Post('users')
  uploadUserImage(@UploadedFile() file: Express.Multer.File) {
    validateImageUpload(file);

    return {
      url: this.uploadsService.buildFileUrl('users', file.filename),
    };
  }
}
