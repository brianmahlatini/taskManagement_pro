import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    type: 'mention' | 'card_due' | 'member_added' | 'comment_added';
    title: string;
    message: string;
    isRead: boolean;
    meta: Record<string, any>;
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['mention', 'card_due', 'member_added', 'comment_added'],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    meta: {
        type: Map,
        of: Schema.Types.Mixed,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});

export default mongoose.model<INotification>('Notification', NotificationSchema);