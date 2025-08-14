import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '@/api/supabaseClient';
import Logo from '@/assets/logo.svg';
import { useTranslation } from 'react-i18next';

export default function Login() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            toast.error(error.message);
        } else {
            toast.success('Logged in successfully!');
            navigate('/dashboard');
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-neutral-100 dark:bg-dark-bg">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl dark:bg-dark-surface">
                <div className="text-center">
                    <img className="w-auto h-12 mx-auto" src={Logo} alt={t('appName')} />
                    <h2 className="mt-6 text-3xl font-extrabold text-neutral-900 dark:text-dark-subtle">{t('login.title')}</h2>
                    <p className="mt-2 text-sm text-neutral-800 dark:text-dark-text">{t('login.subtitle')}</p>
                </div>
                <form className="space-y-6" onSubmit={handleLogin}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-800 dark:text-dark-text">{t('login.emailLabel')}</label>
                        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 mt-1 bg-white border rounded-md border-neutral-300 focus:outline-none focus:ring-primary focus:border-primary dark:bg-dark-bg dark:border-neutral-600 dark:text-dark-text"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-neutral-800 dark:text-dark-text">{t('login.passwordLabel')}</label>
                        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                             className="w-full px-3 py-2 mt-1 bg-white border rounded-md border-neutral-300 focus:outline-none focus:ring-primary focus:border-primary dark:bg-dark-bg dark:border-neutral-600 dark:text-dark-text"
                        />
                    </div>
                    <div className="flex items-center justify-end">
                        <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-dark">{t('login.forgotPassword')}</Link>
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="w-full px-4 py-2 font-semibold text-white transition duration-200 bg-primary rounded-md hover:bg-primary-dark disabled:bg-neutral-400">
                            {loading ? '...' : t('login.button')}
                        </button>
                    </div>
                </form>
                <p className="text-sm text-center text-neutral-800 dark:text-dark-text">
                    {t('login.noAccount')}{' '}
                    <Link to="/signup" className="font-medium text-primary hover:text-primary-dark">{t('login.signUp')}</Link>
                </p>
            </div>
        </div>
    );
};