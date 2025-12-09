import mongoose, { Document, Schema } from 'mongoose';

export interface IInvitation extends Document {
    email: string;
    teamId: mongoose.Schema.Types.ObjectId;
    invitedBy: mongoose.Schema.Types.ObjectId;
    role: 'member' | 'admin';
    status: 'pending' | 'accepted' | 'expired';
    token: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const InvitationSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true,
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    role: {
        type: String,
        enum: ['member', 'admin'],
        default: 'member',
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'expired'],
        default: 'pending',
    },
    token: {
        type: String,
        required: true,
        unique: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
});

// Add indexes for better query performance
InvitationSchema.index({ email: 1 });
InvitationSchema.index({ teamId: 1 });
InvitationSchema.index({ invitedBy: 1 });
InvitationSchema.index({ status: 1 });
InvitationSchema.index({ token: 1 }, { unique: true });

export default mongoose.model<IInvitation>('Invitation', InvitationSchema);