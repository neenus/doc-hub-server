import express from 'express';
import { requireAuth, isAdmin } from "../middlewares/auth.middleware.js";

import { getUsers, getUser, updateUser, deleteUser, resetUserPassword } from '../controllers/users.controller.js';

const router = express.Router();

router.route('/').get(requireAuth, isAdmin, getUsers);
router.route('/:id')
  .get(requireAuth, isAdmin, getUser)
  .put(requireAuth, updateUser)
  .delete(requireAuth, isAdmin, deleteUser)
router.route('/:id/reset-password').post(requireAuth, isAdmin, resetUserPassword);

export default router;