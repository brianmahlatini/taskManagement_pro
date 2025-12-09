import { Request, Response } from 'express';
import Role from '../models/Role';
import { protect } from '../middleware/auth';

// Create a new role
export const createRole = async (req: Request, res: Response) => {
    try {
        const { name, description, permissions } = req.body;
        const userId = req.user?._id;

        // Check if role already exists
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ message: 'Role already exists' });
        }

        // Create new role
        const role = new Role({
            name,
            description,
            permissions,
            createdBy: userId,
        });

        await role.save();
        res.status(201).json(role);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get all roles
export const getRoles = async (req: Request, res: Response) => {
    try {
        const roles = await Role.find().sort({ createdAt: -1 });
        res.json(roles);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get role by ID
export const getRoleById = async (req: Request, res: Response) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.json(role);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Update role
export const updateRole = async (req: Request, res: Response) => {
    try {
        const { name, description, permissions } = req.body;

        const role = await Role.findByIdAndUpdate(
            req.params.id,
            { name, description, permissions },
            { new: true }
        );

        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        res.json(role);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Delete role
export const deleteRole = async (req: Request, res: Response) => {
    try {
        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Prevent deletion of default roles
        if (role.isDefault) {
            return res.status(400).json({ message: 'Cannot delete default role' });
        }

        await Role.findByIdAndDelete(req.params.id);
        res.json({ message: 'Role deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get all permissions (for UI dropdown)
export const getAllPermissions = async (req: Request, res: Response) => {
    try {
        // List of all available permissions in the system
        const allPermissions = [
            // User management
            'create_user', 'read_user', 'update_user', 'delete_user',
            // Role management
            'create_role', 'read_role', 'update_role', 'delete_role',
            // Board management
            'create_board', 'read_board', 'update_board', 'delete_board',
            // Team management
            'create_team', 'manage_team', 'delete_team',
            // System permissions
            'manage_permissions', 'view_all', 'edit_all', 'delete_all',
            // Content permissions
            'create_card', 'update_card', 'delete_card',
            'create_comment', 'delete_comment',
            // Admin permissions
            'manage_settings', 'view_audit_logs', 'export_data'
        ];

        res.json(allPermissions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Seed default roles
export const seedDefaultRoles = async (req: Request, res: Response) => {
    try {
        await Role.seedDefaultRoles();
        res.json({ message: 'Default roles seeded successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};