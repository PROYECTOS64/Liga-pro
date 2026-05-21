const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@ligapro.ec',
    password: 'admin123',
    options: {
      data: {
        nombre_completo: 'Administrador Principal',
      }
    }
  });

  if (error) {
    console.error('Error creating admin:', error.message);
  } else {
    console.log('Admin created successfully!', data.user.email);
  }
}

createAdmin();
