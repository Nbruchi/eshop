import { isSeller } from './../../../packages/error-handler/authorizeRoles';
import isAuthenticated from '@packages/error-handler/isAuthenticated';
import { Router } from 'express';
import {
  createDiscountCode,
  createProduct,
  deleteDiscountCode,
  deleteProduct,
  deleteProductImage,
  getAllEvents,
  getAllProducts,
  getCategories,
  getDiscountCodes,
  getFilteredEvents,
  getFilteredProducts,
  getFilteredShops,
  getProductDetails,
  getShopProducts,
  restoreProduct,
  searchProducts,
  topShops,
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
router.get('/get-all-products', getAllProducts);
router.get('/get-product/:slug', getProductDetails);
router.get('/get-filtered-products', getFilteredProducts);
router.get('/get-filtered-events', getFilteredEvents);
router.get('/get-filtered-shops', getFilteredShops);
router.get('/search-products', searchProducts);
router.get('/top-shops', topShops);
router.get('/get-all-events', getAllEvents);

export default router;
