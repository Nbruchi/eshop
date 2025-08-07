'use client';

import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Breadcrumb from 'apps/seller-ui/src/shared/components/Breadcrumb';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { Eye, Search } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

const Payments = () => {
  const [globalFilter, setGlobalFilter] = useState('');

  const fetchOrders = async () => {
    const res = await axiosInstance.get('/orders/get-seller-orders');
    return res.data.orders;
  };

  const { data: orders, isLoading } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5,
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'Order ID',
        cell: ({ row }: any) => (
          <span className="text-white text-sm">
            #{row.original.id.slice(-6).toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: 'username',
        header: 'Buyer',
        cell: ({ row }) => (
          <span className="text-white">
            {row.original.user.name ?? 'Guest'}
          </span>
        ),
      },
      {
        accessorKey: '',
        header: 'Seller Earning',
        cell: ({ row }) => {
          const sellerShare = row.original.total * 0.9;

          return (
            <span className="text-green-600 font-medium">
              ${sellerShare.toFixed(2)}
            </span>
          );
        },
      },
      {
        accessorKey: '',
        header: 'Admin Fee',
        cell: ({ row }) => {
          const adminFee = row.original.total * 0.1;

          return (
            <span className="text-yellow-400">${adminFee.toFixed(2)}</span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
              row.original.status === 'Paid' ? 'bg-green-600' : 'bg-yellow-500'
            }`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) => {
          const date = new Date(row.original.createdAt).toLocaleDateString();
          return <span className="text-white text-sm">{date}</span>;
        },
      },
      {
        accessorKey: '',
        header: 'Actions',
        cell: ({ row }) => (
          <Link
            href={`/orders/${row.original.id}`}
            className="text-blue-400 hover:text-blue-300 transition"
          >
            <Eye size={18} />
          </Link>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="w-full min-h-screen p-8">
      <h2 className="text-2xl text-white font-semibold mb-2">All Payments</h2>
      <Breadcrumb title="All Payments" />
      {/* Search bar */}
      <div className="my-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
        <Search size={18} className="text-gray-400 mr-2" />
        <input
          type="text"
          className="w-full bg-transparent text-white outline-none"
          placeholder="Search payments..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </div>
      {/* Table */}
      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
        {isLoading ? (
          <p className="text-center text-white">Loading payments...</p>
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
        {!isLoading && orders.length === 0 && (
          <p className="text-center py-3 text-white">No payments found!</p>
        )}
      </div>
    </div>
  );
};

export default Payments;
