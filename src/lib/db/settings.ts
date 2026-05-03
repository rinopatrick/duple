import { queryAll, execute } from './core';
import { encryptValue, decryptValue } from '../utils/crypto';

const ENCRYPTED_KEYS = ['supabase_key', 'llm_api_key', 'openai_key', 'anthropic_key', 'google_key', 'groq_key', 'openrouter_key'];

export interface Setting {
  key: string;
  value: string;
  updated_at: string;
}

export async function getSetting(key: string): Promise<string | null> {
  const results = await queryAll<Setting>('SELECT * FROM settings WHERE key = ?', [key]);
  if (results.length === 0) return null;
  let value = results[0].value;
  if (ENCRYPTED_KEYS.includes(key) && value.startsWith('enc:')) {
    try {
      value = await decryptValue(value.slice(4));
    } catch {
      return null;
    }
  }
  return value;
}

export async function setSetting(key: string, value: string) {
  if (ENCRYPTED_KEYS.includes(key) && value) {
    value = 'enc:' + await encryptValue(value);
  }
  return execute(
    'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime("now","localtime"))',
    [key, value]
  );
}

export async function getAllSettings(): Promise<Setting[]> {
  return queryAll<Setting>('SELECT * FROM settings ORDER BY key');
}
