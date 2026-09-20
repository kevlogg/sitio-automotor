-- ====================================================================
-- ESQUEMA Y CONFIGURACIÓN COMPLETA DE SUPABASE (TABLAS + STORAGE + RLS)
-- Proyecto: Sitio Automotor
-- Ejecutar este script completo en el SQL Editor de Supabase
-- ====================================================================

-- 0. TABLA DE PERFILES DE USUARIO (Particular / Agencia / Negocio Automotor)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  user_type TEXT DEFAULT 'particular' CHECK (user_type IN ('particular', 'agencia', 'negocio_automotor')),
  phone_whatsapp TEXT,
  city TEXT,
  province TEXT,
  business_name TEXT,
  rubro TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir lectura publica de perfiles') THEN
    CREATE POLICY "Permitir lectura publica de perfiles" ON public.profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir crear y editar perfil propio') THEN
    CREATE POLICY "Permitir crear y editar perfil propio" ON public.profiles FOR ALL USING (auth.uid() = id);
  END IF;
END $$;

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

-- 3. TABLA DE LEADS / CONTACTOS POR WHATSAPP (Métricas)
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  seller_whatsapp TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. POLÍTICAS DE SEGURIDAD EN TABLAS (RLS)
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir lectura publica de vehículos activos') THEN
    CREATE POLICY "Permitir lectura publica de vehículos activos" ON public.vehicles FOR SELECT USING (status = 'active');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir lectura publica del directorio de servicios') THEN
    CREATE POLICY "Permitir lectura publica del directorio de servicios" ON public.services_directory FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir publicar vehículos de forma publica') THEN
    CREATE POLICY "Permitir publicar vehículos de forma publica" ON public.vehicles FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir registrar leads por WhatsApp') THEN
    CREATE POLICY "Permitir registrar leads por WhatsApp" ON public.leads FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 5. CREACIÓN DEL BUCKET DE SUPABASE STORAGE (FOTOS HD)
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Lectura publica de imágenes de vehículos') THEN
    CREATE POLICY "Lectura publica de imágenes de vehículos" ON storage.objects FOR SELECT USING (bucket_id = 'vehicle-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Subida publica de imágenes de vehículos') THEN
    CREATE POLICY "Subida publica de imágenes de vehículos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vehicle-images');
  END IF;
END $$;
