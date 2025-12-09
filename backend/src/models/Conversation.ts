import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
    participants: mongoose.Schema.Types.ObjectId[];
    lastMessage?: mongoose.Schema.Types.ObjectId;
    unreadCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const ConversationSchema: Schema = new Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
    },
    unreadCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

export default mongoose.model<IConversation>('Conversation', ConversationSchema);