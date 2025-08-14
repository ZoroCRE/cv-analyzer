import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import { getSubmissionDetailsApi } from '@/api/analysisApi';
import ResultsTable from '@/components/ResultsTable';
import { FullPageLoader } from '@/components/ui/FullPageLoader'; // Corrected Path

export default function SubmissionDetail() {
    const { id } = useParams<{ id: string }>();

    const { data, isLoading, error } = useQuery({
        queryKey: ['submissionDetail', id],
        queryFn: () => getSubmissionDetailsApi(id!),
        enabled: !!id,
        refetchInterval: (query: any) => {
            const submissionStatus = query.state.data?.submission?.status;
            return submissionStatus === 'processing' || submissionStatus === 'pending' ? 5000 : false;
        },
    });

    if (isLoading) return <MainLayout><FullPageLoader /></MainLayout>;
    if (error) return <MainLayout><p>Error: {error.message}</p></MainLayout>;
    if (!data) return <MainLayout><p>Submission not found.</p></MainLayout>;

    const { submission, results } = data;

    return (
        <MainLayout>
            <h1 className="text-3xl font-bold">{submission.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-neutral-600 dark:text-dark-text">
                <span>Status: <span className="font-semibold capitalize">{submission.status}</span></span>
                <span>Processed: {submission.processed_files}/{submission.total_files}</span>
                <span>Failed: {submission.failed_files}</span>
            </div>
            
            <div className="mt-6">
                <ResultsTable results={results} />
            </div>
        </MainLayout>
    );
};