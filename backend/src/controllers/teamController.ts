import { Request, Response } from 'express';
import Team from '../models/Team';
import Board from '../models/Board';
import User from '../models/User';

// Create a new team
export const createTeam = async (req: any, res: Response) => {
    try {
        const { name, description, isPrivate = false } = req.body;
        const userId = req.user._id;

        // Check if team with same name already exists
        const existingTeam = await Team.findOne({ name });
        if (existingTeam) {
            return res.status(400).json({ message: 'Team with this name already exists' });
        }

        const team = new Team({
            name,
            description,
            ownerId: userId,
            members: [{
                userId: userId,
                role: 'owner',
                status: 'active'
            }],
            settings: {
                isPrivate,
                autoApproveMembers: true,
                maxMembers: 50
            }
        });

        await team.save();

        // Add team reference to user (if User model has teams array)
        await User.findByIdAndUpdate(userId, {
            $addToSet: { teams: team._id }
        });

        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ message: 'Error creating team', error });
    }
};

// Get all teams for the current user
export const getUserTeams = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;

        const teams = await Team.find({
            'members.userId': userId
        })
        .populate('ownerId', 'name email avatarUrl')
        .populate('members.userId', 'name email avatarUrl')
        .sort({ updatedAt: -1 });

        res.json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching teams', error });
    }
};

// Get a specific team by ID
export const getTeamById = async (req: any, res: Response) => {
    try {
        const { teamId } = req.params;
        const userId = req.user._id;

        const team = await Team.findOne({
            _id: teamId,
            'members.userId': userId
        })
        .populate('ownerId', 'name email avatarUrl')
        .populate('members.userId', 'name email avatarUrl')
        .populate('boards');

        if (!team) {
            return res.status(404).json({ message: 'Team not found or access denied' });
        }

        res.json(team);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching team', error });
    }
};

// Update team information
export const updateTeam = async (req: any, res: Response) => {
    try {
        const { teamId } = req.params;
        const { name, description, settings } = req.body;
        const userId = req.user._id;

        // Check if user is team owner or admin
        const team = await Team.findOne({
            _id: teamId,
            'members.userId': userId
        });

        if (!team) {
            return res.status(404).json({ message: 'Team not found or access denied' });
        }

        const member = team.members.find(m => m.userId.toString() === userId.toString());
        if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
            return res.status(403).json({ message: 'Only team owners and admins can update team settings' });
        }

        // Update team fields
        if (name) team.name = name;
        if (description) team.description = description;
        if (settings) {
            team.settings = { ...team.settings, ...settings };
        }

        const updatedTeam = await team.save();
        res.json(updatedTeam);
    } catch (error) {
        res.status(500).json({ message: 'Error updating team', error });
    }
};

// Add member to team
export const addTeamMember = async (req: any, res: Response) => {
    try {
        const { teamId } = req.params;
        const { userId: newUserId, role = 'member' } = req.body;
        const currentUserId = req.user._id;

        // Check if current user is team owner or admin
        const team = await Team.findOne({
            _id: teamId,
            'members.userId': currentUserId
        });

        if (!team) {
            return res.status(404).json({ message: 'Team not found or access denied' });
        }

        const currentMember = team.members.find(m => m.userId.toString() === currentUserId.toString());
        if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
            return res.status(403).json({ message: 'Only team owners and admins can add members' });
        }

        // Check if user is already a member
        const existingMember = team.members.find(m => m.userId.toString() === newUserId);
        if (existingMember) {
            return res.status(400).json({ message: 'User is already a member of this team' });
        }

        // Check if team is private and requires approval
        if (team.settings.isPrivate && !team.settings.autoApproveMembers) {
            team.members.push({
                userId: newUserId,
                role: role,
                status: 'pending',
                joinedAt: new Date()
            });
        } else {
            team.members.push({
                userId: newUserId,
                role: role,
                status: 'active',
                joinedAt: new Date()
            });
        }

        await team.save();

        // Add team reference to user
        await User.findByIdAndUpdate(newUserId, {
            $addToSet: { teams: team._id }
        });

        res.json(team);
    } catch (error) {
        res.status(500).json({ message: 'Error adding team member', error });
    }
};

