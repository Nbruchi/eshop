import { isSeller } from './../../../packages/error-handler/authorizeRoles';
import isAuthenticated from '@packages/error-handler/isAuthenticated';
import { Router } from 'express';
import {
  createDiscountCode,
  createProduct,
  deleteDiscountCode,
  deleteProduct,
  deleteProductImage,
  getAllProducts,
  getCategories,
  getDiscountCodes,
  getShopProducts,
  getStripeAccount,
  restoreProduct,
  uploadProductImage,
} from './product.controller';

const router = Router();

router.get('/get-categories', getCategories);
router.post(
  '/create-discount-code',
  isAuthenticated,
  isSeller,
  createDiscountCode
);
router.get('/get-discount-codes', isAuthenticated, getDiscountCodes);
router.delete(
  '/delete-discount-code/:id',
  isAuthenticated,
  isSeller,
  deleteDiscountCode
);

router.post(
  '/upload-product-image',
  isAuthenticated,
  isSeller,
  uploadProductImage
);

router.delete(
  '/delete-product-image/:fileId',
  isAuthenticated,
  isSeller,
  deleteProductImage
);

router.post('/create-product', isAuthenticated, isSeller, createProduct);

router.get('/get-shop-products', isAuthenticated, getShopProducts);

router.delete('/delete-product/:id', isAuthenticated, isSeller, deleteProduct);
router.put('/restore-product/:id', isAuthenticated, isSeller, restoreProduct);
router.get('/get-stripe-account', isAuthenticated, isSeller, getStripeAccount);
router.get('/get-all-products', getAllProducts);

export default router;
