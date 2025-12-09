import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    avatarUrl?: string;
    roles: string[]; // Dynamic roles (e.g., ['admin', 'editor', 'viewer'])
    role?: string; // Job title/position
    department?: string;
    location?: string;
    phone?: string;
    status?: 'online' | 'away' | 'offline';
    joinDate?: Date;
    lastSeen: Date;
    teams?: mongoose.Schema.Types.ObjectId[];
    permissions?: string[]; // Granular permissions (e.g., ['create_board', 'delete_user'])
    isSuperAdmin?: boolean; // Super admin flag for system-level access
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    avatarUrl: {
        type: String,
    },
    roles: {
        type: [String],
        default: ['member'],
    },
    permissions: {
        type: [String],
        default: [],
    },
    isSuperAdmin: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        default: 'Team Member',
    },
    department: {
        type: String,
    },
    location: {
        type: String,
    },
    phone: {
        type: String,
    },
    status: {
        type: String,
        enum: ['online', 'away', 'offline'],
        default: 'offline',
    },
    joinDate: {
        type: Date,
        default: Date.now,
    },
    lastSeen: {
        type: Date,
        default: Date.now,
    },
    teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
    }],
}, {
    timestamps: true,
});

export default mongoose.model<IUser>('User', UserSchema);
