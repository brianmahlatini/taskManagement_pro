import { Request, Response } from 'express';
import Board from '../models/Board';
import Team from '../models/Team';

export const getBoards = async (req: any, res: Response) => {
    try {
        const boards = await Board.find({
            'members.userId': req.user._id,
        }).populate('members.userId', 'name email avatarUrl');
        res.json(boards);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createBoard = async (req: any, res: Response) => {
    const { title, teamId, settings, tags, description } = req.body;

    try {
        // Validate required fields
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        // Prepare board data
        const boardData: any = {
            title,
            ownerId: req.user._id,
            members: [{ userId: req.user._id, role: 'owner' }],
            settings: {
                backgroundColor: settings?.backgroundColor || '#3B82F6',
                isPrivate: settings?.isPrivate || false,
                isTeamBoard: !!teamId,
                ...settings
            }
        };

        // Add optional fields if provided
        if (teamId) {
            boardData.teamId = teamId;
        }

        if (tags && tags.length > 0) {
            boardData.tags = tags;
        }

        if (description) {
            boardData.description = description;
        }

        const board = await Board.create(boardData);

        // If teamId is provided, add team members to the board
        if (teamId) {
            // Find the team and add its members to the board
            const team = await Team.findById(teamId);
            if (team) {
                // Add team members to board (excluding the owner who is already added)
                const teamMembers = team.members.filter(
                    member => member.userId.toString() !== req.user._id.toString()
                );

                if (teamMembers.length > 0) {
                    board.members.push(...teamMembers.map(member => ({
                        userId: member.userId,
                        role: member.role === 'owner' ? 'admin' : member.role,
                        joinedAt: new Date(),
                        lastActive: new Date()
                    })));
                }

                // Add board to team's boards array
                team.boards.push(board._id as any);
                await team.save();

                // Update the board with new members
                await board.save();
            }
        }

        res.status(201).json(board);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getBoardById = async (req: any, res: Response) => {
    try {
        const board = await Board.findById(req.params.id)
            .populate('members.userId', 'name email avatarUrl');

        if (board) {
            // Check if user is member
            const isMember = board.members.some(
                (member) => member.userId.toString() === req.user._id.toString()
            );

            if (!isMember && board.settings.isPrivate) {
                return res.status(403).json({ message: 'Not authorized to view this board' });
            }

            res.json(board);
        } else {
            res.status(404).json({ message: 'Board not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateBoard = async (req: any, res: Response) => {
    try {
        const board = await Board.findById(req.params.id);

        if (board) {
            // Check permissions (only owner or admin can update settings)
            // For simplicity allowing any member to update for now, or check role
            const member = board.members.find(
                (m) => m.userId.toString() === req.user._id.toString()
            );

            if (!member || (member.role !== 'owner' && member.role !== 'admin')) {
                return res.status(403).json({ message: 'Not authorized to update this board' });
            }

            board.title = req.body.title || board.title;
            board.settings = { ...board.settings, ...req.body.settings };

            const updatedBoard = await board.save();
            res.json(updatedBoard);
        } else {
            res.status(404).json({ message: 'Board not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const addMember = async (req: any, res: Response) => {
    const { userId, role } = req.body;

    try {
        const board = await Board.findById(req.params.id);

        if (board) {
            // Check if user is already a member
            if (board.members.some((member) => member.userId.toString() === userId)) {
                return res.status(400).json({ message: 'User already a member' });
            }

            board.members.push({ userId, role: role || 'member', joinedAt: new Date(), lastActive: new Date() });
            await board.save();
            res.json(board);
        } else {
            res.status(404).json({ message: 'Board not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const removeMember = async (req: any, res: Response) => {
    try {
        const board = await Board.findById(req.params.id);

        if (board) {
            board.members = board.members.filter(
                (member) => member.userId.toString() !== req.params.userId
            );
            await board.save();
            res.json(board);
        } else {
            res.status(404).json({ message: 'Board not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
