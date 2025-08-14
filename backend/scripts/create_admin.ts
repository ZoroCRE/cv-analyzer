import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in your .env file.');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// --- THE FIX IS HERE ---
// Changed .zoro to .com to pass validation
const ADMIN_EMAIL = 'Zoro@cvanalyzer.com'; 
const ADMIN_PASSWORD = 'Eipazha12311!@#';

async function createAdmin() {
    console.log(`Attempting to create admin user: ${ADMIN_EMAIL}`);

    const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: {
            data: {
                full_name: 'CV Analyzer Admin'
            }
        }
    });

    if (authError) {
        if (authError.message.includes('User already registered')) {
            console.warn(`User ${ADMIN_EMAIL} already exists. Attempting to update role.`);

            const { data: { users }, error: getUserError } = await supabaseAdmin.auth.admin.listUsers();
            if(getUserError) {
                console.error('Could not list users to find existing admin:', getUserError.message);
                return;
            }
            const existingUser = users.find(u => u.email === ADMIN_EMAIL);
            if (!existingUser) {
                console.error(`Could not find the user object for ${ADMIN_EMAIL} despite existence error.`);
                return;
            }
            await updateUserRole(existingUser.id);

        } else {
            console.error('Error creating auth user:', authError.message);
            return;
        }
    } else if (authData.user) {
        console.log('Auth user created successfully.');
        await updateUserRole(authData.user.id);
    } else {
        console.error('An unknown error occurred during user creation.');
    }
}

async function updateUserRole(userId: string) {
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);

    if (profileError) {
        console.error(`Error updating profile to admin for user ID ${userId}:`, profileError.message);
    } else {
        console.log(`✅ Successfully set user ${ADMIN_EMAIL} (ID: ${userId}) role to 'admin'.`);
        console.log('IMPORTANT: Please change the default password immediately after logging in.');
    }
}

createAdmin();