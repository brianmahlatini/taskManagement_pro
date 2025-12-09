import mongoose, { Document, Schema } from 'mongoose';

export interface IArchivedItem extends Document {
    type: 'board' | 'card' | 'list' | 'document';
    title: string;
    description?: string;
    originalId: string;
    archivedBy: mongoose.Schema.Types.ObjectId;
    archivedAt: Date;
    meta?: {
        boardId?: string;
        listId?: string;
        labels?: string[];
        dueDate?: Date;
        attachments?: number;
        comments?: number;
    };
}

const ArchivedItemSchema: Schema = new Schema({
    type: {
        type: String,
        enum: ['board', 'card', 'list', 'document'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    originalId: {
        type: String,
        required: true,
    },
    archivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    archivedAt: {
        type: Date,
        default: Date.now,
    },
    meta: {
        type: Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});

export default mongoose.model<IArchivedItem>('ArchivedItem', ArchivedItemSchema);