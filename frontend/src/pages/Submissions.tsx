import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/MainLayout.tsx';
import { getSubmissionsApi } from '@/api/analysisApi'; // تم تصحيح الـ import
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';

type Submission = {
  id: number;
  title: string;
  total_files: number;
  status: string;
  created_at: string;
};

export default function Submissions() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery<Submission[]>({
    queryKey: ['submissions'],
    queryFn: getSubmissionsApi,
  });

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold">{t('navigation.submissions')}</h1>
      <div className="mt-6 overflow-x-auto bg-white rounded-lg shadow dark:bg-dark-surface">
        <table className="w-full text-sm text-left rtl:text-right text-neutral-500 dark:text-dark-text">
          <thead className="text-xs uppercase bg-neutral-50 dark:bg-dark-bg text-neutral-700 dark:text-dark-subtle">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">Title</th>
              <th scope="col" className="px-6 py-3">Files</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">View</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-4 text-center">Loading submissions...</td></tr>}
            {data?.map(sub => (
              <tr key={sub.id} className="bg-white border-b dark:bg-dark-surface dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-dark-bg">
                <td className="px-6 py-4 font-bold">{sub.id}</td>
                <td className="px-6 py-4 font-medium text-neutral-900 dark:text-dark-text">{sub.title}</td>
                <td className="px-6 py-4">{sub.total_files}</td>
                <td className="px-6 py-4"><span className="capitalize px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{sub.status}</span></td>
                <td className="px-6 py-4">{new Date(sub.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <Link to={`/submission/${sub.id}`} className="flex items-center gap-1 font-medium text-primary hover:underline">
                    <Eye size={16} />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}