import { createClient, type SupabaseClient, type Session } from '@supabase/supabase-js';
import { getAllMakanan, type MakananFavorit } from '../db/makanan';
import { getAllLogMakanan, type LogMakanan } from '../db/log_makanan';
import { getAllSiklus, type SiklusHaid } from '../db/siklus';
import { getAllMoodLogs, type MoodLog } from '../db/mood';
import { getAllRencana, type RencanaTempat } from '../db/rencana';
import { getAllMomen, type Momen } from '../db/momen';
import { getAllWishlist, getAllUkuran, type WishlistHadiah, type UkuranPasangan } from '../db/wishlist';
import { getAllTriggerWords, type TriggerWord } from '../db/trigger';
import { getAllOrang, type OrangPenting } from '../db/orang';
import { getSetting, setSetting } from '../db/settings';

let supabase: SupabaseClient | null = null;
let syncEnabled = false;
let currentSession: Session | null = null;

const TABLES = [
  'makanan_favorit', 'log_makanan', 'siklus_haid', 'mood_log',
  'rencana_tempat', 'momen', 'wishlist_hadiah', 'ukuran_pasangan',
  'trigger_words', 'orang_penting'
];

function getRedirectUrl(): string {
  return window.location.origin + window.location.pathname;
}

export async function initSync(): Promise<boolean> {
  const url = await getSetting('supabase_url');
  const key = await getSetting('supabase_key');

  if (!url || !key) return false;

  try {
    supabase = createClient(url, key);

    // Try to restore session from localStorage
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      currentSession = data.session;
      // If we have a session, set it on the client
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }

    const { error } = await supabase.from('settings').select('*').limit(1);
    if (error) {
      console.error('Supabase connection failed:', error.message);
      supabase = null;
      return false;
    }
    syncEnabled = true;
    console.log('☁️ Supabase sync enabled');
    return true;
  } catch (e) {
    console.error('Supabase init failed:', e);
    supabase = null;
    return false;
  }
}

export function isSyncEnabled(): boolean {
  return syncEnabled;
}

export function getSession(): Session | null {
  return currentSession;
}

export async function signInWithOAuth(): Promise<string | null> {
  if (!supabase) return 'Not connected. Enter URL + anon key first.';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getRedirectUrl(),
      skipBrowserRedirect: false,
    },
  });

  if (error) return error.message;
  return null;
}

export async function signInWithEmail(email: string): Promise<string | null> {
  if (!supabase) return 'Not connected. Enter URL + anon key first.';

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: getRedirectUrl(),
    },
  });

  if (error) return error.message;
  return null;
}

export async function handleAuthCallback(): Promise<string | null> {
  // Check URL for auth callback parameters
  const hash = window.location.hash;
  if (!supabase) return null;

  try {
    // PKCE callback is handled automatically by supabase-js
    const { data, error } = await supabase.auth.getSession();
    if (error) return error.message;
    if (data.session) {
      currentSession = data.session;
      syncEnabled = true;
      console.log('☁️ Authenticated via OAuth');
      // Clean up URL
      if (hash && hash.includes('access_token')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  } catch (e) {
    return String(e);
  }
  return null;
}

export async function signOut(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
  currentSession = null;
  syncEnabled = false;
}

export async function pushAllToCloud(): Promise<{ success: boolean; message: string }> {
  if (!supabase || !syncEnabled) return { success: false, message: 'Sync not configured' };

  try {
    const [makanan, log, siklus, mood, rencana, momen, wishlist, ukuran, trigger, orang] =
      await Promise.all([
        getAllMakanan(), getAllLogMakanan(), getAllSiklus(), getAllMoodLogs(''),
        getAllRencana(), getAllMomen(), getAllWishlist(), getAllUkuran(),
        getAllTriggerWords(), getAllOrang()
      ]);

    await uploadTable('makanan_favorit', makanan);
    await uploadTable('log_makanan', log);
    await uploadTable('siklus_haid', siklus);
    await uploadTable('mood_log', mood);
    await uploadTable('rencana_tempat', rencana);
    await uploadTable('momen', momen);
    await uploadTable('wishlist_hadiah', wishlist);
    await uploadTable('ukuran_pasangan', ukuran);
    await uploadTable('trigger_words', trigger);
    await uploadTable('orang_penting', orang);

    return { success: true, message: 'Data synced to cloud' };
  } catch (e) {
    return { success: false, message: 'Sync failed: ' + String(e) };
  }
}

async function uploadTable(table: string, rows: any[]) {
  if (!supabase || rows.length === 0) return;
  for (const row of rows) {
    const { id, created_at, updated_at, ...data } = row;
    const existing = await supabase.from(table).select('id').eq('id', id).maybeSingle();
    if (existing.data) {
      await supabase.from(table).update({ ...data, updated_at: new Date().toISOString() }).eq('id', id);
    } else {
      await supabase.from(table).insert({ id, ...data, created_at, updated_at });
    }
  }
}

export async function checkSyncStatus(): Promise<{
  configured: boolean;
  connected: boolean;
  authenticated: boolean;
  localRows: number;
  cloudRows: number;
}> {
  const url = await getSetting('supabase_url');
  const key = await getSetting('supabase_key');
  const configured = !!(url && key);

  let connected = false;
  let authenticated = !!currentSession;
  let cloudRows = 0;

  if (syncEnabled && supabase) {
    try {
      let total = 0;
      for (const table of TABLES) {
        const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (count) total += count;
      }
      cloudRows = total;
      connected = true;
    } catch (_) {}
  }

  return { configured, connected, authenticated, localRows: 0, cloudRows };
}
