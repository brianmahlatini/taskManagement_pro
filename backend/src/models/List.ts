import mongoose, { Document, Schema } from 'mongoose';

export interface IList extends Document {
    boardId: mongoose.Schema.Types.ObjectId;
    title: string;
    position: number;
    createdAt: Date;
}

const ListSchema: Schema = new Schema({
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    position: {
        type: Number,
        required: true,
        default: 0,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});

export default mongoose.model<IList>('List', ListSchema);
