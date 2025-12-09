import express from 'express';
import { protect } from '../middleware/auth';
import {
    getTeamPerformance,
    getTopPerformer,
    getAverageResponseTime,
    debugUserTeams
} from '../controllers/teamPerformanceController';

const router = express.Router();

router.use(protect);

// Team performance routes
router.route('/').get(getTeamPerformance);
router.route('/top-performer').get(getTopPerformer);
router.route('/response-time').get(getAverageResponseTime);
router.route('/debug-teams').get(debugUserTeams);

export default router;