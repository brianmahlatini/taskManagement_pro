import { Request, Response } from 'express';
import Document from '../models/Document';
import { IUser } from '../models/User';
import path from 'path';
import fs from 'fs';

// Get all documents
export const getDocuments = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;

    const documents = await Document.find({
      $or: [
        { createdBy: userId },
        { sharedWith: userId }
      ]
    })
    .populate('createdBy', 'name email avatarUrl')
    .sort({ updatedAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching documents', error });
  }
};

// Get a specific document
export const getDocument = async (req: any, res: Response) => {
  try {
    const { documentId } = req.params;
    const userId = req.user._id;

    const document = await Document.findOne({
      _id: documentId,
      $or: [
        { createdBy: userId },
        { sharedWith: userId }
      ]
    }).populate('createdBy', 'name email avatarUrl');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching document', error });
  }
};

// Upload a new document
export const uploadDocument = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const document = new Document({
      name: file.originalname,
      type: 'file',
      size: file.size,
      fileUrl: `/uploads/documents/${file.filename}`,
      createdBy: userId,
      parentId: req.body.parentId || null
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document', error });
  }
};

// Create a new folder
export const createFolder = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const { name, parentId } = req.body;

    const folder = new Document({
      name,
      type: 'folder',
      createdBy: userId,
      parentId: parentId || null
    });

    await folder.save();
    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ message: 'Error creating folder', error });
  }
};

// Delete a document
export const deleteDocument = async (req: any, res: Response) => {
  try {
    const { documentId } = req.params;
    const userId = req.user._id;

    const document = await Document.findOneAndDelete({
      _id: documentId,
      createdBy: userId
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found or access denied' });
    }

    // Delete the actual file if it exists
    if (document.type === 'file' && document.fileUrl) {
      const filePath = path.join(__dirname, '..', '..', document.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting document', error });
  }
};