import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Breadcrumb from 'apps/admin-ui/src/components/Breadcrumb';
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';
import { Ban, Download, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useDeferredValue, useMemo, useState } from 'react';

type Seller = {
  id: string;
  name: string;
  email: string;
  shop: {
    name: string;
    avatar: string;
    address: string;
  };
  createdAt: string;
};

type SellerResponse = {
  data: Seller[];
  meta: {
    totalSellers: number;
    currentPage: number;
    totalPages: number;
  };
};

const Sellers = () => {
  const [page, setPage] = useState(1);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  const limit = 10;
  const queryClient = useQueryClient();
  const deferredGlobalFilter = useDeferredValue(globalFilter);

  const { data, isLoading }: UseQueryResult<SellerResponse, Error> = useQuery<
    SellerResponse,
    Error,
    SellerResponse,
    [string, number]
  >({
    queryKey: ['all-sellers', page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/all-sellers?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });

  const banSellerMutation = useMutation({
    mutationFn: async (sellerId: string) => {
      await axiosInstance.put(`/admin/ban-seller/${sellerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-sellers'] });
      setIsModalOpen(false);
      setSelectedSeller(null);
    },
  });

  const allSellers = data?.data || [];
  const filteredSellers = useMemo(() => {
    return allSellers.filter((seller) =>
      deferredGlobalFilter
        ? Object.values(seller)
            .map((v) => (typeof v === 'string' ? v : JSON.stringify(v)))
            .join(' ')
            .toLowerCase()
            .includes(deferredGlobalFilter.toLowerCase())
        : true
    );
  }, [allSellers, deferredGlobalFilter]);

  const totalPages = Math.ceil((data?.meta.totalSellers ?? 0) / limit);

  const banSeller = async (id: string) => banSellerMutation.mutate(id);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'shop.avatar',
        header: 'Avatar',
        cell: ({ row }: any) => (
          <Image
            src={row.original.shop.avatar || '/images/placeholder.png'}
            alt={row.original.shop.name}
            width={40}
            height={40}
            className="rounded-full size-10 object-cover"
          />
        ),
      },
      {
        accessorKey: 'name',
        header: 'Name',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'shop.name',
        header: 'Shop Name',
        cell: ({ row }: any) => {
          const shopName = row.original.shop.name;

          return shopName ? (
            <Link
              href={`/shops/${row.original.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {shopName}
            </Link>
          ) : (
            <span className="italic text-gray-400">No shop</span>
          );
        },
      },
      {
        accessorKey: 'shop.address',
        header: 'Address',
      },
      {
        accessorKey: 'createdAt',
        header: 'Joined',
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleDateString(),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredSellers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const exportToCSV = () => {
    const csvData = filteredSellers.map(
      (event: any) =>
        `${event.title},${event.salePrice},${event.stock},${event.startingDate},${event.endingDate},${event.shop.name}`
    );

    const blob = new Blob(
      [`Title,Price,Stock,Start Date,EndDate,Shop\n${csvData.join('\n')}`],
      { type: 'text/csv;charset=utf-8' }
    );
    // saveAs(blob,`events-page-${page}.csv`)
  };

  return (
    <div className="w-full min-h-screen p-8 bg-black text-white text-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-2xl text-white font-semibold mb-2">All Sellers</h2>
        <button
          className="px-3 py-1 bg-green-600 text-white hover:bg-green-700 rounded transition"
          onClick={exportToCSV}
        >
          <Download size={18} /> Export CSV
        </button>
      </div>
      <Breadcrumb title="All Sellers" />
      {/* Search bar */}
      <div className="my-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          className="w-full bg-transparent text-white outline-none"
          placeholder="Search orders..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>
      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading events...</p>
        ) : filteredSellers.length === 0 ? (
          <p className="text-center py-3 text-white">No events found!</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr className="border-b border-b-gray-800" key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th className="p-3 text-left text-sm" key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  className="border-b border-b-gray-800 hover:bg-gray-800 transition"
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td className="p-3 text-sm" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
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
  );
};

export default Sellers;
