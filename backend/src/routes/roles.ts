import express from 'express';
import {
    createRole,
    getRoles,
    getRoleById,
    updateRole,
    deleteRole,
    getAllPermissions,
    seedDefaultRoles
} from '../controllers/roleController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

// Role routes
router.route('/')
    .post(createRole)
    .get(getRoles);

router.route('/seed')
    .post(seedDefaultRoles);

router.route('/permissions')
    .get(getAllPermissions);

router.route('/:id')
    .get(getRoleById)
    .put(updateRole)
    .delete(deleteRole);

export default router;