import { useForm, SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import http from '@/lib/http';

type ProfileInputs = {
  displayName: string;
};

type PasswordInputs = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export default function Settings() {
  const { user } = useAuth();
  const { register: registerProfile, handleSubmit: handleSubmitProfile } = useForm<ProfileInputs>({
    defaultValues: { displayName: user?.profile?.displayName }
  });
  const { register: registerPassword, handleSubmit: handleSubmitPassword, watch, formState: { errors: passwordErrors } } = useForm<PasswordInputs>();
  const newPassword = watch("newPassword");

  const onProfileSubmit: SubmitHandler<ProfileInputs> = async (data) => {
    try {
      await http.patch('/user/profile', data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile.');
    }
  };

  const onPasswordSubmit: SubmitHandler<PasswordInputs> = async (data) => {
     try {
      await http.post('/user/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword });
      toast.success('Password changed successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password.');
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <div className="grid grid-cols-1 gap-8 mt-6 md:grid-cols-2">
        <div className="p-6 bg-white rounded-lg shadow dark:bg-dark-surface">
          <h2 className="text-xl font-semibold">Update Profile</h2>
          <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="mt-4 space-y-4">
            <div>
              <label htmlFor="displayName" className="block mb-1 font-medium">Display Name</label>
              <input {...registerProfile("displayName", { required: true })} id="displayName" className="w-full p-2 border rounded-md dark:bg-dark-bg dark:border-neutral-600" />
            </div>
             <div>
              <label htmlFor="email" className="block mb-1 font-medium">Email</label>
              <input value={user?.email} id="email" readOnly disabled className="w-full p-2 border rounded-md bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-600" />
            </div>
            <button type="submit" className="px-4 py-2 font-semibold text-white rounded-md bg-primary">Save Profile</button>
          </form>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow dark:bg-dark-surface">
          <h2 className="text-xl font-semibold">Change Password</h2>
           <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="mt-4 space-y-4">
            <div>
              <label htmlFor="currentPassword">Current Password</label>
              <input type="password" {...registerPassword("currentPassword", { required: true })} id="currentPassword" className="w-full p-2 border rounded-md dark:bg-dark-bg dark:border-neutral-600" />
            </div>
            <div>
              <label htmlFor="newPassword">New Password</label>
              <input type="password" {...registerPassword("newPassword", { required: true, minLength: 6 })} id="newPassword" className="w-full p-2 border rounded-md dark:bg-dark-bg dark:border-neutral-600" />
            </div>
            <div>
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input type="password" {...registerPassword("confirmPassword", { required: true, validate: (value) => value === newPassword || "Passwords do not match" })} id="confirmPassword" className="w-full p-2 border rounded-md dark:bg-dark-bg dark:border-neutral-600" />
              {passwordErrors.confirmPassword && <p className="text-sm text-red-500">{passwordErrors.confirmPassword.message as string}</p>}
            </div>
            <button type="submit" className="px-4 py-2 font-semibold text-white rounded-md bg-primary">Change Password</button>
          </form>
        </div>
      </div>
    </>
  );
}