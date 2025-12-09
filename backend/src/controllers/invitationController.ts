import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import Invitation from '../models/Invitation';
import Team from '../models/Team';
import User from '../models/User';
import { sendInvitationEmail } from '../utils/emailService';

const generateInvitationToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

export const createInvitation = async (req: any, res: Response) => {
    try {
        const { teamId, email, role = 'member' } = req.body;
        const currentUserId = req.user._id;

        // Check if user is team owner or admin
        const team = await Team.findOne({
            _id: teamId,
            'members.userId': currentUserId
        });

        if (!team) {
            return res.status(404).json({ message: 'Team not found or access denied' });
        }

        const currentMember = team.members.find(m => m.userId.toString() === currentUserId.toString());
        if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
            return res.status(403).json({ message: 'Only team owners and admins can invite members' });
        }

        // Check if user already exists and is already a member
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const existingMember = team.members.find(m => m.userId.toString() === existingUser._id.toString());
            if (existingMember) {
                return res.status(400).json({ message: 'User is already a member of this team' });
            }
        }

        // Check for existing pending invitation
        const existingInvitation = await Invitation.findOne({
            email,
            teamId,
            status: 'pending'
        });

        if (existingInvitation) {
            return res.status(400).json({ message: 'Invitation already sent to this email' });
        }

        // Create new invitation
        const token = generateInvitationToken();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

        const invitation = new Invitation({
            email,
            teamId,
            invitedBy: currentUserId,
            role,
            token,
            expiresAt
        });

        await invitation.save();

        // Send invitation email
        try {
            const teamName = team.name;
            const inviterName = req.user.name;
            const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:3001';
            const invitationLink = `${frontendUrl}/register?invitation_token=${token}`;

            await sendInvitationEmail(email, teamName, inviterName, invitationLink);
        } catch (emailError) {
            console.error('Failed to send invitation email:', emailError);
            // Don't fail the whole operation if email fails
        }

        res.status(201).json(invitation);
    } catch (error) {
        res.status(500).json({ message: 'Error creating invitation', error });
    }
};

export const getInvitationByToken = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;

        const invitation = await Invitation.findOne({
            token,
            status: 'pending',
            expiresAt: { $gt: new Date() }
        })
        .populate('teamId', 'name description');

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found or expired' });
        }

        res.json(invitation);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invitation', error });
    }
};

export const acceptInvitation = async (req: Request, res: Response) => {
    try {
        const { token } = req.params;
        const { name, password } = req.body;

        const invitation = await Invitation.findOne({
            token,
            status: 'pending',
            expiresAt: { $gt: new Date() }
        });

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found or expired' });
        }

        // Check if user already exists
        let user = await User.findOne({ email: invitation.email });

        if (!user) {
            // Create new user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            user = await User.create({
                name,
                email: invitation.email,
                password: hashedPassword,
                teams: [invitation.teamId.toString()]
            });
        } else {
            // Add team to existing user
            await User.findByIdAndUpdate(user._id, {
                $addToSet: { teams: invitation.teamId }
            });
        }

        // Add user to team
        const team = await Team.findById(invitation.teamId);
        if (team) {
            team.members.push({
                userId: user._id,
                role: invitation.role,
                status: 'active',
                joinedAt: new Date()
            });
            await team.save();
        }

        // Mark invitation as accepted
        invitation.status = 'accepted';
        await invitation.save();

        res.status(200).json({
            message: 'Invitation accepted successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error accepting invitation', error });
    }
};

export const getUserInvitations = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;

        const invitations = await Invitation.find({
            email: req.user.email,
            status: 'pending',
            expiresAt: { $gt: new Date() }
        })
        .populate('teamId', 'name description')
        .populate('invitedBy', 'name email');

        res.json(invitations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching invitations', error });
    }
};

export const cancelInvitation = async (req: any, res: Response) => {
    try {
        const { invitationId } = req.params;
        const currentUserId = req.user._id;

        const invitation = await Invitation.findById(invitationId);

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' });
        }

        // Check if current user is the inviter or team admin
        const team = await Team.findOne({
            _id: invitation.teamId,
            'members.userId': currentUserId
        });

        if (!team) {
            return res.status(404).json({ message: 'Team not found or access denied' });
        }

        const currentMember = team.members.find(m => m.userId.toString() === currentUserId.toString());
        if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
            return res.status(403).json({ message: 'Only team owners and admins can cancel invitations' });
        }

        invitation.status = 'expired';
        await invitation.save();

        res.json({ message: 'Invitation cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling invitation', error });
    }
};