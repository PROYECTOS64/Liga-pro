const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJugadores() {
  console.log('Querying Supabase jugadores...');
  const { data, error } = await supabase.from('jugadores').select('*').limit(1);
  if (error) {
    console.error('Error fetching jugadores:', error.message);
  } else {
    console.log('Success, table exists. First row (or empty):', data);
  }

  const { data: staff, error: errorStaff } = await supabase.from('staff').select('*').limit(1);
  if (errorStaff) {
    console.error('Error fetching staff:', errorStaff.message);
  } else {
    console.log('Success, staff table exists. First row (or empty):', staff);
  }
}

checkJugadores();
