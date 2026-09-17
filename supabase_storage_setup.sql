-- ====================================================================
-- CONFIGURACIÓN DE SUPABASE STORAGE (BUCKET PARA FOTOS DE VEHÍCULOS)
-- Ejecutar este script en el SQL Editor de tu proyecto Supabase
-- ====================================================================

-- 1. Crear el bucket público 'vehicle-images'
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permitir lectura pública de imágenes
CREATE POLICY "Lectura publica de imágenes de vehículos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicle-images');

-- 3. Permitir subida pública de imágenes
CREATE POLICY "Subida publica de imágenes de vehículos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vehicle-images');
