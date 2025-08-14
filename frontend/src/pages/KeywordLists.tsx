import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@/lib/http';
import { useModal } from '@/hooks/useModal';
import Modal from '@/components/ui/Modal';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { PlusCircle, Trash2 } from 'lucide-react';

interface KeywordList {
  id: number;
  list_name: string;
  keywords: string[];
}

const getKeywordLists = async (): Promise<KeywordList[]> => {
  const { data } = await http.get('/keywords/lists');
  return data;
}

const createKeywordList = async (newList: { list_name: string, keywords: string[] }) => {
  const { data } = await http.post('/keywords/lists', newList);
  return data;
}

export default function KeywordLists() {
  const queryClient = useQueryClient();
  const { isOpen, open, close } = useModal();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ list_name: string, keywords: string }>();

  const { data: lists, isLoading } = useQuery({ queryKey: ['keywordLists'], queryFn: getKeywordLists });
  
  const mutation = useMutation({
    mutationFn: createKeywordList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keywordLists'] });
      toast.success('Keyword list created successfully!');
      reset();
      close();
    },
    onError: () => {
      toast.error('Failed to create keyword list.');
    }
  });

  const onSubmit = (data: { list_name: string, keywords: string }) => {
    const keywordsArray = data.keywords.split(',').map(k => k.trim()).filter(Boolean);
    if (keywordsArray.length === 0) {
        toast.error('Please enter at least one keyword.');
        return;
    }
    mutation.mutate({ list_name: data.list_name, keywords: keywordsArray });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Keyword Lists</h1>
        <button onClick={open} className="flex items-center gap-2 px-4 py-2 font-semibold text-white rounded-md bg-primary hover:bg-primary-dark">
          <PlusCircle size={18} />
          Create New List
        </button>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow dark:bg-dark-surface">
        {isLoading ? <p className="p-4">Loading lists...</p> : (
            <ul className="divide-y dark:divide-neutral-700">
                {lists?.map(list => (
                    <li key={list.id} className="flex items-center justify-between p-4">
                        <div>
                            <h3 className="font-semibold">{list.list_name}</h3>
                            <p className="text-sm text-neutral-600 dark:text-dark-subtle">{list.keywords.slice(0, 5).join(', ')}{list.keywords.length > 5 ? '...' : ''}</p>
                        </div>
                        <button className="p-2 text-red-500 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50">
                            <Trash2 size={18} />
                        </button>
                    </li>
                ))}
            </ul>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={close} title="Create New Keyword List">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="list_name" className="block mb-1 font-medium">List Name</label>
            <input {...register("list_name", { required: "Name is required" })} id="list_name" className="w-full p-2 border rounded-md dark:bg-dark-bg dark:border-neutral-600"/>
            {errors.list_name && <p className="mt-1 text-sm text-red-500">{errors.list_name.message}</p>}
          </div>
          <div>
            <label htmlFor="keywords" className="block mb-1 font-medium">Keywords (comma-separated)</label>
            <textarea {...register("keywords", { required: "Keywords are required" })} id="keywords" rows={4} className="w-full p-2 border rounded-md dark:bg-dark-bg dark:border-neutral-600"></textarea>
            {errors.keywords && <p className="mt-1 text-sm text-red-500">{errors.keywords.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={close} className="px-4 py-2 rounded-md bg-neutral-200 dark:bg-neutral-600">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="px-4 py-2 font-semibold text-white rounded-md bg-primary hover:bg-primary-dark disabled:bg-neutral-400">
              {mutation.isPending ? "Creating..." : "Create List"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}