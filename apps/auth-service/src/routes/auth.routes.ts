import express, { Router } from 'express';
import { userRegistration, verifyUser } from '../controller/auth.controller';

const router: Router = express.Router();

router.post('/api/user-registration', userRegistration);
router.post('/api/verify-user', verifyUser);

export default router;
