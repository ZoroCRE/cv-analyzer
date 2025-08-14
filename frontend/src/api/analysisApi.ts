import axios from 'axios';
import { supabase } from './supabaseClient';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Analysis
export const uploadCvsApi = async (formData: FormData) => {
    const { data } = await api.post('/analysis/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

// Results
export const getSubmissionsApi = async () => {
    const { data } = await api.get('/results/submissions');
    return data;
};

export const getSubmissionDetailsApi = async (submissionId: string) => {
    const { data } = await api.get(`/results/submission/${submissionId}`);
    return data;
};

export const getCvAnalysisDetailApi = async (cvId: string) => {
    const { data } = await api.get(`/results/cv/${cvId}`);
    return data;
};

// Dashboard
export const getDashboardStatsApi = async () => {
    const { data } = await api.get('/dashboard/stats');
    return data;
};

// Keywords
export const getKeywordListsApi = async () => {
    const { data } = await api.get('/keywords');
    return data;
};

export const createKeywordListApi = async (listData: { list_name: string; keywords: string[] }) => {
    const { data } = await api.post('/keywords', listData);
    return data;
};

export const deleteKeywordListApi = async (listId: number) => {
    await api.delete(`/keywords/${listId}`);
};

// Admin
export const getAdminUsersApi = async () => {
    const { data } = await api.get('/admin/users');
    return data;
}

export const addCreditsApi = async ({ userId, amount, reason }: { userId: string, amount: number, reason: string }) => {
    const { data } = await api.post(`/admin/users/${userId}/credits`, { amount, reason });
    return data;
}