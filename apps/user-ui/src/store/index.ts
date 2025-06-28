import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Product = {
  id: string;
  title: string;
  description: string;
  detailedDescription?: any;
  warranty: string;
  customSpecifications?: any;
  customProperties: any;
  slug: string;
  tags: string[];
  category: string;
  subcategory: string;
  cashOnDelivery: boolean;
  brand: string;
  videoUrl?: string;
  regularPrice: number;
  salePrice: number;
  stock: number;
  totalSales: number;
  sellerId: string;
  discountCodes: string[];
  images: {
    id: string;
    fileId: string;
    fileUrl: string;
    userId?: string;
    shopId?: string;
    productId?: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
  colors: string[];
  sizes: string[];
  ratings: number;
  startingDate?: Date;
  endingDate?: Date;
  isDeleted?: boolean;
  deletedAt?: Date;
  status: 'Active' | 'Pending' | 'Draft';
  shopId: string;
  shop: {
    id: string;
    name: string;
    bio?: string;
    category: string;
    avatar?: {
      id: string;
      fileId: string;
      fileUrl: string;
    };
    coverBanner?: string;
    address: string;
    opening_hours?: string;
    website?: string;
    socialLInks: any[];
    ratings: number;
    sellerId: string;
  };
  seller: {
    id: string;
    name: string;
    email: string;
    phone: string;
    country: string;
    stripeId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

type Store = {
  cart: Product[];
  wishlist: Product[];
  addToCart: (
    product: Product,
    user: any,
    location: string,
    deviceInfo: string
  ) => void;
  removeFromCart: (
    id: string,
    user: any,
    location: string,
    deviceInfo: string
  ) => void;
  addToWishlist: (
    product: Product,
    user: any,
    location: string,
    deviceInfo: string
  ) => void;
  removeFromWishlist: (
    id: string,
    user: any,
    location: string,
    deviceInfo: string
  ) => void;
};

// export const useStore = create<Store>()(
//     persist((set, get) => ({
//         cart: [],
//         wishlist: [],
//         addToCart: (product, user, location, deviceInfo) => {
//             set((state) => {
//                 const existing = state.cart?.find((item) => item.id === product.id);
//                 if (existing) {
//                     return {
//                         cart: state.cart.map((item) => item.id === product.id ? { ...item, quantity: item.stock + 1 } : item)
//                     }
//                 }
//                 return {
//             }
//         }
//     }))
// )
