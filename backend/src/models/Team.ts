import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
    name: string;
    description?: string;
    ownerId: mongoose.Schema.Types.ObjectId;
    members: {
        userId: mongoose.Schema.Types.ObjectId;
        role: 'owner' | 'admin' | 'member';
        joinedAt: Date;
        status: 'active' | 'inactive' | 'pending';
    }[];
    settings: {
        isPrivate: boolean;
        autoApproveMembers: boolean;
        maxMembers?: number;
    };
    boards: mongoose.Schema.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    status: 'active' | 'archived' | 'disbanded';
    tags?: string[];
    avatarUrl?: string;
    archivedAt?: Date;
}

const TeamSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        maxlength: 50,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500,
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            enum: ['owner', 'admin', 'member'],
            default: 'member',
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'pending'],
            default: 'active',
        },
    }],
    settings: {
        isPrivate: {
            type: Boolean,
            default: false,
        },
        autoApproveMembers: {
            type: Boolean,
            default: true,
        },
        maxMembers: {
            type: Number,
            default: 50,
        },
    },
    boards: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Board',
    }],
    status: {
        type: String,
        enum: ['active', 'archived', 'disbanded'],
        default: 'active',
    },
    tags: [{
        type: String,
        trim: true,
    }],
    avatarUrl: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

// Add indexes for better query performance
TeamSchema.index({ name: 'text', description: 'text' });
TeamSchema.index({ 'members.userId': 1 });
TeamSchema.index({ status: 1 });

export default mongoose.model<ITeam>('Team', TeamSchema);