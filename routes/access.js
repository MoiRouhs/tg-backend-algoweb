import { Router } from 'express';
import { ensureAuth } from "../middlewares/auth.js";
import {testAccess, register, updateAccess, data, listAccess } from '../controllers/access.js';

const router = Router();
router.get('/test', ensureAuth, testAccess);
router.post('/register', ensureAuth, register);
router.put('/update', ensureAuth, updateAccess);
router.get('/data', ensureAuth, data);
router.get('/list/:page?', ensureAuth, listAccess);
export default router ;
