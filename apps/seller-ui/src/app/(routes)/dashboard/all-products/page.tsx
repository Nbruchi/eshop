'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';
import DeleteConfirmationModal from 'apps/seller-ui/src/shared/components/DeleteConfirmationModal';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { AxiosError } from 'axios';
import {
  BarChart,
  ChevronRight,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Search,
  Star,
  Trash,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Product } from 'apps/user-ui/src/store';

const AllProducts = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const queryClient = useQueryClient();

  const fetchProducts = async () => {
    const response = await axiosInstance.get('/products/get-shop-products');
    return response.data.products;
  };

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['shop-products'],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      axiosInstance.delete(`/products/delete-product/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      toast.success('Product deleted successfully');
      setShowDeleteModal(false);
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'Something went wrong';
      toast.error(errorMessage);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) =>
      axiosInstance.put(`/products/restore-product/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shop-products'] });
      toast.success('Product restored successfully');
      setShowDeleteModal(false);
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        'Something went wrong';
      toast.error(errorMessage);
    },
  });

  const openAnalytics = (product: any) => {
    setSelectedProduct(product);
    setShowAnalytics(true);
  };

  const openDeleteModal = (product: any) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'image',
        header: 'Image',
        cell: ({ row }: any) => (
          <Image
            src={row.original.images[0]?.fileUrl || ''}
            alt={row.original.images[0]?.fileUrl || ''}
            width={100}
            height={100}
            className="rounded-md object-cover w-12 h-12"
          />
        ),
      },
      {
        accessorKey: 'title',
        header: 'Product Name',
        cell: ({ row }) => {
          const truncatedTitle =
            row.original.title.length > 25
              ? `${row.original.title.substring(0, 25)}...`
              : row.original.title;

          return (
            <Link
              href={`/products/${row.original.slug}`}
              className="text-blue-400 hover:underline"
              title={row.original.title}
            >
              {truncatedTitle}
            </Link>
          );
        },
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => <span>${row.original.salePrice}</span>,
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
        cell: ({ row }: any) => (
          <span
            className={row.original.stock < 10 ? 'text-red-500' : 'text-white'}
          >
            {row.original.stock} left
          </span>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
      },
      {
        accessorKey: 'rating',
        header: 'Rating',
        cell: ({ row }: any) => (
          <div className="flex items-center gap-1 text-yellow-400">
            <Star fill="#fde047" size={18} />
            <span className="text-white">{row.original.rating || 0}</span>
          </div>
        ),
      },
      {
        header: 'Actions',
        cell: ({ row }: any) => (
          <div className="flex gap-3">
            <Link
              href={`/products/${row.original.id}`}
              className="text-blue-400 hover:text-blue-300 transition"
            >
              <Eye size={18} />
            </Link>
            <Link
              href={`/products/edit/${row.original.id}`}
              className="text-yellow-400 hover:text-yellow-300 transition"
            >
              <Pencil size={18} />
            </Link>
            <button
              onClick={() => openAnalytics(row.original)}
              className="text-green-400 hover:text-green-300 transition"
            >
              <BarChart size={18} />
            </button>
            <button
              onClick={() => openDeleteModal(row.original)}
              className="text-red-400 hover:text-red-300 transition"
            >
              <Trash size={18} />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    globalFilterFn: 'includesString',
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="w-full min-h-screen p-8">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl text-white font-semibold">All Products</h2>
        <Link
          href="/dashboard/create-product"
          className="bg-blue-800 hover:bg-blue-700 transition text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> Add Product
        </Link>
      </div>
      <div className="flex items-center">
        <span className="text-[#80deea] cursor-pointer">Dashboard</span>
        <ChevronRight size={20} className="opacity-[0.98] text-white" />
        <span className="text-white">All Products</span>
      </div>
      <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search products..."
          className="w-full bg-transparent text-white outline-none"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-white" />
          </div>
        ) : (
          <table className="w-full text-white">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b border-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="text-left p-3">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
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
                  key={row.id}
                  className="border-b border-gray-800 hover:bg-gray-900 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3">
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
      </div>

      {showDeleteModal && (
        <DeleteConfirmationModal
          product={selectedProduct}
          onRestore={() => restoreMutation.mutate(selectedProduct?.id || '')}
          onConfirm={() => deleteMutation.mutate(selectedProduct?.id || '')}
          onClose={() => setShowDeleteModal(false)}
          isDeleting={deleteMutation.isPending}
          isRestoring={restoreMutation.isPending}
        />
      )}
    </div>
  );
};

export default AllProducts;
