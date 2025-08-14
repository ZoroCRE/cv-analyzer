import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '@/api/supabaseClient';
import Logo from '@/assets/logo.svg';

export default function Signup() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
            },
        });

        if (error) {
            toast.error(error.message);
        } else if (data.user?.identities?.length === 0) {
            toast.error("This email may already be in use.");
        } else {
            toast.success('Success! Please check your email for a confirmation link.');
            navigate('/login');
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-dark-bg">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl dark:bg-dark-surface">
                <div className="text-center">
                    <img className="w-auto h-12 mx-auto" src={Logo} alt="App Logo" />
                    <h2 className="text-3xl font-extrabold text-center text-neutral-900 dark:text-dark-subtle">Create your account</h2>
                </div>
                <form className="space-y-6" onSubmit={handleSignup}>
                     <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-neutral-800 dark:text-dark-text">Full Name</label>
                        <input id="fullName" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2 mt-1 bg-white border rounded-md border-neutral-300 dark:bg-dark-bg dark:border-neutral-700 dark:text-dark-text"/>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-800 dark:text-dark-text">Email address</label>
                        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 mt-1 bg-white border rounded-md border-neutral-300 dark:bg-dark-bg dark:border-neutral-700 dark:text-dark-text"/>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-neutral-800 dark:text-dark-text">Password (min. 6 characters)</label>
                        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 mt-1 bg-white border rounded-md border-neutral-300 dark:bg-dark-bg dark:border-neutral-700 dark:text-dark-text"/>
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="w-full px-4 py-2 font-semibold text-white transition duration-200 bg-primary rounded-md hover:bg-primary-dark disabled:bg-neutral-400">
                            {loading ? 'Creating...' : 'Sign Up'}
                        </button>
                    </div>
                </form>
                 <p className="text-sm text-center text-neutral-600 dark:text-dark-text">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-primary hover:text-primary-dark">Sign In</Link>
                </p>
            </div>
        </div>
    );
};