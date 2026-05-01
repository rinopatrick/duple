import { queryAll, execute } from './core';

export interface Setting {
  key: string;
  value: string;
  updated_at: string;
}

export async function getSetting(key: string): Promise<string | null> {
  const results = await queryAll<Setting>('SELECT * FROM settings WHERE key = ?', [key]);
  return results.length > 0 ? results[0].value : null;
}

export async function setSetting(key: string, value: string) {
  return execute(
    'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, datetime("now","localtime"))',
    [key, value]
  );
}

export async function getAllSettings(): Promise<Setting[]> {
  return queryAll<Setting>('SELECT * FROM settings ORDER BY key');
}
