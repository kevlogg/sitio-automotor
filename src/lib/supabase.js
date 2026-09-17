import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fzqqzvurwggqwvhvspxc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_mr5gzrvkIj62Nf4zbCuqYg_Pn1hhp7z';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Subir un archivo de imagen al bucket público 'vehicle-images' en Supabase Storage
 * @param {File} file
 * @returns {Promise<string>} URL pública de la imagen subida
 */
export async function uploadVehicleImage(file) {
  if (!file) return null;

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const { error } = await supabase.storage
    .from('vehicle-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Error al subir imagen a Supabase Storage:', error);
    throw error;
  }

  const { data: publicUrlData } = supabase.storage
    .from('vehicle-images')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
