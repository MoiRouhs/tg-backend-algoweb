import { Router } from 'express';
import { ensureAuth } from "../middlewares/auth.js";
import { testUser, register, login, updateUser } from '../controllers/user.js';

const router = Router();
router.get('/test', testUser);
router.post('/register', register);
router.post('/login', login);
router.put('/update', ensureAuth, updateUser);
export default router ;
