import express, { Router } from 'express';
import {
  createShop,
  createStripeLink,
  getSeller,
  getUser,
  handleRefreshToken,
  registerSeller,
  sellerLogin,
  userForgotPassword,
  userLogin,
  userRegistration,
  userResetPassword,
  verifySeller,
  verifyUser,
  verifyUserForgotPassword,
} from './auth.controller';
import isAuthenticated from '@packages/error-handler/isAuthenticated';
import { isSeller } from '@packages/error-handler/authorizeRoles';

const router: Router = express.Router();

router.post('/register-user', userRegistration);
router.post('/verify-user', verifyUser);
router.post('/login-user', userLogin);
router.post('/refresh-token', handleRefreshToken);
router.post('/forgot-password-user', userForgotPassword);
router.post('/reset-password-user', userResetPassword);
router.post('/verify-forgot-password-user', verifyUserForgotPassword);
router.get('/logged-in-user', isAuthenticated, getUser);

router.post('/register-seller', registerSeller);
router.post('/verify-seller', verifySeller);
router.post('/create-shop', createShop);
router.get('/logged-in-seller', isAuthenticated, isSeller, getSeller);
router.post('/create-stripe-link', createStripeLink);
router.post('/login-seller', sellerLogin);

export default router;
