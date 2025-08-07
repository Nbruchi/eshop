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
import { Download, Eye, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

const Events = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [globalFilter, setGlobalFilter] = useState('');

  const fetchEvents = async () => {
    const res = await axiosInstance.get(
      `/admin/get-all-events?page=${page}&limit=${limit}`
    );
    return res.data.events;
  };

  const { data, isLoading } = useQuery({
    queryKey: ['all-events'],
    queryFn: fetchEvents,
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });

  const allEvents = data.data || [];
  const totalPages = Math.ceil((data?.meta?.totalEvents ?? 0) / limit);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event: any) => {
      const values = Object.values(event).join(' ').toLowerCase();
      return values.includes(globalFilter.toLowerCase());
    });
  }, [allEvents, globalFilter]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'images',
        header: 'Image',
        cell: ({ row }: any) => (
          <Image
            src={row.original.images[0].fileUrl || '/images/placeholder.png'}
            alt={row.original.title}
            width={40}
            height={40}
            className="size-10 rounded object-cover"
          />
        ),
      },
      {
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <Link
            href={`/products/${row.original.slug}`}
            className="hover:text-blue-500 hover:border-b"
          >
            {row.original.title}
          </Link>
        ),
      },
      {
        accessorKey: 'salePrice',
        header: 'Price',
        cell: ({ row }) => `$${row.original.salePrice}`,
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
      },
      {
        accessorKey: 'startingDate',
        header: 'Start',
        cell: ({ row }) =>
          new Date(row.original.startingDate).toLocaleDateString(),
      },
      {
        accessorKey: 'endingDate',
        header: 'End',
        cell: ({ row }) =>
          new Date(row.original.endingDate).toLocaleDateString(),
      },
      {
        accessorKey: 'shop.name',
        header: 'Shop',
        cell: ({ row }) => row.original.shop.name || '',
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredEvents,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const exportToCSV = () => {
    const csvData = filteredEvents.map(
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
        <h2 className="text-2xl text-white font-semibold mb-2">All Events</h2>
        <button
          className="px-3 py-1 bg-green-600 text-white hover:bg-green-700 rounded transition"
          onClick={exportToCSV}
        >
          <Download size={18} /> Export CSV
        </button>
      </div>
      <Breadcrumb title="All Events" />
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
        ) : filteredEvents.length === 0 ? (
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

export default Events;
