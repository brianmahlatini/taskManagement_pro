import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
    name: string;
    type: 'folder' | 'file';
    size?: number;
    fileUrl?: string;
    createdBy: mongoose.Schema.Types.ObjectId;
    parentId?: mongoose.Schema.Types.ObjectId;
    sharedWith?: mongoose.Schema.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const DocumentSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['folder', 'file'],
        required: true,
    },
    size: {
        type: Number,
    },
    fileUrl: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
    },
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {
    timestamps: true,
});

export default mongoose.model<IDocument>('Document', DocumentSchema);