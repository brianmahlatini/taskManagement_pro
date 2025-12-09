import { Request, Response } from 'express';
import Team from '../models/Team';
import User from '../models/User';
import Board from '../models/Board';
import Activity from '../models/Activity';

// Get team performance metrics
export const getTeamPerformance = async (req: any, res: Response) => {
    try {
        const { teamId } = req.query;
        const userId = req.user._id;

        let team;
        if (teamId) {
            // Check if user is part of the team
            team = await Team.findOne({
                _id: teamId,
                'members.userId': userId
            });
        } else {
            // Get all teams user is part of
            const userTeams = await Team.find({
                'members.userId': userId
            });

            if (userTeams.length === 0) {
                return res.json({
                    members: [],
                    topPerformer: null,
                    averageResponseTime: '0 hours'
                });
            }

            // For dashboard, use the first team or combine data
            team = userTeams[0];
        }

        if (!team) {
            return res.status(404).json({ message: 'Team not found or access denied' });
        }

        // Get team members with their performance data
        const memberPerformance = await Promise.all(
            team.members.map(async (member) => {
                // Get user details
                const user = await User.findById(member.userId);

                // Calculate tasks completed (from activities)
                const activities = await Activity.find({
                    actorId: member.userId,
                    actionType: { $in: ['card_created', 'card_completed', 'card_moved'] }
                });

                // Calculate efficiency score (simplified)
                const efficiencyScore = Math.min(95, 80 + (activities.length * 2));

                // Get last active time
                const lastActivity = await Activity.findOne({
                    actorId: member.userId
                }).sort('-createdAt');

                return {
                    userId: member.userId,
                    user: user ? {
                        _id: user._id,
                        name: user.name,
                        avatarUrl: user.avatarUrl,
                        email: user.email
                    } : null,
                    tasksCompleted: activities.length,
                    efficiencyScore,
                    status: user?.status || 'offline',
                    lastActive: lastActivity?.createdAt || new Date(),
                    performanceTrend: activities.length > 5 ? 'up' : 'stable'
                };
            })
        );

        // Calculate top performer
        const topPerformer = memberPerformance.reduce((top, current) =>
            current.efficiencyScore > top.efficiencyScore ? current : top,
            memberPerformance[0] || null
        );

        // Calculate average response time (simplified)
        const recentActivities = await Activity.find({
            actorId: { $in: team.members.map(m => m.userId) },
            actionType: 'comment_added'
        }).sort('-createdAt').limit(10);

        const responseTimes = recentActivities.map((activity, index, arr) => {
            if (index === 0) return 0;
            return (activity.createdAt.getTime() - arr[index - 1].createdAt.getTime()) / (1000 * 60 * 60);
        }).filter(t => t > 0);

        const avgResponseTime = responseTimes.length > 0
            ? (responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length).toFixed(1) + ' hours'
            : 'N/A';

        res.json({
            members: memberPerformance,
            topPerformer,
            averageResponseTime: avgResponseTime
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Get top performer for a team
export const getTopPerformer = async (req: any, res: Response) => {
    try {
        const { teamId } = req.query;
        const userId = req.user._id;

        let team;
        if (teamId) {
            team = await Team.findOne({
                _id: teamId,
                'members.userId': userId
            });
            console.log(`Looking for team ${teamId} with user ${userId}, found: ${team ? 'YES' : 'NO'}`);
        } else {
            const userTeams = await Team.find({
                'members.userId': userId
            });

            console.log(`Found ${userTeams.length} teams for user ${userId}`);
            if (userTeams.length > 0) {
                console.log('User teams:', userTeams.map(t => t._id));
            }

            if (userTeams.length === 0) {
                console.warn('No teams found for user - this should not happen if teams were added');
                return res.json({
                    _id: null,
                    name: 'N/A',
                    avatarUrl: '',
                    email: '',
                    activityCount: 0,
                    lastActive: new Date()
                });
            }

            team = userTeams[0];
        }
        if (!team) {
            return res.status(404).json({ message: 'Team not found or access denied' });
        }

        // Find member with most activities
        const activities = await Activity.aggregate([
            { $match: { actorId: { $in: team.members.map(m => m.userId) } } },
            { $group: {
                _id: '$actorId',
                count: { $sum: 1 },
                lastActivity: { $max: '$createdAt' }
            }},
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        if (activities.length === 0) {
            return res.json({
                _id: null,
                name: 'N/A',
                avatarUrl: '',
                email: '',
                activityCount: 0,
                lastActive: new Date()
            });
        }

        const topPerformerId = activities[0]._id;
        const user = await User.findById(topPerformerId);

        res.json({
            _id: topPerformerId,
            name: user?.name || 'Unknown',
            avatarUrl: user?.avatarUrl || '',
            email: user?.email || '',
            activityCount: activities[0].count,
            lastActive: activities[0].lastActivity
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Debug endpoint to check user's team memberships
export const debugUserTeams = async (req: any, res: Response) => {
    try {
        const userId = req.user._id;

        console.log('Debug: Checking teams for user:', userId);

        // Find all teams where user is a member
        const userTeams = await Team.find({
            'members.userId': userId
        });

        console.log('Debug: Found teams:', userTeams.length);

        if (userTeams.length === 0) {
            console.log('Debug: No teams found for user - this explains the issue!');
            return res.json({
                message: 'No teams found for current user',
                userId: userId,
                teamsCount: 0,
                debugInfo: 'User is not a member of any teams'
            });
        }

        // Show details of found teams
        const teamDetails = userTeams.map(team => ({
            teamId: team._id,
            teamName: team.name,
            userRole: team.members.find(m => m.userId.toString() === userId.toString())?.role || 'unknown',
            memberCount: team.members.length,
            status: team.status
        }));

        console.log('Debug: User team details:', teamDetails);

        res.json({
            message: 'User team memberships',
            userId: userId,
            teamsCount: userTeams.length,
            teams: teamDetails,
            debugInfo: 'User is properly associated with teams'
        });

    } catch (error: any) {
        console.error('Debug error:', error);
        res.status(500).json({ message: 'Error checking team memberships', error: error.message });
    }
};

// Get average response time for a team
export const getAverageResponseTime = async (req: any, res: Response) => {
    try {
        const { teamId } = req.query;
        const userId = req.user._id;

        let team;
        if (teamId) {
            team = await Team.findOne({
                _id: teamId,
                'members.userId': userId
            });
        } else {
            const userTeams = await Team.find({
                'members.userId': userId
            });

            if (userTeams.length === 0) {
                return res.json({ averageResponseTime: 'N/A' });
            }
            team = userTeams[0];
        }

        if (!team) {
            return res.status(404).json({ message: 'Team not found or access denied' });
        }

        // Calculate response time based on comment activities
        const commentActivities = await Activity.find({
            actorId: { $in: team.members.map(m => m.userId) },
            actionType: 'comment_added'
        }).sort('createdAt');

        if (commentActivities.length <= 1) {
            return res.json({ averageResponseTime: 'N/A' });
        }

        const responseTimes = commentActivities.slice(1).map((activity, index) => {
            const prevActivity = commentActivities[index];
            return (activity.createdAt.getTime() - prevActivity.createdAt.getTime()) / (1000 * 60 * 60);
        }).filter(t => t > 0 && t < 24); // Filter out unreasonable times

        const avgResponseTime = responseTimes.length > 0
            ? (responseTimes.reduce((sum, t) => sum + t, 0) / responseTimes.length).toFixed(1) + ' hours'
            : 'N/A';

        res.json({ averageResponseTime: avgResponseTime });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};