import isAuthenticated from '@packages/error-handler/isAuthenticated';
import { Router } from 'express';
import { getRecommendedProducts } from './recommendation.controller';

const router = Router();

router.get(
  '/get-recommendation-products',
  isAuthenticated,
  getRecommendedProducts
);

export default router;
