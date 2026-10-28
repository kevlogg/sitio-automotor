import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://sitioautomotor.com';

// Leer .env.local si existe
let supabaseUrl = 'https://gawbgyicshvyyowkrcdd.supabase.co';
let supabaseKey = '';

try {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
    const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/) || envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/);
    if (urlMatch) supabaseUrl = urlMatch[1].trim();
    if (keyMatch) supabaseKey = keyMatch[1].trim();
  }
} catch (e) {
  console.warn('Leyendo variables de entorno por defecto:', e.message);
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function generateSitemap() {
  console.log('🚀 Generando sitemap.xml dinámico para Sitio Automotor...');
  const today = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'daily', lastmod: today },
    { loc: `${SITE_URL}/vehiculos`, priority: '0.9', changefreq: 'hourly', lastmod: today },
    { loc: `${SITE_URL}/vehiculos?categoria=autos`, priority: '0.8', changefreq: 'daily', lastmod: today },
    { loc: `${SITE_URL}/vehiculos?categoria=camionetas`, priority: '0.8', changefreq: 'daily', lastmod: today },
    { loc: `${SITE_URL}/vehiculos?categoria=motos`, priority: '0.8', changefreq: 'daily', lastmod: today },
    { loc: `${SITE_URL}/vehiculos?categoria=camiones`, priority: '0.7', changefreq: 'daily', lastmod: today },
    { loc: `${SITE_URL}/vehiculos?categoria=nautica`, priority: '0.7', changefreq: 'daily', lastmod: today },
    { loc: `${SITE_URL}/vehiculos?categoria=agro`, priority: '0.7', changefreq: 'daily', lastmod: today },
    { loc: `${SITE_URL}/agencias`, priority: '0.8', changefreq: 'weekly', lastmod: today },
    { loc: `${SITE_URL}/negocios`, priority: '0.8', changefreq: 'weekly', lastmod: today }
  ];

  let vehicleUrls = [];

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('id, title, updated_at, created_at, status')
        .eq('status', 'active');

      if (!error && vehicles && vehicles.length > 0) {
        console.log(`📦 Encontrados ${vehicles.length} vehículos activos en la base de datos.`);
        vehicleUrls = vehicles.map(v => {
          const slug = `${v.id}-${slugify(v.title)}`;
          const lastmod = (v.updated_at || v.created_at || today).split('T')[0];
          return {
            loc: `${SITE_URL}/vehiculos/${slug}`,
            priority: '0.8',
            changefreq: 'weekly',
            lastmod
          };
        });
      }
    } catch (err) {
      console.warn('⚠️ No se pudieron consultar vehículos de la BD para el sitemap:', err.message);
    }
  }

  const allUrls = [...staticUrls, ...vehicleUrls];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
  fs.writeFileSync(outputPath, xmlContent.trim(), 'utf-8');
  console.log(`✅ sitemap.xml generado exitosamente con ${allUrls.length} URLs en ${outputPath}`);
}

generateSitemap();
