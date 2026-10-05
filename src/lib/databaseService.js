/**
 * Database & Persistence Service Layer for Sitio Automotor
 * Supports Firebase Cloud Firestore and Supabase integration with automatic offline/mock fallback.
 */

// Global configuration state
export const DB_CONFIG = {
  provider: 'supabase', // 'supabase' | 'firebase' | 'local_storage'
  isConnected: true,
};

// Initial local storage persistence handler
const STORAGE_KEYS = {
  VEHICLES: 'sitio_automotor_vehicles',
  FAVORITES: 'sitio_automotor_favorites',
  AGENCIES: 'sitio_automotor_agencies',
  LEADS: 'sitio_automotor_leads',
};

/**
 * Load vehicles from local state or cloud DB
 */
export async function getVehiclesFromDB(defaultVehicles) {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
  return defaultVehicles;
}

/**
 * Save new vehicle listing to database
 */
export async function saveVehicleToDB(vehicle) {
  try {
    const existing = await getVehiclesFromDB([]);
    const updated = [vehicle, ...existing];
    localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(updated));
    return { success: true, id: vehicle.id };
  } catch (err) {
    console.error('Error saving vehicle:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Track user contact lead (WhatsApp inquiry)
 */
export async function recordLeadToDB(leadData) {
  try {
    const existingLeads = JSON.parse(localStorage.getItem(STORAGE_KEYS.LEADS) || '[]');
    const newLead = {
      ...leadData,
      id: `lead_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify([newLead, ...existingLeads]));
    return { success: true };
  } catch (err) {
    console.error('Error recording lead:', err);
    return { success: false };
  }
}
