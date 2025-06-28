import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Product = {
  id: string;
  title: string;
  image: string;
  price: number;
  quantity?: number;
  shopId: string;
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

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      // Add to cart
      addToCart: (product, user, location, deviceInfo) => {
        set((state) => {
          const existing = state.cart?.find((item) => item.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: (item.quantity ?? 1) + 1 }
                  : item
              ),
            };
          }
          return { cart: [...state.cart, { ...product, quantity: 1 }] };
        });
      },
      //   Remove from cart
      removeFromCart: (id, user, location, deviceInfo) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        }));
      },
      // Add to wishlist
      addToWishlist: (product, user, location, deviceInfo) => {
        set((state) => ({
          wishlist: [...state.wishlist, { ...product, quantity: 1 }],
        }));
      },
      // Remove from wishlist
      removeFromWishlist: (id, user, location, deviceInfo) => {
        set((state) => ({
          wishlist: state.wishlist.filter((item) => item.id !== id),
        }));
      },
    }),
    { name: 'store-storage' }
  )
);
