'use client';

import { useQuery } from '@tanstack/react-query';
import ProductCard from 'apps/user-ui/src/shared/components/cards/ProductCard';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import { ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Range } from 'react-range';

const MIN = 0;
const MAX = 1199;

const Page = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState<any[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1199]);
  const [tempPriceRange, setTempPriceRange] = useState([1, 1199]);
  const [isProductLoading, setIsProductLoading] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const colors = [
    { name: 'Black', code: '#000' },
    { name: 'Red', code: '#f00' },
    { name: 'Green', code: '#0f0' },
    { name: 'Blue', code: '#00f' },
    { name: 'Yellow', code: '#ff0' },
    { name: 'Magenta', code: '#f0f' },
    { name: 'Cyan', code: '#0ff' },
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axiosInstance.get('/products/get-categories');
      return res.data;
    },
    staleTime: 1000 * 60 * 30,
  });

  const fetchFilteredProducts = async () => {
    setIsProductLoading(true);

    try {
      const query = new URLSearchParams();

      query.set('priceRange', priceRange.join(','));

      if (selectedCategories.length > 0) {
        query.set('categories', selectedCategories.join(','));
      }
      if (selectedColors.length > 0) {
        query.set('colors', selectedColors.join(','));
      }
      if (selectedSizes.length > 0) {
        query.set('sizes', selectedSizes.join(','));
      }

      query.set('page', page.toString());
      query.set('limit', '12');

      const response = await axiosInstance.get(
        `/products/get-filtered-products?query=${query.toString()}`
      );

      setProducts(response.data.products);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error(`Failed to fetch filtered products: ${error}`);
    } finally {
      setIsProductLoading(false);
    }
  };

  const updateURL = () => {
    const params = new URLSearchParams();
    params.set('priceRange', priceRange.join(','));

    if (selectedCategories.length > 0) {
      params.set('categories', selectedCategories.join(','));
    }
    if (selectedColors.length > 0) {
      params.set('colors', selectedColors.join(','));
    }
    if (selectedSizes.length > 0) {
      params.set('sizes', selectedSizes.join(','));
    }

    params.set('page', page.toString());
    params.set('limit', '12');

    router.replace(`/products?${decodeURIComponent(params.toString())}`);
  };

  useEffect(() => {
    updateURL();
    fetchFilteredProducts();
  }, [priceRange, selectedCategories, selectedColors, selectedSizes, page]);

  const toggleCategory = (category: string) =>
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );

  const toggleColor = (color: string) =>
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );

  const toggleSize = (size: string) =>
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );

  return (
    <div className="w-full bg-[#f5f5f5] pb-10">
      <div className="w-[90%] lg:w-[80%] m-auto">
        <h1 className="md:pt-[40px] font-medium text-[44px] font-jost leading-1 mb-[14px]">
          All Products
        </h1>

        <Link href="/" className="text-[#55585b] hover:underline">
          Home
        </Link>
        <div>
          <ChevronRight />
          <span className="text-[#55585b]">All Products</span>
        </div>
      </div>
      <div className="w-full flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-[270px] rounded bg-white p-4 space-y-6 shadow-md">
          {/* Price filter */}
          <div>
            <h3 className="text-xl font-Poppins font-medium">Price Filter</h3>
            <div className="ml-2">
              <Range
                step={1}
                min={MIN}
                max={MAX}
                values={tempPriceRange}
                onChange={(values) => setTempPriceRange(values)}
                renderTrack={({ props, children }) => {
                  const [min, max] = tempPriceRange;
                  const percentageLeft = ((min - MIN) / (MAX - MIN)) * 100;
                  const percentageRight = ((max - MIN) / (MAX - MIN)) * 100;

                  return (
                    <div
                      {...props}
                      className="h-[6px] bg-blue-200 rounded relative"
                      style={{ ...props.style }}
                    >
                      <div
                        className="absolute h-full bg-blue-600 rounded"
                        style={{
                          left: `${percentageLeft}%`,
                          width: `${percentageRight - percentageLeft}%`,
                        }}
                      >
                        {children}
                      </div>
                    </div>
                  );
                }}
                renderThumb={({ props }) => {
                  const { key, ...rest } = props;
                  return (
                    <div
                      key={key}
                      {...rest}
                      className="w-4 h-4 bg-blue-600 rounded-full shadow"
                    />
                  );
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-gray-600">
                ${tempPriceRange[0]} - ${tempPriceRange[1]}
              </div>
              <button
                onClick={() => {
                  setPriceRange(tempPriceRange);
                  setPage(1);
                }}
                className="text-sm px-4 py-1 bg-gray-200 hover:bg-blue-600 hover:text-white rounded transition"
              >
                Apply
              </button>
            </div>
          </div>
          {/* Categories */}
          <div>
            <h3 className="text-xl font-Poppins font-medium pb-1 border-b border-b-slate-300">
              Categories
            </h3>
            <ul className="space-y-2 mt-3">
              {isLoading ? (
                <span>
                  <Loader2 className="animate-spin w-4 h-4" />
                </span>
              ) : (
                data.categories.map((category: string, index: number) => (
                  <li key={index} className="flex items-center justify-between">
                    <label
                      htmlFor="category"
                      className="flex items-center gap-3 text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        name="category"
                        id="category"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="accent-blue-600"
                      />
                      {category}
                    </label>
                  </li>
                ))
              )}
            </ul>
          </div>
          {/* Colors */}
          <div>
            <h3 className="text-xl font-Poppins font-medium pb-1 mt-6 border-b border-b-slate-300">
              Filter by color
            </h3>
            <ul className="mt-3 space-y-2">
              {colors.map((color) => (
                <li
                  className="flex justify-between items-center"
                  key={color.name}
                >
                  <label
                    htmlFor="color"
                    className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name="color"
                      id="color"
                      checked={selectedColors.includes(color.name)}
                      onChange={() => toggleColor(color.name)}
                      className="accent-blue-600"
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: color.code }}
                    />
                    {color.name}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          {/* Sizes */}
          <div>
            <h3 className="text-xl font-Poppins font-medium pb-1 mt-6 border-b border-b-slate-300">
              Filter by size
            </h3>
            <ul className="mt-3 space-y-2">
              {sizes.map((size) => (
                <li className="flex justify-between items-center" key={size}>
                  <label
                    htmlFor="size"
                    className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      name="size"
                      id="size"
                      checked={selectedSizes.includes(size)}
                      onChange={() => toggleSize(size)}
                      className="accent-blue-600"
                    />
                    <span className="font-medium">{size}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        {/* Product grid */}
        <div className="flex-1 px-2 lg:px-3">
          {isProductLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center">No products found!</p>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded border border-gray-200 text-sm ${
                    page === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-black'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
