import mongoose, { Document, Schema } from 'mongoose';

export interface IAttachment {
    url: string;
    key: string;
    name: string;
    size: number;
    type: string;
}

export interface ICard extends Document {
    listId: mongoose.Schema.Types.ObjectId;
    boardId: mongoose.Schema.Types.ObjectId;
    title: string;
    description?: string;
    position: number;
    labels: mongoose.Schema.Types.ObjectId[];
    dueDate?: Date;
    assignees: mongoose.Schema.Types.ObjectId[];
    attachments: IAttachment[];
    commentCount?: number;
    completedAt?: Date;
    meta?: {
        status?: string;
        [key: string]: any;
    };
    createdAt: Date;
    updatedAt: Date;
}

const AttachmentSchema = new Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
    },
    url: String,
    key: String,
    name: String,
    size: Number,
    type: String,
});

const CardSchema: Schema = new Schema({
    listId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List',
        required: true,
    },
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    position: {
        type: Number,
        required: true,
        default: 0,
    },
    labels: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Label',
    }],
    dueDate: {
        type: Date,
    },
    assignees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    attachments: [AttachmentSchema],
    commentCount: {
        type: Number,
        default: 0,
    },
    completedAt: {
        type: Date,
    },
    meta: {
        type: Map,
        of: Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});

CardSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<ICard>('Card', CardSchema);
