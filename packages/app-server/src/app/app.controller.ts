import {Controller, Get, Post, UploadedFile, UseInterceptors} from '@nestjs/common';

import {AppService} from './app.service';
import {FileInterceptor} from "@nestjs/platform-express";
import {Express} from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @Get('apps')
  getAppsList(): Promise<string[]> {
    return this.appService.getAppsList();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const response = {
      originalname: file.originalname,
      filename: file.filename,
    };
    await this.appService.UploadedFile(file);
    return response;
  }
}