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
import React, { useDeferredValue, useMemo, useState } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

type UserResponse = {
  data: User[];
  meta: {
    totalUsers: number;
  };
};

const Users = () => {
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const limit = 10;
  const queryClient = useQueryClient();
  const deferredGlobalFilter = useDeferredValue(globalFilter);

  const { data, isLoading }: UseQueryResult<UserResponse, Error> = useQuery<
    UserResponse,
    Error,
    UserResponse,
    [string, number]
  >({
    queryKey: ['all-users', page],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/admin/all-users?page=${page}&limit=${limit}`
      );
      return res.data;
    },
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  });

  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await axiosInstance.put(`/admin/ban-user/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-users'] });
      setIsModalOpen(false);
      setSelectedUser(null);
    },
  });

  const allUsers = data?.data || [];
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      const matchesRole = roleFilter
        ? user.role.toLowerCase() === roleFilter.toLowerCase()
        : true;
      const matchesGlobal = deferredGlobalFilter
        ? Object.values(user)
            .join(' ')
            .toLowerCase()
            .includes(deferredGlobalFilter.toLowerCase())
        : true;

      return matchesRole && matchesGlobal;
    });
  }, [allUsers, roleFilter, deferredGlobalFilter]);

  const totalPages = Math.ceil((data?.meta.totalUsers ?? 0) / limit);

  const banUser = async (id: string) => banUserMutation.mutate(id);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }: any) => row.original.name,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }: any) => row.original.email,
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }: any) => (
          <span className="uppercase font-semibold text-blue-400">
            {row.original.role}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Joined',
        cell: ({ row }: any) =>
          new Date(row.original.createdAt).toLocaleDateString(),
      },
      {
        header: 'Actions',
        cell: ({ row }: any) => (
          <button onClick={() => banUser(row.original.id)}>
            <Ban size={18} color="red" />
          </button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredUsers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  const exportToCSV = () => {
    const csvData = filteredUsers.map(
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
        <h2 className="text-2xl text-white font-semibold mb-2">All Users</h2>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 bg-green-600 text-white hover:bg-green-700 rounded transition"
            onClick={exportToCSV}
          >
            <Download size={18} /> Export CSV
          </button>
          <select
            className="bg-gray-800 border border-gray-700 outline-none text-white"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>
      <Breadcrumb title="All Users" />
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
        ) : filteredUsers.length === 0 ? (
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

export default Users;
