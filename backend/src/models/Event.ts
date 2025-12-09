import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    type: 'meeting' | 'deadline' | 'review' | 'other';
    boardId?: mongoose.Types.ObjectId;
    createdBy: mongoose.Types.ObjectId;
    attendees: mongoose.Types.ObjectId[];
    color: string;
    allDay: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema: Schema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    type: {
        type: String,
        enum: ['meeting', 'deadline', 'review', 'other'],
        default: 'other',
    },
    boardId: {
        type: Schema.Types.ObjectId,
        ref: 'Board',
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    attendees: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    color: {
        type: String,
        default: '#3B82F6',
    },
    allDay: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

export default mongoose.model<IEvent>('Event', EventSchema);
