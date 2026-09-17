-- ====================================================================
-- ESQUEMA DE BASE DE DATOS PARA SITIO AUTOMOTOR (SUPABASE)
-- Ejecutar este archivo completo en el SQL Editor de tu proyecto Supabase
-- ====================================================================

-- 1. TABLA DE VEHÍCULOS
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- 'autos', 'camionetas', 'motos', 'camiones', 'nautica'
  category_label TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT,
  year INTEGER NOT NULL,
  mileage TEXT NOT NULL,
  mileage_num INTEGER DEFAULT 0,
  fuel TEXT NOT NULL DEFAULT 'Nafta',
  transmission TEXT NOT NULL DEFAULT 'Manual',
  price_currency TEXT DEFAULT 'USD',
  price NUMERIC NOT NULL,
  formatted_price TEXT,
  location TEXT NOT NULL,
  seller_type TEXT DEFAULT 'Particular Verificado',
  seller_name TEXT NOT NULL,
  seller_whatsapp TEXT NOT NULL,
  badge TEXT,
  badge_color TEXT,
  image_url TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  description TEXT,
  features TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active', -- 'active', 'paused', 'sold'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DEL DIRECTORIO "MUNDO AUTOMOTOR" (Servicios y Rubros)
CREATE TABLE IF NOT EXISTS public.services_directory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rubro_id TEXT NOT NULL, -- 'repuestos', 'talleres', 'lubricentros', 'gomerias', etc.
  name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  province TEXT NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  rating NUMERIC DEFAULT 5.0,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE LEADS / CONTACTOS POR WHATSAPP (Metricas)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  seller_whatsapp TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CONFIGURACIÓN DE POLÍTICAS DE SEGURIDAD (RLS)
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Políticas de Lectura Pública
CREATE POLICY "Permitir lectura publica de vehículos activos"
  ON public.vehicles FOR SELECT
  USING (status = 'active');

CREATE POLICY "Permitir lectura publica del directorio de servicios"
  ON public.services_directory FOR SELECT
  USING (true);

-- Políticas de Inserción Pública (Publicaciones y Leads)
CREATE POLICY "Permitir publicar vehículos de forma publica"
  ON public.vehicles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir registrar leads por WhatsApp"
  ON public.leads FOR INSERT
  WITH CHECK (true);

-- ====================================================================
-- SEED DATA DE PRUEBA (PUBLICACIONES INICIALES DESTACADAS)
-- ====================================================================
INSERT INTO public.vehicles (
  title, category, category_label, brand, model, year, mileage, mileage_num,
  fuel, transmission, price_currency, price, formatted_price, location,
  seller_type, seller_name, seller_whatsapp, badge, badge_color, image_url,
  images, description, features
) VALUES 
(
  'Toyota Corolla 2.0 SEG CVT', 'autos', 'Autos', 'Toyota', 'Corolla', 2023, '18.000 km', 18000,
  'Nafta', 'Automática', 'USD', 26500, 'USD 26.500', 'Buenos Aires, CABA',
  'Agencia Verificada', 'KevDev Premium Motors', '5491134567890', 'Destacado', 'indigo',
  'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=1200&auto=format&fit=crop',
  ARRAY[
    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop'
  ],
  'Excelente unidad 2023 en estado inmaculado. Único dueño, service oficiales al día.',
  ARRAY['Toyota Safety Sense', 'Asientos de Cuero', 'Cámara 360°', 'Apple CarPlay']
),
(
  'Volkswagen Amarok V6 Extreme 3.0 TDI 4x4', 'camionetas', 'Pick-ups', 'Volkswagen', 'Amarok', 2022, '34.000 km', 34000,
  'Diésel', 'Automática 8va', 'USD', 42900, 'USD 42.900', 'Córdoba, Capital',
  'Particular Verificado', 'Martín Rossi', '5493512345678', 'Oportunidad', 'emerald',
  'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop',
  ARRAY['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1200&auto=format&fit=crop'],
  'Amarok V6 258 CV en impecable estado. Todos los mantenimientos realizados en concesionario.',
  ARRAY['Motor V6 258 CV', 'Tracción 4Motion', 'Llantas Talca 20"']
);