// Remove member from team
export const removeTeamMember = async (req: any, res: Response) => {
    try {
        const { teamId, userId } = req.params;
        const currentUserId = req.user._id;

        // Check if current user is team owner or admin
        const team = await Team.findOne({
            _id: teamId,
            'members.userId': currentUserId
        });

        if (!team) {
            return res.status(404).json({ message: 'Team not found or access denied' });
        }

        const currentMember = team.members.find(m => m.userId.toString() === currentUserId.toString());
        if (!currentMember || currentMember.role !== 'owner') {
            return res.status(403).json({ message: 'Only team owners can remove members' });
        }

        // Cannot remove owner
        if (userId === currentUserId) {
            return res.status(400).json({ message: 'Cannot remove yourself as team owner' });
        }

        team.members = team.members.filter(m => m.userId.toString() !== userId);
        await team.save();

        // Remove team reference from user
        await User.findByIdAndUpdate(userId, {
            $pull: { teams: team._id }
        });

        res.json(team);
    } catch (error) {
        res.status(500).json({ message: 'Error removing team member', error });
    }
};

// Add board to team
export const addTeamBoard = async (req: any, res: Response) => {
    try {
        const { teamId, boardId } = req.params;
        const userId = req.user._id;

        // Check if user is team owner or admin
        const team = await Team.findOne({
            _id: teamId,
            'members.userId': userId
        });

        if (!team) {
            return res.status(404).json({ message: 'Team not found or access denied' });
        }

        const currentMember = team.members.find(m => m.userId.toString() === userId.toString());
        if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
            return res.status(403).json({ message: 'Only team owners and admins can add boards' });
        }

        // Check if board already belongs to team
        if (team.boards.includes(boardId)) {
            return res.status(400).json({ message: 'Board already belongs to this team' });
        }

        // Check if board exists and user has access
        const board = await Board.findOne({
            _id: boardId,
            'members.userId': userId
        });

        if (!board) {
            return res.status(404).json({ message: 'Board not found or access denied' });
        }

        team.boards.push(boardId);
        await team.save();

        // Update board to mark as team board
        await Board.findByIdAndUpdate(boardId, {
            $set: {
                'settings.isTeamBoard': true,
                teamId: team._id
            }
        });

        res.json(team);
    } catch (error) {
        res.status(500).json({ message: 'Error adding board to team', error });
    }
};

// Remove board from team
export const removeTeamBoard = async (req: any, res: Response) => {
    try {
        const { teamId, boardId } = req.params;
        const userId = req.user._id;

        // Check if user is team owner or admin
        const team = await Team.findOne({
            _id: teamId,
            'members.userId': userId
        });

        if (!team) {
            return res.status(404).json({ message: 'Team not found or access denied' });
        }

        const currentMember = team.members.find(m => m.userId.toString() === userId.toString());
        if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
            return res.status(403).json({ message: 'Only team owners and admins can remove boards' });
        }

        team.boards = team.boards.filter(b => b.toString() !== boardId);
        await team.save();

        // Update board to mark as personal board
        await Board.findByIdAndUpdate(boardId, {
            $set: {
                'settings.isTeamBoard': false,
                $unset: { teamId: 1 }
            }
        });

        res.json(team);
    } catch (error) {
        res.status(500).json({ message: 'Error removing board from team', error });
    }
};

// Archive a team
export const archiveTeam = async (req: any, res: Response) => {
    try {
        const { teamId } = req.params;
        const userId = req.user._id;

        // Check if user is team owner
        const team = await Team.findOne({
            _id: teamId,
            'members.userId': userId
        });

        if (!team) {
            return res.status(404).json({ message: 'Team not found or access denied' });
        }

        const currentMember = team.members.find(m => m.userId.toString() === userId.toString());
        if (!currentMember || currentMember.role !== 'owner') {
            return res.status(403).json({ message: 'Only team owners can archive teams' });
        }

        team.status = 'archived';
        team.archivedAt = new Date();

        await team.save();

        // Archive all team boards
        await Board.updateMany(
            { _id: { $in: team.boards } },
            { $set: { status: 'archived', archivedAt: new Date() } }
        );

        res.json(team);
    } catch (error) {
        res.status(500).json({ message: 'Error archiving team', error });
    }
};