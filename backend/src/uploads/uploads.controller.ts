import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from '../auth/guards/auth.guard';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Controller('uploads')
export class UploadsController {
  
  constructor(private readonly configService: ConfigService) {
    // Configurar Cloudinary usando las variables que pusimos en el .env
    cloudinary.config({
      cloud_name: this.configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  @Post()
  @UseGuards(new AdminGuard(new Reflector()))
  // Ya NO usamos diskStorage, en su lugar guardamos temporalmente en memoria (RAM)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('No se subió ningún archivo', HttpStatus.BAD_REQUEST);
    }

    try {
      // Proceso seguro para subir de nuestra memoria (NestJS) a Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'tiendaxpress_productos' }, // Cloudinary creará esta carpeta
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });

      // Retorna la URL segura de Cloudinary directamente a tu frontend de Vercel
      return {
        url: (uploadResult as any).secure_url
      };

    } catch (error) {
      console.error('Error con cloudinary: ', error);
      throw new HttpException('Error subiendo imagen a la nube', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
