import { Injectable } from '@nestjs/common';
import { Express } from 'express';
import { Multer } from 'multer';
import {join, basename} from "path";
import { readdir, stat, existsSync } from 'fs-extra';
import {execute} from "@autoflow-ai/core";
import {mkdirSync} from "fs";

@Injectable()
export class AppService {

  async  getDirectories(path): Promise<string[]> {
    let dirs = [];
    if(existsSync(path)) {
      const filesAndDirectories = await readdir(path);

      const directories = [];
      await Promise.all(
        filesAndDirectories.map(name => {
          return stat(join(path, name))
            .then(stat => {
              if (stat.isDirectory()) directories.push(name)
            })
        })
      );
      dirs = directories;
    }
    return dirs;
}

  async getAppsList(): Promise<string[]> {
    return (await this.getDirectories(join(__dirname, 'apps')));
  }

  async UploadedFile(file: Express.Multer.File) {

    const appName  = basename(file.originalname, '.zip');
    const appsDir = join(__dirname, 'apps');
    const appDir = join(appsDir, `${appName}`);

    if(!existsSync(appsDir)) {
      mkdirSync(appsDir);
    }
    await execute(`cd ${join(__dirname, 'apps')} && unzip -o ${appName}.zip -d ${appsDir}`);
  }
}