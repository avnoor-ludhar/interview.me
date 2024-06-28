import express from 'express';
import { loginUser, registerUser, logoutUser, sessionCheck } from '../controllers/userController.js'

const router = express.Router();

router.post("/login", loginUser);

router.post("/register", registerUser);

router.post("/logout", logoutUser);

router.get("/session", sessionCheck)

export default router;