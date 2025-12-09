import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
    boardId: mongoose.Schema.Types.ObjectId;
    actorId: mongoose.Schema.Types.ObjectId;
    actionType: string;
    meta: Record<string, any>;
    isRead: boolean;
    createdAt: Date;
}

const ActivitySchema: Schema = new Schema({
    boardId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
        required: true,
    },
    actorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    actionType: {
        type: String,
        required: true,
    },
    meta: {
        type: Map,
        of: Schema.Types.Mixed,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});

export default mongoose.model<IActivity>('Activity', ActivitySchema);
