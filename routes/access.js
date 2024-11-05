import { Router } from 'express';
import {testAccess } from '../controllers/access.js';

const router = Router();
router.get('/test', testAccess);
export default router ;
