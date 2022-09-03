import { BadRequestException, HttpStatus } from '@nestjs/common';
import { diskStorage } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export enum dest {
  ROOT = './uploads',
  USER = './uploads/avatars',
  DOG = './uploads/images',
}

const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(
      new BadRequestException({
        status_code: HttpStatus.BAD_REQUEST,
        message: 'Only image files (jpg|jpeg|png|gif) are allowed!',
      }),
      false,
    );
  }
  callback(null, true);
};

export const storageUser = {
  storage: diskStorage({
    destination: dest.USER,
    filename: (req, file, callback) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;
      callback(null, `${filename}${extension}`);
    },
  }),
  fileFilter: imageFileFilter,
};

export const storageDog = {
  storage: diskStorage({
    destination: dest.DOG,
    filename: (req, file, callback) => {
      const filename: string =
        path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
      const extension: string = path.parse(file.originalname).ext;
      callback(null, `${filename}${extension}`);
    },
  }),
  fileFilter: imageFileFilter,
};
