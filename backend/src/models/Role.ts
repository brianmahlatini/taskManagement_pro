import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
    name: string;
    description: string;
    permissions: string[];
    isDefault: boolean;
    createdBy: mongoose.Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const RoleSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    permissions: {
        type: [String],
        required: true,
        default: [],
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});

// Default roles and permissions
const defaultRoles = [
    {
        name: 'super_admin',
        description: 'System administrator with full access',
        permissions: [
            'create_user', 'read_user', 'update_user', 'delete_user',
            'create_role', 'read_role', 'update_role', 'delete_role',
            'create_board', 'read_board', 'update_board', 'delete_board',
            'manage_permissions', 'view_all', 'edit_all', 'delete_all',
            'create_team', 'manage_team', 'delete_team'
        ],
        isDefault: true,
    },
    {
        name: 'admin',
        description: 'Administrator with most access',
        permissions: [
            'create_user', 'read_user', 'update_user',
            'read_role',
            'create_board', 'read_board', 'update_board', 'delete_board',
            'create_team', 'manage_team',
            'view_all', 'edit_all'
        ],
        isDefault: true,
    },
    {
        name: 'editor',
        description: 'Can edit content but not manage users',
        permissions: [
            'read_user',
            'create_board', 'read_board', 'update_board',
            'edit_all'
        ],
        isDefault: true,
    },
    {
        name: 'viewer',
        description: 'Read-only access',
        permissions: [
            'read_user',
            'read_board',
            'view_all'
        ],
        isDefault: true,
    },
    {
        name: 'member',
        description: 'Basic team member',
        permissions: [
            'read_board',
            'view_all'
        ],
        isDefault: true,
    }
];

// Seed default roles
RoleSchema.statics.seedDefaultRoles = async function() {
    try {
        const count = await this.countDocuments();
        if (count === 0) {
            for (const role of defaultRoles) {
                const newRole = new this(role);
                await newRole.save();
                console.log(`Seeded default role: ${role.name}`);
            }
        }
    } catch (error) {
        console.error('Error seeding default roles:', error);
    }
};

export default mongoose.model<IRole>('Role', RoleSchema);