import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { dataFunc } from '../controllers/mainController.js';
import { transcribeURL } from '../controllers/mainController.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', dataFunc);

router.post('/', transcribeURL);

export default router;