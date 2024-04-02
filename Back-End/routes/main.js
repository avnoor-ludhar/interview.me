import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { dataFunc } from '../controllers/mainController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', dataFunc);

export default router;