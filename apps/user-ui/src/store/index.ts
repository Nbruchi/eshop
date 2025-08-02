import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sendKafkaEvent } from '../actions/track-user';

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
    location: { country: string; city: string } | null,
    deviceInfo: any
  ) => void;
  removeFromCart: (
    id: string,
    user: any,
    location: { country: string; city: string } | null,
    deviceInfo: any
  ) => void;
  addToWishlist: (
    product: Product,
    user: any,
    location: { country: string; city: string } | null,
    deviceInfo: any
  ) => void;
  removeFromWishlist: (
    id: string,
    user: any,
    location: { country: string; city: string } | null,
    deviceInfo: any
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
          return {
            cart: [...state.cart, { ...product, quantity: product.quantity }],
          };
        });
        // Send kafka event
        if (user?.id && location && deviceInfo) {
          sendKafkaEvent({
            userId: user?.id,
            productId: product?.id,
            shopId: product?.shopId,
            action: 'add_to_cart',
            country: location.country || 'Unknown',
            city: location.city || 'Unknown',
            device: deviceInfo || 'Unknown Device',
          });
        }
      },
      //   Remove from cart
      removeFromCart: (id, user, location, deviceInfo) => {
        // Find product
        const productToRemove = get().cart.find((item) => item.id === id);
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        }));
        if (user?.id && location && deviceInfo && productToRemove) {
          sendKafkaEvent({
            userId: user?.id,
            productId: productToRemove?.id,
            shopId: productToRemove?.shopId,
            action: 'remove_from_cart',
            country: location.country || 'Unknown',
            city: location.city || 'Unknown',
            device: deviceInfo || 'Unknown Device',
          });
        }
      },
      // Add to wishlist
      addToWishlist: (product, user, location, deviceInfo) => {
        set((state) => ({
          wishlist: [...state.wishlist, { ...product, quantity: 1 }],
        }));
        if (user?.id && location && deviceInfo) {
          sendKafkaEvent({
            userId: user?.id,
            productId: product?.id,
            shopId: product?.shopId,
            action: 'add_to_wishlist',
            country: location.country || 'Unknown',
            city: location.city || 'Unknown',
            device: deviceInfo || 'Unknown Device',
          });
        }
      },
      // Remove from wishlist
      removeFromWishlist: (id, user, location, deviceInfo) => {
        const productToRemove = get().wishlist.find((item) => item.id === id);

        set((state) => ({
          wishlist: state.wishlist.filter((item) => item.id !== id),
        }));
        if (user?.id && location && deviceInfo && productToRemove) {
          sendKafkaEvent({
            userId: user?.id,
            productId: productToRemove?.id,
            shopId: productToRemove?.shopId,
            action: 'remove_from_wishlist',
            country: location.country || 'Unknown',
            city: location.city || 'Unknown',
            device: deviceInfo || 'Unknown Device',
          });
        }
      },
    }),
    { name: 'store-storage' }
  )
);
