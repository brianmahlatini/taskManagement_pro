import express from 'express';
import { getAllUsers, getUserById, updateUser, deleteUser, createUser, searchUsers } from '../controllers/userController';
import { protect, adminOnly } from '../middleware/auth';

const router = express.Router();

router.route('/')
    .get(protect, adminOnly, getAllUsers)
    .post(protect, adminOnly, createUser);

router.route('/search')
    .get(protect, adminOnly, searchUsers);

router.route('/:id')
    .get(protect, getUserById)
    .put(protect, updateUser)
    .delete(protect, adminOnly, deleteUser);

export default router;
