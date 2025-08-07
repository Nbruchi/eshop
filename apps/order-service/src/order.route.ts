import isAuthenticated from '@packages/error-handler/isAuthenticated';
import { Router } from 'express';
import {
  createPaymentIntent,
  createPaymentSession,
  getAllOrders,
  getOrderDetails,
  getSellerOrders,
  getUserOrders,
  updateDeliveryStatus,
  verifyCoupon,
  verifyPaymentSession,
} from './order.controller';
import { isSeller } from '@packages/error-handler/authorizeRoles';

const router = Router();

router.post('/create-payment-intent', isAuthenticated, createPaymentIntent);
router.post('/create-payment-session', isAuthenticated, createPaymentSession);

router.get('/verify-payment-session', isAuthenticated, verifyPaymentSession);
router.get('/get-user-orders', isAuthenticated, getUserOrders);
router.get('/get-seller-orders', isAuthenticated, isSeller, getSellerOrders);
router.get('/get-order-details/:orderId', isAuthenticated, getOrderDetails);
router.get('/get-all-orders', getAllOrders);

router.put(
  '/update-status/:orderId',
  isAuthenticated,
  isSeller,
  updateDeliveryStatus
);
router.put('/verify-coupon', isAuthenticated, verifyCoupon);

export default router;
