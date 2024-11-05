import { Router } from 'express';
import { ensureAuth } from "../middlewares/auth.js";
import {testAccess } from '../controllers/access.js';

const router = Router();
router.get('/test', ensureAuth, testAccess);
export default router ;
