import { Router } from 'express';
import {
  addNewAdmin,
  adminLogin,
  getAdminOrders,
  getAllAdmins,
  getAllCustomizations,
  getAllEvents,
  getAllProducts,
  getAllUsers,
} from './admin.controller';
import isAuthenticated from '@packages/error-handler/isAuthenticated';
import { isAdmin } from '@packages/error-handler/authorizeRoles';

const router = Router();

router.post('/login', adminLogin);
router.put('/add-new-admin', isAuthenticated, isAdmin, addNewAdmin);

router.get('/get-admin-orders', isAuthenticated, isAdmin, getAdminOrders);
router.get('/get-all-products', isAuthenticated, isAdmin, getAllProducts);
router.get('/get-all-events', isAuthenticated, isAdmin, getAllEvents);
router.get('/get-all-admins', isAuthenticated, isAdmin, getAllAdmins);
router.get('/get-all', getAllCustomizations);
router.get('/all-users', isAuthenticated, isAdmin, getAllUsers);
router.get('/all-sellers', isAuthenticated, isAdmin, getAllCustomizations);

export default router;
