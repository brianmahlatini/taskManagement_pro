import mongoose, { Document, Schema } from 'mongoose';

export interface ILabel extends Document {
    boardId: mongoose.Schema.Types.ObjectId;
    name: string;
    color: string;
    createdAt: Date;
}

const LabelSchema: Schema = new Schema({
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
        default: '#4F46E5',
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});

export default mongoose.model<ILabel>('Label', LabelSchema);