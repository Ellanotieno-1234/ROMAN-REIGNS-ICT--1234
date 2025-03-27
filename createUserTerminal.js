const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function createUser() {
  const timestamp = Date.now();
  const email = `testuser${timestamp}@example.com`;
  const password = 'password123';
  const role = 'Student';
  
  try {
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { role }
    });

    if (authError) throw authError;

    // Create public.users record
    const { error: userError } = await supabase
      .from('users')
      .insert([{
        id: authUser.user.id,
        email,
        role
      }]);

    if (userError) throw userError;

    // Create app_users record
    const { error: appUserError } = await supabase
      .from('app_users')
      .insert([{
        id: authUser.user.id,
        name: 'New User',
        email,
        password,
        role
      }]);

    if (appUserError) throw appUserError;

    console.log('User created successfully:', authUser.user);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

createUser();
