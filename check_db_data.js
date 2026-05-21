const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
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

async function checkData() {
  console.log('Querying Supabase...');
  
  const { data: comps, error: errComp } = await supabase.from('competiciones').select('*');
  if (errComp) console.error('Error fetching competiciones:', errComp.message);
  else console.log('Competiciones found:', comps.length, comps);
  
  const { data: clubs, error: errClubs } = await supabase.from('clubes').select('*');
  if (errClubs) console.error('Error fetching clubes:', errClubs.message);
  else console.log('Clubes found:', clubs.length, clubs.slice(0, 3));
  
  const { data: partidos, error: errPartidos } = await supabase
    .from('partidos')
    .select('*, local:club_local_id ( nombre, abreviatura, color_principal, estadios:estadio_id ( nombre, ciudad ) ), visitante:club_visitante_id ( nombre, abreviatura, color_principal )')
    .limit(1);
  if (errPartidos) console.error('Error fetching partidos:', errPartidos.message);
  else console.log('Partidos with stadium details:', JSON.stringify(partidos, null, 2));

  const { data: incidencias, error: errInc } = await supabase
    .from('incidencias')
    .select('*')
    .limit(5);
  if (errInc) console.error('Error fetching incidencias:', errInc.message);
  else console.log('Incidencias found (first 5):', incidencias.length, incidencias);

  const { data: perfiles, error: errPerf } = await supabase
    .from('perfiles')
    .select('*');
  if (errPerf) console.error('Error fetching perfiles:', errPerf.message);
  else console.log('Perfiles found:', perfiles.length, perfiles);
}

checkData();
