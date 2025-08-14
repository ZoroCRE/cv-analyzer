import { LoaderCircle, CheckCircle, XCircle } from 'lucide-react'; // Corrected import

// Define a type for a single analysis result
type AnalysisResult = {
  id: number;
  original_filename: string;
  final_ats_score: number | null;
  keyword_score: number | null;
  technical_ats_score: number | null;
  status: 'processed' | 'failed' | 'pending' | 'processing';
};

interface ResultsTableProps {
  results: AnalysisResult[];
}

export default function ResultsTable({ results }: ResultsTableProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed': return <CheckCircle className="text-secondary" />;
      case 'failed': return <XCircle className="text-red-500" />;
      default: return <LoaderCircle className="text-yellow-500 animate-spin" />; // Corrected icon name
    }
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full text-sm text-left rtl:text-right text-neutral-500">
        <thead className="text-xs uppercase bg-neutral-50 text-neutral-700">
          <tr>
            <th scope="col" className="px-6 py-3">Filename</th>
            <th scope="col" className="px-6 py-3">Overall Score</th>
            <th scope="col" className="px-6 py-3">Keyword Score</th>
            <th scope="col" className="px-6 py-3">Technical Score</th>
            <th scope="col" className="px-6 py-3">Status</th>
            <th scope="col" className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {results.map((cv) => (
            <tr key={cv.id} className="bg-white border-b hover:bg-neutral-50">
              <th scope="row" className="px-6 py-4 font-medium whitespace-nowrap text-neutral-900">{cv.original_filename}</th>
              <td className="px-6 py-4 font-bold">{cv.final_ats_score ?? '-'}%</td>
              <td className="px-6 py-4">{cv.keyword_score ?? '-'}%</td>
              <td className="px-6 py-4">{cv.technical_ats_score ?? '-'}%</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(cv.status)}
                  <span className="capitalize">{cv.status}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <button className="font-medium text-primary hover:underline">View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}