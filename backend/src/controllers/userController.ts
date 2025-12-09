import { Request, Response } from 'express';
import User from '../models/User';

export const getAllUsers = async (req: any, res: Response) => {
    try {
        // Check if user is admin
        if (req.user.roles.includes('admin') || req.user.isSuperAdmin) {
            const users = await User.find()
                .select('-password')
                .sort('name');

            res.json(users);
        } else {
            res.status(403).json({ message: 'Not authorized to view all users' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserById = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password');

        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUser = async (req: any, res: Response) => {
    try {
        // Check if user is admin or updating themselves
        const isAdmin = req.user.roles.includes('admin') || req.user.isSuperAdmin;
        const isSelf = req.user._id.toString() === req.params.id;

        if (!isAdmin && !isSelf) {
            return res.status(403).json({ message: 'Not authorized to update this user' });
        }

        const user = await User.findById(req.params.id);

        if (user) {
            // Prevent non-admins from changing roles
            if (!isAdmin && req.body.roles) {
                return res.status(403).json({ message: 'Not authorized to change user roles' });
            }

            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.avatarUrl = req.body.avatarUrl || user.avatarUrl;
            user.status = req.body.status || user.status;

            if (isAdmin && req.body.roles) {
                user.roles = req.body.roles;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                roles: updatedUser.roles,
                avatarUrl: updatedUser.avatarUrl,
                status: updatedUser.status,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser = async (req: any, res: Response) => {
    try {
        // Only super admins can delete users
        if (!req.user.isSuperAdmin) {
            return res.status(403).json({ message: 'Not authorized to delete users' });
        }

        // Prevent deleting self
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        const user = await User.findByIdAndDelete(req.params.id);

        if (user) {
            res.json({ message: 'User deleted successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createUser = async (req: any, res: Response) => {
    try {
        // Only admins can create users
        if (!req.user.roles.includes('admin') && !req.user.isSuperAdmin) {
            return res.status(403).json({ message: 'Not authorized to create users' });
        }

        const { name, email, password, roles } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password,
            roles: roles || ['member'],
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            roles: user.roles,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const searchUsers = async (req: any, res: Response) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
            ],
        }).select('-password');

        res.json(users);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
