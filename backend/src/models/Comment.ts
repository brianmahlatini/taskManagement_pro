import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
    cardId: mongoose.Schema.Types.ObjectId;
    userId: mongoose.Schema.Types.ObjectId;
    content: string;
    parentCommentId?: mongoose.Schema.Types.ObjectId;
    mentions?: string[];
    createdAt: Date;
}

const CommentSchema: Schema = new Schema({
    cardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    parentCommentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    },
    mentions: [{
        type: String,
    }],
}, {
    timestamps: { createdAt: true, updatedAt: false },
});

export default mongoose.model<IComment>('Comment', CommentSchema);
