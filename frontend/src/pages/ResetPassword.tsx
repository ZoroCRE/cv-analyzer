import { Link } from 'react-router-dom';
import Logo from '@/assets/logo.svg';
import toast from 'react-hot-toast';

export default function ResetPassword() {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would handle the password update.
    // For now, we just show a notification.
    toast.error('This feature is not yet available in the backend.');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-dark-bg">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl dark:bg-dark-surface">
        <div className="text-center">
            <img className="w-auto h-12 mx-auto" src={Logo} alt="App Logo" />
            <h2 className="mt-4 text-3xl font-extrabold text-neutral-900 dark:text-dark-subtle">Set a New Password</h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-dark-text">Enter your new password below.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-800 dark:text-dark-text">New Password</label>
                <input id="password" type="password" required
                    className="w-full px-3 py-2 mt-1 bg-white border rounded-md border-neutral-300 dark:bg-dark-bg dark:border-neutral-700 dark:text-dark-text"/>
            </div>
             <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-800 dark:text-dark-text">Confirm New Password</label>
                <input id="confirm-password" type="password" required
                    className="w-full px-3 py-2 mt-1 bg-white border rounded-md border-neutral-300 dark:bg-dark-bg dark:border-neutral-700 dark:text-dark-text"/>
            </div>
            <div>
                <button type="submit" className="w-full px-4 py-2 font-semibold text-white transition duration-200 bg-primary rounded-md hover:bg-primary-dark">
                    Change Password
                </button>
            </div>
        </form>
         <p className="text-sm text-center">
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              Back to Login
            </Link>
        </p>
      </div>
    </div>
  );
}