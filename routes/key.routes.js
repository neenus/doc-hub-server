import express from 'express';
import { requireAuth, isAdmin } from "../middlewares/auth.middleware.js";

import { generateLink, requestOtp, verifyOtp, cleanupOtp } from "../controllers/key.controller.js";
import keyCleanup from "../utils/keyCleanup.js";

const router = express.Router();

router.route('/').post(requireAuth, isAdmin, generateLink);
router.route('/request-code').post(requestOtp);
router.route('/verify').post(verifyOtp);
router.route('/cleanup').get(requireAuth, keyCleanup);
router.route('/cleanup-otp').get(requireAuth, cleanupOtp);

export default router;