/**
 * Configuración del Estado Operativo del Sitio (Sitio Automotor)
 * 
 * - SITE_SUSPENDED: true  -> Muestra únicamente "Fuera de servicio"
 * - SITE_SUSPENDED: false -> Sitio 100% normal cuando el cliente pague
 * 
 * Acceso secreto para desarrollador:
 * Entrar con ?dev_access=kevdev en la URL (o haciendo clic en el texto "Fuera de servicio")
 */
export const SITE_CONFIG = {
  SITE_SUSPENDED: true,
  BYPASS_SECRET_KEY: 'kevdev',
  TITLE: 'Fuera de servicio'
};
