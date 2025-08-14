import { useQuery } from '@tanstack/react-query';
import http from '@/lib/http';
import { StatCard } from '@/components/ui/StatCard';
import { DollarSign, FileStack, BarChart, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const getDashboardStats = async () => {
    const { data } = await http.get('/dashboard/stats');
    return data;
}

export default function Dashboard() {
    const { user } = useAuth();
    const { data, isLoading } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: getDashboardStats,
    });

    return (
        <>
            <h1 className="text-3xl font-bold">Welcome, {user?.profile?.displayName}!</h1>
            <div className="grid grid-cols-1 gap-6 mt-6 sm:grid-cols-2 lg:grid-cols-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={100} />)
                ) : (
                    <>
                        <StatCard title="Credits Left" value={data?.credits_left ?? 0} icon={DollarSign} colorClass="bg-accent" />
                        <StatCard title="Total Submissions" value={data?.total_submissions ?? 0} icon={FileStack} colorClass="bg-primary" />
                        <StatCard title="CVs Processed" value={data?.total_cvs_processed ?? 0} icon={CheckCircle} colorClass="bg-secondary" />
                        <StatCard title="Average Score" value={`${Math.round(data?.average_score) || 0}%`} icon={BarChart} colorClass="bg-red-500" />
                    </>
                )}
            </div>
            {data?.total_submissions === 0 && !isLoading && (
                <div className="p-8 mt-8 text-center bg-white rounded-lg dark:bg-dark-surface">
                    <h2 className="text-xl font-semibold">No data yet!</h2>
                    <p className="mt-2 text-neutral-600 dark:text-dark-subtle">Start by uploading a CV to see your stats here.</p>
                </div>
            )}
        </>
    );
}