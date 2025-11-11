import multer from 'multer';
import { Request } from 'express';
import fs from 'fs';
import path from 'path';

//Ensure upload exists
const uploadDir = 'uploads/companies';
if(!fs.existsSync(uploadDir)){
   fs.mkdirSync(uploadDir, {recursive: true});
}

//Configure storage
const storage = multer.diskStorage({
   destination: (req: Request, file: Express.Multer.File, cb) => {
      cb(null, uploadDir);
   },
   filename: (req: Request, file: Express.Multer.File, cb) => {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(file.originalname);
      const filename = `${timestamp}-${randomString}${fileExtension}`;
      cb(null, filename);
   }
})

//File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
   const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
   const allowedDocumentTypes = ['application/pdf', 'image/jpeg', 'image/png'];

   if(file.fieldname === 'logo'){
      if(allowedImageTypes.includes(file.mimetype)) {
         cb(null, true);
      } else {
         cb(new Error('Invalid file type for logo. Only JPEG, PNG, and WebP are allowed.'));
      }
   } else if (['businessLicense', 'taxCertificate', 'ownerId'].includes(file.fieldname)) {
       if (allowedDocumentTypes.includes(file.mimetype)) {
         cb(null, true);
      } else {
         cb(new Error('Invalid file type for documents. Only PDF, JPEG, and PNG are allowed.'));
      }
   } else {
      cb(new Error('Unexpected field'));
   }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
});

export default upload;

