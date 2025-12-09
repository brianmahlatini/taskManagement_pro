import { Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { s3Service } from '../utils/s3Service';

const storage = multer.memoryStorage(); // Use memory storage for S3 uploads

const checkFileType = (file: Express.Multer.File, cb: FileFilterCallback) => {
    const filetypes = /jpg|jpeg|png|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Images and Documents only!'));
    }
};

export const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

export const uploadFile = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded');
    }

    try {
        // Upload to S3
        const { url, key } = await s3Service.uploadFile(req.file);

        res.json({
            url,
            key,
            name: req.file.originalname,
            size: req.file.size,
            type: req.file.mimetype
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Failed to upload file' });
    }
};
