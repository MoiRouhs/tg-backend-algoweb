import { Router } from 'express';
import { ensureAuth } from "../middlewares/auth.js";
import { testUser, register, login, updateUser, profile, listUsers } from '../controllers/user.js';

const router = Router();
router.get('/test', testUser);
router.post('/register', register);
router.post('/login', login);
router.put('/update', ensureAuth, updateUser);
router.get('/profile', ensureAuth, profile);
router.get('/list/:page?', ensureAuth, listUsers);
export default router ;
