import isAuthenticated from '@packages/error-handler/isAuthenticated';
import { Router } from 'express';
import {
  createPaymentIntent,
  createPaymentSession,
  verifyPaymentSession,
} from './order.controller';

const router = Router();

router.post('/create-payment-intent', isAuthenticated, createPaymentIntent);
router.post('/create-payment-session', isAuthenticated, createPaymentSession);
router.get('/verify-payment-session', isAuthenticated, verifyPaymentSession);

export default router;
