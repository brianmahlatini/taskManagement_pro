import express from 'express';
import { upload, uploadFile } from '../controllers/uploadController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/', protect, upload.single('file'), uploadFile);

export default router;
