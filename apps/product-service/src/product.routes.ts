import { isSeller } from './../../../packages/error-handler/authorizeRoles';
import isAuthenticated from '@packages/error-handler/isAuthenticated';
import { Router } from 'express';
import {
  createDiscountCode,
  createProduct,
  deleteDiscountCode,
  deleteProductImage,
  getCategories,
  getDiscountCodes,
  getShopProducts,
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
router.get('/get-discount-codes', isAuthenticated, isSeller, getDiscountCodes);
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

export default router;
