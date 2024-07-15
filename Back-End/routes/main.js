import express from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { dataFunc, textToSpeechDeepgram } from '../controllers/mainController.js';

//express router a way to modularize route handlers
const router = express.Router();

//sets up the auth middleware on these routes which forces the request to go through
//the callback function before being allowed to access the other routes
router.use(requireAuth);

router.get('/', dataFunc);

router.post('/tts', textToSpeechDeepgram);

export default router;