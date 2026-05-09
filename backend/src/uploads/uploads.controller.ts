import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AdminGuard, JwtAuthGuard } from '../auth/guards/auth.guard';
import { Reflector } from '@nestjs/core';
import * as fs from 'fs';

@Controller('uploads')
export class UploadsController {
  @Post()
  @UseGuards(new AdminGuard(new Reflector()))
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './public/uploads';
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      }
    })
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    // Retorna la URL relativa que podrá usarse en el frontend
    return {
      url: `/public/uploads/${file.filename}`
    };
  }
}
