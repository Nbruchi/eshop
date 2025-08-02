'use client';

import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking';
import useLocationTracking from 'apps/user-ui/src/hooks/useLocationTracking';
import useUser from 'apps/user-ui/src/hooks/useUser';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageSquareText,
  Package,
  ShoppingCart,
  WalletMinimal,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Ratings from '../Ratings';
import Link from 'next/link';
import ReactImageMagnify from 'react-image-magnify';
import { useStore } from 'apps/user-ui/src/store';
import ProductCard from './ProductCard';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';

interface Props {
  product: any;
}

const ProductDetails = ({ product }: Props) => {
  const { user, isLoading } = useUser();
  const addToCart = useStore((state) => state.addToCart);
  const cart = useStore((state) => state.cart);
  const isInCart = cart.some((item) => item.id === product.id);
  const wishlist = useStore((state) => state.wishlist);
  const addToWishlist = useStore((state) => state.addToWishlist);
  const removeFromWishlist = useStore((state) => state.removeFromWishlist);
  const isInWishlist = wishlist.some((item) => item.id === product.id);
  const { location } = useLocationTracking();
  const { deviceInfo } = useDeviceTracking();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [priceRange, setPriceRange] = useState([product.salePrice, 1199]);
  const [currentImage, setCurrentImage] = useState(product.images[0]?.fileUrl);

  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || '');

  const prevImage = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentImage(product.images[currentIndex - 1]);
    }
  };

  const nextImage = () => {
    if (currentIndex < product.images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentImage(product.images[currentIndex + 1]);
    }
  };

  const discountPercentage = Math.round(
    ((product.regularPrice - product.salePrice) / product.regularPrice) * 100
  );

  const fetchFilteredProducts = async () => {
    try {
      const query = new URLSearchParams();

      query.set('priceRange', priceRange.join(','));
      query.set('page', '1');
      query.set('limit', '5');

      const response = await axiosInstance.get(
        `/products/get-filtered-products?query=${query.toString()}`
      );

      setRecommendedProducts(response.data?.products);
    } catch (error) {
      console.error(`Failed to get recommended products: ${error}`);
    }
  };

  useEffect(() => {
    fetchFilteredProducts();
  }, [priceRange]);

  return (
    <div className="w-full bg-[#f5f5f5] py-5">
      <div className="w-[90%] bg-white lg:w-[80%] mx-auto pt-6 grid grid-cols-1 lg:grid-cols-[28%_44%_28%] gap-6 overflow-hidden">
        <div className="p-4">
          <div className="relative w-full">
            <ReactImageMagnify
              {...{
                smallImage: {
                  alt: 'Product image',
                  isFluidWidth: true,
                  src: currentImage,
                },
                largeImage: {
                  src: currentImage,
                  width: 1200,
                  height: 1200,
                },
                enlargedImageContainerDimensions: {
                  width: '150%',
                  height: '150%',
                },
                enlargedImageStyle: {
                  border: 'none',
                  boxShadow: 'none',
                },
                enlargedImagePosition: 'right',
              }}
            />
          </div>
          <div className="relative flex items-center gap-2 mt-4 overflow-hidden">
            {product.images.length > 4 && (
              <button
                className="absolute left-0 bg-white p-2 rounded-full shadow-md z-10"
                onClick={prevImage}
                disabled={currentImage == 0}
              >
                <ChevronLeft size={24} />
              </button>
            )}
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((image: any, index: number) => (
                <Image
                  src={image.fileUrl}
                  key={index}
                  alt="Thumbnail"
                  width={60}
                  height={60}
                  className={`cursor-pointer border rounded-lg p-1 ${
                    currentImage === image
                      ? 'border-blue-500'
                      : 'border-gray-300'
                  }`}
                  onClick={() => {
                    setCurrentIndex(index);
                    setCurrentImage(image);
                  }}
                />
              ))}
            </div>
            {product.images.length > 4 && (
              <button
                className="absolute right-0 bg-white p-2 rounded-full shadow-md z-10"
                onClick={nextImage}
                disabled={currentImage == product.images.length - 1}
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </div>
        {/* Product details */}
        <div className="p-4">
          <h1 className="text-xl mb-2 font-medium">{product.title}</h1>
          <div className="w-full items-center justify-between">
            <div className="flex gap-2 mt-2 text-yellow-500">
              <Ratings rating={product.rating} />
              <Link href="#reviews" className="text-blue-500 hover:underline">
                (0 reviews)
              </Link>
            </div>
            <div
              onClick={() =>
                isInWishlist
                  ? removeFromWishlist(product.id, user, location, deviceInfo)
                  : addToWishlist(
                      {
                        ...product,
                        quantity,
                        selectedOptions: {
                          color: selectedColor,
                          size: selectedSize,
                        },
                      },
                      user,
                      location,
                      deviceInfo
                    )
              }
            >
              <Heart
                size={25}
                fill={isInWishlist ? 'red' : 'transparent'}
                color={isInWishlist ? 'transparent' : '#777'}
                className="cursor-pointer"
              />
            </div>
          </div>
          <div className="py-2 border-b border-b-gray-200">
            <span className="text-gray-500">
              Brand:{' '}
              <span className="text-blue-500">
                {product?.brand || 'No brand'}
              </span>
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-orange-500">
              ${product?.salePrice}
            </span>
            <div className="flex gap-2 pb-2 text-lg border-b border-b-slate-200">
              <span className="text-gray-400 line-through">
                ${product.regularPrice}
              </span>
              <span className="text-gray-500">-{discountPercentage}%</span>
            </div>
            <div className="mt-2">
              <div className="flex flex-col md:flex-row items-start gap-5 mt-4">
                {/* Color options */}
                {product?.colors.length > 0 && (
                  <div>
                    <strong>Color:</strong>
                    <div className="flex gap-2 mt-1">
                      {product.colors.map((color: string, index: number) => (
                        <button
                          key={index}
                          className={`w-8 h-8 cursor-pointer rounded-full border-2 transition ${
                            selectedColor === color
                              ? 'border-gray-400 scale-110 shadow-md'
                              : 'border-transparent'
                          }`}
                          onClick={() => setSelectedColor(color)}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {/* Size options */}
                {product?.sizes.length > 0 && (
                  <div>
                    <strong>Size:</strong>
                    <div className="flex gap-2 mt-1">
                      {product.sizes.map((size: string, index: number) => (
                        <button
                          key={index}
                          className={`px-4 py-1 cursor-pointer rounded-full border-2 transition ${
                            selectedSize === size
                              ? 'bg-gray-800 text-white'
                              : 'bg-gray-300 text-black'
                          }`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-md">
                  <button
                    className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-l-md"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    -
                  </button>
                  <span className="px-4 py-1 bg-gray-100">{quantity}</span>
                  <button
                    className="px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-l-md"
                    onClick={() => setQuantity((prev) => prev + 1)}
                  >
                    +
                  </button>
                </div>
                {product?.stock > 0 ? (
                  <span className="text-green-600 font-semibold">
                    In Stock:{' '}
                    <span className="text-gray-500 font-medium">
                      (Stock{product?.stock})
                    </span>
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">
                    Out of Stock
                  </span>
                )}
              </div>
              <button
                className={`flex mt-6 items-center gap-2 px-5 py-[10px] bg-[#ff5722] hover:bg-[#e64a19] text-white font-medium rounded-lg transition ${
                  isInCart ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
                disabled={isInCart || product.stock === 0}
                onClick={() =>
                  addToCart(
                    {
                      ...product,
                      quantity,
                      selectedOptions: {
                        color: selectedColor,
                        size: selectedSize,
                      },
                    },
                    user,
                    location,
                    deviceInfo
                  )
                }
              >
                <ShoppingCart size={18} /> Add to Cart
              </button>
            </div>
          </div>
        </div>
        {/* Seller information */}
        <div className="bg-[#fafafa] -mt-6">
          <div className="mb-1 p-3 border-b border-b-gray-100">
            <span className="text-sm text-gray-600">Delivery Options</span>
            <div className="flex items-center text-gray-600 gap-1">
              <MapPin size={18} className="ml-[-5px]" />
              <span className="text-lg font-normal">
                {`${location?.city} ${location?.country}`}
              </span>
            </div>
          </div>
          <div className="mb-1 px-3 pb-1 border-b border-b-gray-100">
            <span className="text-sm text-gray-600">Return & Warranty</span>
            <div className="flex items-center text-gray-600 gap-1">
              <Package size={18} className="ml-[-5px]" />
              <span className="text-base font-normal">7 Days return</span>
            </div>
            <div className="flex items-center text-gray-600 gap-1">
              <WalletMinimal size={18} className="ml-[-5px]" />
              <span className="text-base font-normal">
                Warranty not available
              </span>
            </div>
          </div>
          <div className="px-3 py-1">
            <div className="w-[85%] rounded-lg">
              {/* Sold by section */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-light text-gray-600">
                    Sold by
                  </span>
                  <span className="block max-w-[150px] truncate font-medium text-lg">
                    {product.shop?.name}
                  </span>
                </div>
                <Link
                  href="#"
                  className="text-blue-500 text-sm flex items-center gap-1"
                >
                  <MessageSquareText /> Chat now
                </Link>
              </div>
              {/* Seller performance stats */}
              <div className="grid grid-cols-3 gap-2 border-t border-t-gray-200 mt-3">
                <div>
                  <p className="text-[12px] text-gray-500">Seller Ratings</p>
                  <p className="text-lg font-semibold">88%</p>
                </div>
                <div>
                  <p className="text-[12px] text-gray-500">Ship on Time</p>
                  <p className="text-lg font-semibold">100%</p>
                </div>
                <div>
                  <p className="text-[12px] text-gray-500">Chat Response</p>
                  <p className="text-lg font-semibold">100%</p>
                </div>
              </div>
              {/* Store button */}
              <div className="text-center mt-4 pt-2 border-t border-t-gray-200">
                <Link
                  className="text-blue-500 font-medium text-sm hover:underline"
                  href={`/shop/${product.shop?.id}`}
                >
                  Go to Store
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-[90%] lg:w-[80%] mx-auto mt-5">
        <div className="bg-white min-h-[60vh] h-full p-5">
          <h3 className="text-lg font-semibold">
            Product details of ${product.title}
          </h3>
          <div
            className="prose prose-sm text-slate-200 max-w-none"
            dangerouslySetInnerHTML={{ __html: product.detailedDescription }}
          />
        </div>
      </div>
      <div className="w-[90%] lg:w-[80%] mx-auto">
        <div className="bg-white min-h-[50vh] h-full mt-5 p-5">
          <h3 className="text-lg font-semibold">
            Ratings & Reviews of {product.title}
          </h3>
          <p className="text-center pt-14">No reviews available yet!</p>
        </div>
      </div>
      <div className="w-[90%] lg:w-[80%] mx-auto">
        <div className="w-full h-full my-5 p-5">
          <h3 className="text-xl font-semibold mb-2">You may also like</h3>
          <div className="m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {recommendedProducts?.map((item: any) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
