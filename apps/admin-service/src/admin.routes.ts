import { Router } from 'express';
import {
  addNewAdmin,
  adminLogin,
  getAllUsers,
  getAllAdmins,
  getAllEvents,
  getAdminOrders,
  getAllProducts,
  allNotifications,
  userNotifications,
  getAllCustomizations,
} from './admin.controller';
import isAuthenticated from '@packages/error-handler/isAuthenticated';
import { isAdmin } from '@packages/error-handler/authorizeRoles';

const router = Router();

router.get(
  '/get-all-notifications',
  isAuthenticated,
  isAdmin,
  allNotifications
);
router.post('/login', adminLogin);
router.get('/get-all', getAllCustomizations);
router.get('/all-users', isAuthenticated, isAdmin, getAllUsers);
router.put('/add-new-admin', isAuthenticated, isAdmin, addNewAdmin);
router.get('/get-all-events', isAuthenticated, isAdmin, getAllEvents);
router.get('/get-all-admins', isAuthenticated, isAdmin, getAllAdmins);
router.get('/get-user-notificatins', isAuthenticated, userNotifications);
router.get('/get-admin-orders', isAuthenticated, isAdmin, getAdminOrders);
router.get('/get-all-products', isAuthenticated, isAdmin, getAllProducts);
router.get('/all-sellers', isAuthenticated, isAdmin, getAllCustomizations);

export default router;
