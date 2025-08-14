import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { uploadCvsApi, getKeywordListsApi } from '@/api/analysisApi';
import { FileUploadArea } from '@/components/FileUploadArea';
import { useTranslation } from 'react-i18next';

type KeywordList = {
  id: number;
  list_name: string;
};

type SubmissionResponse = {
  submission: {
    id: number;
  }
}

export default function Upload() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [files, setFiles] = useState<any[]>([]);
    const [keywords, setKeywords] = useState('');
    const [title, setTitle] = useState('');
    const [keywordListId, setKeywordListId] = useState('');

    const { data: keywordLists } = useQuery<KeywordList[]>({
      queryKey: ['keywordLists'],
      queryFn: getKeywordListsApi
    });

    const { mutate, isPending } = useMutation<SubmissionResponse, Error, FormData>({
        mutationFn: (formData: FormData) => uploadCvsApi(formData),
        onSuccess: (data) => {
            toast.success('Submission created! Processing has begun.');
            navigate(`/submission/${data.submission.id}`);
        },
        onError: (error: any) => {
            toast.error(`Submission failed: ${error.response?.data?.message || error.message}`);
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (files.length === 0) {
            toast.error("Please select at least one CV file.");
            return;
        }

        const formData = new FormData();
        files.forEach(fileItem => {
            formData.append('cvs', fileItem.file);
        });
        
        if (title) formData.append('submission_title', title);
        if (keywords) formData.append('keywords', keywords);
        if (keywordListId) formData.append('keyword_list_id', keywordListId);

        mutate(formData);
    };

    return (
        <>
            <h1 className="text-3xl font-bold dark:text-dark-subtle">{t('navigation.upload')}</h1>
            <form onSubmit={handleSubmit} className="p-8 mt-6 space-y-8 bg-white rounded-lg shadow-md dark:bg-dark-surface">
                <div>
                    <label className="text-lg font-semibold text-neutral-900 dark:text-dark-text">1. Upload CVs</label>
                    <div className="mt-2">
                        <FileUploadArea onUpdateFiles={(fileItems) => setFiles(fileItems)} />
                    </div>
                </div>
                <div>
                    <label className="text-lg font-semibold text-neutral-900 dark:text-dark-text">2. Set Keywords</label>
                     <select
                         value={keywordListId}
                         onChange={(e) => { setKeywordListId(e.target.value); setKeywords(''); }}
                         className="w-full p-2 mt-2 border rounded-md border-neutral-300 dark:bg-dark-bg dark:border-neutral-700 dark:text-dark-text"
                    >
                        <option value="">-- Or select a saved list --</option>
                        {keywordLists?.map(list => (
                          <option key={list.id} value={list.id}>{list.list_name}</option>
                        ))}
                    </select>
                    <p className="my-2 text-center text-neutral-500 dark:text-dark-subtle">OR</p>
                    <textarea
                        placeholder="Enter comma-separated keywords..."
                        value={keywords}
                        onChange={(e) => { setKeywords(e.target.value); setKeywordListId(''); }}
                        className="w-full p-2 border rounded-md border-neutral-300 dark:bg-dark-bg dark:border-neutral-700 dark:text-dark-text"
                        rows={3}
                        disabled={!!keywordListId}
                    />
                </div>
                 <div>
                    <label htmlFor="title" className="text-lg font-semibold text-neutral-900 dark:text-dark-text">3. Submission Title (Optional)</label>
                     <input
                        id="title" type="text" value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Q4 Senior Developer Applicants"
                        className="w-full px-3 py-2 mt-2 border rounded-md border-neutral-300 dark:bg-dark-bg dark:border-neutral-700 dark:text-dark-text"
                    />
                </div>
                <div className="flex justify-end">
                    <button type="submit" disabled={isPending || files.length === 0} className="px-8 py-3 font-bold text-white transition-colors rounded-md bg-primary hover:bg-primary-dark disabled:bg-neutral-400">
                        {isPending ? 'Submitting...' : `Analyze ${files.length} CV(s)`}
                    </button>
                </div>
            </form>
        </>
    );
};