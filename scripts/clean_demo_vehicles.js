import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);

if (!urlMatch || !keyMatch) {
  console.error('Error: No se pudieron leer las credenciales de Supabase en .env.local');
  process.exit(1);
}

const supabaseUrl = urlMatch[1].trim();
const supabaseServiceKey = keyMatch[1].trim();

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clean() {
  console.log('--- Eliminando todas las publicaciones de la base de datos Supabase ---');
  const { data, error } = await supabase.from('vehicles').delete().neq('id', '00000000-0000-0000-0000-000000000000').select();

  if (error) {
    console.error('❌ Error al eliminar vehículos:', error.message);
  } else {
    console.log(`✅ Se eliminaron ${data ? data.length : 0} publicaciones correctamente de la base de datos.`);
  }
}

clean();
