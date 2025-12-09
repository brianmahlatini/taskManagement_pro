import express from 'express';
import { protect } from '../middleware/auth';
import {
    createTeam,
    getUserTeams,
    getTeamById,
    updateTeam,
    addTeamMember,
    removeTeamMember,
    addTeamBoard,
    removeTeamBoard,
    archiveTeam
} from '../controllers/teamController';

const router = express.Router();

router.use(protect);

// Team routes
router.route('/').get(getUserTeams).post(createTeam);
router.route('/:teamId').get(getTeamById).put(updateTeam);
router.route('/:teamId/archive').post(archiveTeam);

// Team member routes
router.route('/:teamId/members').post(addTeamMember);
router.route('/:teamId/members/:userId').delete(removeTeamMember);

// Team board routes
router.route('/:teamId/boards/:boardId').post(addTeamBoard).delete(removeTeamBoard);

export default router;