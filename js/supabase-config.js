// Configuration Supabase (réelle)
const SUPABASE_URL = 'https://fwkbbcizkqajvlgnswka.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3a2JiY2l6a3FhanZsZ25zd2thIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMDM0MDQsImV4cCI6MjEwMTg3OTQwNH0.B0mABdA0AF-mDZKEMHNiAjPFEiRkGKibx4_5cN5bk8U';

let supabase = null;

// Vérifier si le CDN Supabase est chargé
if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
  try {
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase initialisé');
  } catch (e) {
    console.warn('❌ Erreur initialisation Supabase, utilisation du localStorage.', e);
    supabase = null;
  }
} else {
  console.warn('⚠️ Supabase CDN non chargé, utilisation du localStorage.');
}

// Fonctions utilitaires pour basculer entre Supabase et localStorage
async function fetchFromSupabase(table) {
  if (supabase) {
    const { data, error } = await supabase.from(table).select('*');
    if (!error) return data;
    console.warn(`Erreur Supabase sur ${table}:`, error.message);
  }
  return null;
}

async function insertIntoSupabase(table, payload) {
  if (supabase) {
    const { data, error } = await supabase.from(table).insert(payload);
    if (!error) return data;
    console.warn(`Erreur insertion Supabase sur ${table}:`, error.message);
  }
  return null;
}

async function updateSupabase(table, payload, match) {
  if (supabase) {
    const { data, error } = await supabase.from(table).update(payload).match(match);
    if (!error) return data;
    console.warn(`Erreur mise à jour Supabase sur ${table}:`, error.message);
  }
  return null;
}

async function deleteFromSupabase(table, match) {
  if (supabase) {
    const { data, error } = await supabase.from(table).delete().match(match);
    if (!error) return data;
    console.warn(`Erreur suppression Supabase sur ${table}:`, error.message);
  }
  return null;
}
