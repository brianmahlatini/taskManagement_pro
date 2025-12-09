import mongoose, { Document, Schema } from 'mongoose';

export interface IBoard extends Document {
    title: string;
    description?: string;
    ownerId: mongoose.Schema.Types.ObjectId;
    teamId?: mongoose.Schema.Types.ObjectId; // Reference to team
    members: {
        userId: mongoose.Schema.Types.ObjectId;
        role: 'owner' | 'admin' | 'member' | 'viewer';
        joinedAt: Date;
        lastActive?: Date;
    }[];
    settings: {
        backgroundColor?: string;
        isPrivate: boolean;
        isTeamBoard?: boolean;
        permissions?: {
            canInvite: boolean;
            canEdit: boolean;
            canDelete: boolean;
            canArchive: boolean;
        };
    };
    status?: 'active' | 'archived' | 'completed';
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
    archivedAt?: Date;
    completedAt?: Date;
}

const BoardSchema: Schema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
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
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            enum: ['owner', 'admin', 'member', 'viewer'],
            default: 'member',
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        },
        lastActive: {
            type: Date,
        },
    }],
    settings: {
        backgroundColor: {
            type: String,
            default: '#3B82F6',
        },
        isPrivate: {
            type: Boolean,
            default: false,
        },
        isTeamBoard: {
            type: Boolean,
            default: false,
        },
        permissions: {
            canInvite: {
                type: Boolean,
                default: true,
            },
            canEdit: {
                type: Boolean,
                default: true,
            },
            canDelete: {
                type: Boolean,
                default: false,
            },
            canArchive: {
                type: Boolean,
                default: true,
            },
        },
    },
    status: {
        type: String,
        enum: ['active', 'archived', 'completed'],
        default: 'active',
    },
    tags: [{
        type: String,
        trim: true,
    }],
    archivedAt: {
        type: Date,
    },
    completedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

BoardSchema.index({ title: 'text' });

export default mongoose.model<IBoard>('Board', BoardSchema);
