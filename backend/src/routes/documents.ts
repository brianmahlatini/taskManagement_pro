import express from 'express';
import { protect } from '../middleware/auth';
import { uploadDocument, getDocuments, getDocument, deleteDocument, createFolder } from '../controllers/documentController';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/documents/' });

router.use(protect);

// Document routes
router.route('/').get(getDocuments).post(upload.single('file'), uploadDocument);
router.route('/folders').post(createFolder);
router.route('/:documentId').get(getDocument).delete(deleteDocument);

export default router;