'use client';

import { categories, countries } from 'apps/user-ui/src/configs/constants';
import ShopCard from 'apps/user-ui/src/shared/components/cards/ShopCard';
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Page = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [shops, setShops] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isShopLoading, setIsShopLoading] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [tempPriceRange, setTempPriceRange] = useState([0, 1199]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const fetchFilteredShops = async () => {
    setIsShopLoading(true);

    try {
      const query = new URLSearchParams();

      if (selectedCategories.length > 0) {
        query.set('categories', selectedCategories.join(','));
      }
      if (selectedCountries.length > 0) {
        query.set('countries', selectedCountries.join(','));
      }

      query.set('page', page.toString());
      query.set('limit', '12');

      const response = await axiosInstance.get(
        `/products/get-filtered-shops?query=${query.toString()}`
      );

      setShops(response.data.shops);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error(`Failed to fetch filtered shops: ${error}`);
    } finally {
      setIsShopLoading(false);
    }
  };

  const updateURL = () => {
    const params = new URLSearchParams();

    if (selectedCategories.length > 0) {
      params.set('categories', selectedCategories.join(','));
    }

    if (selectedCountries.length > 0) {
      params.set('countries', selectedCountries.join(','));
    }

    params.set('page', page.toString());
    params.set('limit', '12');

    router.replace(`/shops?${decodeURIComponent(params.toString())}`);
  };

  useEffect(() => {
    updateURL();
    fetchFilteredShops();
  }, [selectedCategories, page]);

  const toggleCategory = (category: string) =>
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );

  const toggleCountry = (country: string) =>
    setSelectedCategories((prev) =>
      prev.includes(country)
        ? prev.filter((c) => c !== country)
        : [...prev, country]
    );

  return (
    <div className="w-full bg-[#f5f5f5] pb-10">
      <div className="w-[90%] lg:w-[80%] m-auto">
        <h1 className="md:pt-[40px] font-medium text-[44px] font-jost leading-1 mb-[14px]">
          All Shops
        </h1>

        <Link href="/" className="text-[#55585b] hover:underline">
          Home
        </Link>
        <div>
          <ChevronRight />
          <span className="text-[#55585b]">All Shops</span>
        </div>
      </div>
      <div className="w-full flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-[270px] rounded bg-white p-4 space-y-6 shadow-md">
          {/* Categories */}
          <div>
            <h3 className="text-xl font-Poppins font-medium pb-1 border-b border-b-slate-300">
              Categories
            </h3>
            <ul className="space-y-2 mt-3">
              {categories.map((category: { label: string; value: string }) => (
                <li
                  key={category.value}
                  className="flex items-center justify-between"
                >
                  <label
                    htmlFor="category"
                    className="flex items-center gap-3 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      name="category"
                      id="category"
                      checked={selectedCategories.includes(category.value)}
                      onChange={() => toggleCategory(category.value)}
                      className="accent-blue-600"
                    />
                    {category.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
          {/* Countries */}
          <div>
            <h3 className="text-xl font-Poppins font-medium pb-1 border-b border-b-slate-300">
              Countries
            </h3>
            <ul className="space-y-2 mt-3">
              {countries.map((country: string) => (
                <li key={country} className="flex items-center justify-between">
                  <label
                    htmlFor="country"
                    className="flex items-center gap-3 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      name="country"
                      id="country"
                      checked={selectedCategories.includes(country)}
                      onChange={() =>
                        toggleCountry(country.trim().toLocaleLowerCase())
                      }
                      className="accent-blue-600"
                    />
                    {country}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        {/* Shop grid */}
        <div className="flex-1 px-2 lg:px-3">
          {isShopLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {Array.from({ length: 10 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[250px] bg-gray-300 animate-pulse rounded-xl"
                />
              ))}
            </div>
          ) : shops.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {shops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          ) : (
            <p className="text-center">No shops found!</p>
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
