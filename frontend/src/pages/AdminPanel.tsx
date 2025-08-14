import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/MainLayout.tsx';
import { getAdminUsersApi } from '@/api/analysisApi'; // تم تصحيح الـ import

type User = {
  id: string;
  full_name: string;
  role: string;
  credits: number;
  created_at: string;
  user_info: { email: string };
};

export default function AdminPanel() {
  const { data, isLoading } = useQuery<User[]>({
    queryKey: ['adminUsers'],
    queryFn: getAdminUsersApi
  });

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      <h2 className="mt-6 text-xl font-semibold">User Management</h2>
      <div className="mt-4 overflow-x-auto bg-white rounded-lg shadow dark:bg-dark-surface">
        <table className="w-full text-sm text-left rtl:text-right text-neutral-500">
          <thead className="text-xs uppercase bg-neutral-50 dark:bg-dark-bg text-neutral-700 dark:text-dark-subtle">
            <tr>
              <th className="px-6 py-3">User</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Credits</th>
              <th className="px-6 py-3">Joined</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-4 text-center">Loading users...</td></tr>}
            {data?.map(user => (
              <tr key={user.id} className="border-b dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-dark-bg">
                <td className="px-6 py-4">
                  <div className="font-semibold">{user.full_name}</div>
                  <div className="text-xs text-neutral-500 dark:text-dark-subtle">{user.user_info.email}</div>
                </td>
                <td className="px-6 py-4"><span className="capitalize">{user.role}</span></td>
                <td className="px-6 py-4 font-bold">{user.credits}</td>
                <td className="px-6 py-4">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <button className="px-3 py-1 text-xs font-medium text-white rounded-md bg-primary hover:bg-primary-dark">Add Credits</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}