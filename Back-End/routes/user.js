import express from 'express';
import { loginUser, registerUser, logoutUser, sessionCheck, refreshToken } from '../controllers/userController.js'

const router = express.Router();

//login route
router.post("/login", loginUser);

//register route
router.post("/register", registerUser);

router.post("/logout", logoutUser);

router.get("/session", sessionCheck)

router.get("/refresh-token", refreshToken);

export default router;