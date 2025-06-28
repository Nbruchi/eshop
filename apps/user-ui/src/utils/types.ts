export interface ProductImage {
  fileUrl: string;
  fileId: string;
}

export interface Product {
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
}
