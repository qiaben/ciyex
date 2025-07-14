"use client";
import { useState } from "react";
import { Table } from "@/components/tables/table";
import { format } from "date-fns";
import { Search } from "lucide-react";

const columns = [
  {
    header: "User ID",
    key: "id",
    className: "hidden lg:table-cell",
  },
  {
    header: "Name",
    key: "name",
  },
  {
    header: "Email",
    key: "email",
    className: "hidden md:table-cell",
  },
  {
    header: "Role",
    key: "roleName",
  },
  {
    header: "Status",
    key: "status",
  },
  {
    header: "Last Login",
    key: "last_login",
    className: "hidden xl:table-cell",
  },
];

export default function UserTableClient({ initialUsers, totalCount, initialRole }: {
  initialUsers: any[];
  totalCount: number;
  initialRole: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [roleName, setRole] = useState(initialRole);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const perPage = 10;
  const totalPages = Math.ceil(totalCount / perPage);

  const fetchUsers = async (roleName: string, page: number) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (roleName) params.set("roleName", roleName);
    params.set("page", page.toString());
    const res = await fetch(`/api/users?${params.toString()}`);
    const data = await res.json();
    setUsers(data.users);
    setLoading(false);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setRole(newRole);
    setPage(1);
    fetchUsers(newRole, 1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchUsers(roleName, newPage);
  };

  // Card layout for mobile
  const renderCard = (item: any) => (
    <div
      key={item.id}
      className="rounded-2xl bg-white dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 shadow-sm p-4 mb-4 flex flex-col gap-3"
    >
      <div className="flex items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <span className="text-gray-600 dark:text-gray-200 font-medium text-lg tracking-wider">
              {item?.firstName?.[0]}{item?.lastName?.[0]}
            </span>
          </div>
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white text-lg tracking-wide">
            {item?.firstName} {item?.lastName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-light tracking-wide">
            {item?.emailAddresses[0].emailAddress}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 text-sm mt-2">
        <span className="px-3 py-1.5 rounded-full bg-gray-50/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 font-light">
          {item?.publicMetadata.roleName}
        </span>
        <span className="px-3 py-1.5 rounded-full bg-emerald-50/50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-light">
          Active
        </span>
        <span className="px-3 py-1.5 rounded-full bg-gray-100/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-light">
          {format(item?.lastSignInAt, "MMM d, yyyy")}
        </span>
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-600 font-mono break-all mt-2">
        {item?.id}
      </div>
    </div>
  );

  // Table row for desktop
  const renderRow = (item: any) => (
    <tr
      key={item.id}
      className="group border-b border-gray-100/50 dark:border-gray-800/50 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 ease-in-out"
    >
      <td className="hidden lg:table-cell py-5 px-8 text-sm text-gray-500 dark:text-gray-400 font-mono tracking-wide">{item?.id}</td>
      <td className="py-5 px-8">
        <div className="flex items-center gap-5">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
              <span className="text-gray-600 dark:text-gray-200 font-medium text-sm tracking-wider">
                {item?.firstName?.[0]}{item?.lastName?.[0]}
              </span>
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="font-medium text-gray-900 dark:text-white tracking-wide group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors duration-200">
              {item?.firstName} {item?.lastName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-light tracking-wide">
              {item?.emailAddresses[0].emailAddress}
            </p>
          </div>
        </div>
      </td>
      <td className="py-5 px-8 text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell font-light tracking-wide">{item?.emailAddresses[0].emailAddress}</td>
      <td className="py-5 px-8">
        <span className="text-sm text-gray-600 dark:text-gray-300 font-light tracking-wide px-3 py-1.5 rounded-full bg-gray-50/50 dark:bg-gray-800/50">
          {item?.publicMetadata.roleName}
        </span>
      </td>
      <td className="py-5 px-8">
        <span className="text-sm text-emerald-600 dark:text-emerald-400 font-light tracking-wide px-3 py-1.5 rounded-full bg-emerald-50/50 dark:bg-emerald-900/30">
          Active
        </span>
      </td>
      <td className="py-5 px-8 text-sm text-gray-500 dark:text-gray-400 hidden xl:table-cell font-light tracking-wide">
        {format(item?.lastSignInAt, "MMM d, yyyy")}
      </td>
    </tr>
  );

  // Pagination controls
  const Pagination = () => (
    <div className="flex justify-center items-center gap-2 mt-6">
      <button
        disabled={page === 1 || loading}
        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50"
        onClick={() => handlePageChange(page - 1)}
      >
        Previous
      </button>
      <span className="text-gray-700 dark:text-gray-200 text-sm">Page {page} of {totalPages}</span>
      <button
        disabled={page === totalPages || loading}
        className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 disabled:opacity-50"
        onClick={() => handlePageChange(page + 1)}
      >
        Next
      </button>
    </div>
  );

  return (
    <div>
      {/* Sticky filter/search on mobile */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-6 sticky top-0 z-30 bg-gradient-to-b from-slate-50/90 via-white/90 to-slate-50/80 dark:from-gray-900/90 dark:via-gray-950/90 dark:to-gray-900/80 px-2 md:px-0 pt-2 pb-4 md:static md:bg-none">
        <div className="relative group w-full md:w-auto">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full md:w-[300px] pl-11 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 focus:border-gray-300 dark:focus:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-light tracking-wide transition-all duration-200"
            disabled={loading}
          />
          <Search className="absolute left-4 top-3 h-4 w-4 text-gray-400 dark:text-gray-500 group-focus-within:text-gray-500 transition-colors duration-200" />
        </div>
        <select
          name="roleName"
          value={roleName}
          className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-light text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 focus:border-gray-300 dark:focus:border-gray-600 bg-white dark:bg-gray-900"
          onChange={handleRoleChange}
          disabled={loading}
        >
          <option value="">All Users</option>
          <option value="doctor">Doctors</option>
          <option value="patient">Patients</option>
          <option value="admin">Admins</option>
        </select>
      </div>
      {/* Card layout for mobile, table for md+ */}
      <div className="block md:hidden">
        {users.map(renderCard)}
      </div>
      <div className="hidden md:block overflow-x-auto rounded-lg">
        <div className="min-w-full">
          <Table columns={columns} data={users} renderRow={renderRow} />
        </div>
      </div>
      <Pagination />
    </div>
  );
} 