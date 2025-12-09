import { Request, Response } from 'express';
import Board from '../models/Board';
import List from '../models/List';
import Card from '../models/Card';
import Activity from '../models/Activity';
import mongoose from 'mongoose';

export const getBoardAnalytics = async (req: Request, res: Response) => {
    const { boardId } = req.params;

    try {
        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        // 1. Card Counts
        const totalCards = await Card.countDocuments({ boardId });

        // 2. Cards per List
        const lists = await List.find({ boardId });
        const cardsPerList = await Promise.all(
            lists.map(async (list) => {
                const count = await Card.countDocuments({ listId: list._id });
                return { listName: list.title, count };
            })
        );

        // 3. Activity Volume (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const activities = await Activity.find({
            boardId,
            createdAt: { $gte: sevenDaysAgo },
        });

        const activityVolume = activities.reduce((acc: any, curr) => {
            const date = curr.createdAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        // 4. Member Activity
        const memberActivity = await Activity.aggregate([
            { $match: { boardId: new mongoose.Types.ObjectId(boardId) } },
            { $group: { _id: '$actorId', count: { $sum: 1 } } },
            { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
            { $unwind: '$user' },
            { $project: { name: '$user.name', count: 1 } }
        ]);

        // 5. Advanced Analytics: Time-to-complete tasks
        const completedCards = await Card.find({
            boardId,
            'meta.status': 'completed'
        }).sort({ completedAt: -1 }).limit(10);

        const timeToCompleteStats = completedCards.map(card => {
            if (card.createdAt && card.completedAt) {
                const timeDiff = card.completedAt.getTime() - card.createdAt.getTime();
                const hours = timeDiff / (1000 * 60 * 60);
                return {
                    cardId: card._id,
                    cardTitle: card.title,
                    timeToCompleteHours: hours.toFixed(2)
                };
            }
            return null;
        }).filter(Boolean);

        // 6. Throughput calculation (cards completed per day)
        const throughputData = await calculateThroughput(boardId);

        // 7. Team Velocity (average cards completed per sprint/week)
        const teamVelocity = await calculateTeamVelocity(boardId);

        res.json({
            totalCards,
            cardsPerList,
            activityVolume,
            memberActivity,
            timeToCompleteStats,
            throughputData,
            teamVelocity
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

async function calculateThroughput(boardId: string) {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find cards completed in the last 7 days
    const completedCards = await Card.find({
        boardId,
        completedAt: { $gte: sevenDaysAgo, $lte: now }
    });

    // Group by day
    const dailyThroughput = completedCards.reduce((acc: any, card) => {
        if (card.completedAt) {
            const date = card.completedAt.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
        }
        return acc;
    }, {});

    return dailyThroughput;
}

async function calculateTeamVelocity(boardId: string) {
    const now = new Date();
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // Find cards completed in the last 2 weeks
    const completedCards = await Card.find({
        boardId,
        completedAt: { $gte: twoWeeksAgo, $lte: now }
    });

    // Calculate average per week
    const totalCompleted = completedCards.length;
    const averagePerWeek = totalCompleted / 2;

    // Find cards still in progress
    const inProgressCards = await Card.find({
        boardId,
        'meta.status': { $in: ['in-progress', 'todo'] }
    });

    return {
        averagePerWeek,
        currentSprintProgress: {
            completed: totalCompleted,
            inProgress: inProgressCards.length,
            total: totalCompleted + inProgressCards.length
        },
        velocityTrend: averagePerWeek > 5 ? 'high' : averagePerWeek > 2 ? 'medium' : 'low'
    };
}

// New endpoint for advanced analytics
export const getAdvancedAnalytics = async (req: Request, res: Response) => {
    const { boardId } = req.params;
    const { timeRange = '7days' } = req.query;

    try {
        const board = await Board.findById(boardId);
        if (!board) {
            return res.status(404).json({ message: 'Board not found' });
        }

        // Calculate time range
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
            case '30days':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90days':
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 90);
                break;
            case 'all':
                // Find the oldest card on this board
                const oldestCard = await Card.findOne({ boardId }).sort({ createdAt: 1 });
                startDate = oldestCard?.createdAt || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default: // 7 days
                startDate = new Date();
                startDate.setDate(startDate.getDate() - 7);
        }

        // 1. Time-to-complete analysis
        const completedCards = await Card.find({
            boardId,
            completedAt: { $gte: startDate, $lte: now }
        }).sort({ completedAt: -1 });

        const timeToCompleteAnalysis = completedCards.map(card => {
            if (card.createdAt && card.completedAt) {
                const timeDiff = card.completedAt.getTime() - card.createdAt.getTime();
                const hours = timeDiff / (1000 * 60 * 60);
                const days = hours / 24;

                return {
                    cardId: card._id,
                    cardTitle: card.title,
                    timeToCompleteHours: hours.toFixed(2),
                    timeToCompleteDays: days.toFixed(2),
                    completedAt: card.completedAt
                };
            }
            return null;
        }).filter(Boolean);

        // 2. Throughput over time
        const throughputOverTime = await calculateThroughputOverTime(boardId, startDate, now);

        // 3. Team velocity trends
        const velocityTrends = await calculateVelocityTrends(boardId, startDate, now);

        // 4. Cycle time analysis
        const cycleTimeAnalysis = await calculateCycleTimeAnalysis(boardId, startDate, now);

        res.json({
            timeRange: `${timeRange}`,
            startDate,
            endDate: now,
            timeToCompleteAnalysis,
            throughputOverTime,
            velocityTrends,
            cycleTimeAnalysis
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

async function calculateThroughputOverTime(boardId: string, startDate: Date, endDate: Date) {
    // Group by week for better visualization
    const result = await Card.aggregate([
        {
            $match: {
                boardId: new mongoose.Types.ObjectId(boardId),
                completedAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$completedAt" }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 }
        }
    ]);

    return result.map(item => ({
        date: item._id,
        count: item.count
    }));
}

async function calculateVelocityTrends(boardId: string, startDate: Date, endDate: Date) {
    // Calculate weekly velocity
    const weeklyData = await Card.aggregate([
        {
            $match: {
                boardId: new mongoose.Types.ObjectId(boardId),
                completedAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: {
                    year: { $year: "$completedAt" },
                    week: { $week: "$completedAt" }
                },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { "_id.year": 1, "_id.week": 1 }
        }
    ]);

    // Calculate moving average
    const weeklyVelocities = weeklyData.map(item => item.count);
    const movingAverages = [];

    for (let i = 0; i < weeklyVelocities.length; i++) {
        const window = weeklyVelocities.slice(Math.max(0, i - 2), i + 1);
        const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
        movingAverages.push({
            week: `${weeklyData[i]._id.year}-W${weeklyData[i]._id.week.toString().padStart(2, '0')}`,
            velocity: weeklyVelocities[i],
            movingAvg: avg.toFixed(1)
        });
    }

    return movingAverages;
}

async function calculateCycleTimeAnalysis(boardId: string, startDate: Date, endDate: Date) {
    // Find cards that were moved through different stages
    const cardsWithActivities = await Card.aggregate([
        {
            $match: {
                boardId: new mongoose.Types.ObjectId(boardId)
            }
        },
        {
            $lookup: {
                from: "activities",
                localField: "_id",
                foreignField: "meta.cardId",
                as: "activities"
            }
        },
        {
            $match: {
                "activities.createdAt": { $gte: startDate, $lte: endDate }
            }
        }
    ]);

    // Calculate average time in each stage
    const stageTransitions = cardsWithActivities.flatMap(card => {
        const activities = card.activities.sort((a: any, b: any) =>
            a.createdAt - b.createdAt
        );

        const transitions: any[] = [];

        for (let i = 1; i < activities.length; i++) {
            const prevActivity = activities[i - 1];
            const currActivity = activities[i];

            if (prevActivity.actionType.includes('moved') &&
                currActivity.actionType.includes('moved')) {

                const fromStage = prevActivity.meta?.toList || 'unknown';
                const toStage = currActivity.meta?.toList || 'unknown';
                const timeInStage = currActivity.createdAt - prevActivity.createdAt;
                const hoursInStage = timeInStage / (1000 * 60 * 60);

                transitions.push({
                    cardId: card._id,
                    fromStage,
                    toStage,
                    timeInStageHours: hoursInStage.toFixed(2),
                    transitionDate: currActivity.createdAt
                });
            }
        }

        return transitions;
    });

    // Group by stage transitions
    const stageTransitionStats: Record<string, {count: number, totalHours: number}> = {};

    stageTransitions.forEach(transition => {
        const key = `${transition.fromStage}→${transition.toStage}`;
        if (!stageTransitionStats[key]) {
            stageTransitionStats[key] = { count: 0, totalHours: 0 };
        }
        stageTransitionStats[key].count++;
        stageTransitionStats[key].totalHours += parseFloat(transition.timeInStageHours);
    });

    // Calculate averages
    const stageTransitionAverages = Object.entries(stageTransitionStats).map(([key, stats]) => ({
        transition: key,
        averageHours: (stats.totalHours / stats.count).toFixed(2),
        count: stats.count
    }));

    return {
        totalTransitions: stageTransitions.length,
        stageTransitionAverages,
        mostCommonBottleneck: stageTransitionAverages.length > 0
            ? stageTransitionAverages.sort((a, b) => parseFloat(b.averageHours) - parseFloat(a.averageHours))[0]
            : null
    };
}
