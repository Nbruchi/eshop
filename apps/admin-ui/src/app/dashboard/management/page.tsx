'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import Breadcrumb from 'apps/admin-ui/src/components/Breadcrumb';
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';
import { useState, FormEvent } from 'react';

const Management = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');

  const queryClient = useQueryClient();

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role' },
  ];

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const res = await axiosInstance.get('/admin/all-admins');
      return res.data.admins;
    },
  });

  const { mutate: updateRole, isPending } = useMutation({
    mutationFn: async () => {
      return await axiosInstance.put('/admin/add-new-admin', {
        email: search,
        role: selectedRole,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] }), setOpen(false);
      setSearch('');
      setSelectedRole('user');
    },
    onError: (error) => {
      console.error(`Role update failed: ${error}`);
    },
  });

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateRole();
  };

  return (
    <div className="w-full min-h-screen p-8 bg-black text-white text-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold tracking-wide">Team Management</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={() => setOpen(true)}
        >
          Add Admin
        </button>
      </div>
      <div className="mb-4">
        <Breadcrumb title="Team Management" />
      </div>
      <div className="rounded shadow-xl border border-slate-700 overflow-hidden">
        <table className="min-w-full text-left">
          <thead className="bg-slate-900 text-slate-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th className="p-3" key={header.id}>
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
            {isLoading ? (
              <tr>
                <td className="p-4 text-center text-slate-400" colSpan={4}>
                  Loading...
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td className="p-4 text-center text-red-500" colSpan={4}>
                  Failed to load admins
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  className="border-t border-t-slate-700 hover:bg-slate-700 transition"
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td className="p-3" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="bg-slate-900 p-6 rounded-xl w-full max-w-md relative">
            <button
              className="absolute top-3 right-4 text-slate-400 text-center hover:text-white text-xl"
              onClick={() => setOpen(false)}
            >
              {' '}
              &times;{' '}
            </button>
            <h3 className="text-lg font-semibold mb-4">Add New Admin</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-1 text-slate-400">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="support@example.com"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 outline-none bg-slate-800 text-white border border-slate-600 rounded"
                />
              </div>
              <div>
                <label htmlFor="role" className="block mb-1 text-slate-400">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 outline-none bg-slate-800 text-white border border-slate-600 rounded"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-8 pt-2">
                <button
                  className="w-full bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800 transition"
                  type="button"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="w-full ">
                  {isPending ? 'Updating...' : 'Add Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Management;
