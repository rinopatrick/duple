import { queryAll, insert, execute } from './core';

export interface SiklusHaid {
  id: number;
  tgl_mulai: string;
  tgl_selesai: string;
  flow_intensity: number;
  symptoms: string;
  notes: string;
  created_at: string;
}

export async function getAllSiklus(): Promise<SiklusHaid[]> {
  return queryAll<SiklusHaid>('SELECT * FROM siklus_haid ORDER BY tgl_mulai DESC LIMIT 50');
}

export async function createSiklus(data: Omit<SiklusHaid, 'id' | 'created_at'>) {
  return insert(
    'INSERT INTO siklus_haid (tgl_mulai, tgl_selesai, flow_intensity, symptoms, notes) VALUES (?, ?, ?, ?, ?)',
    [data.tgl_mulai, data.tgl_selesai, data.flow_intensity, data.symptoms, data.notes]
  );
}

export async function updateSiklus(id: number, data: Omit<SiklusHaid, 'id' | 'created_at'>) {
  return execute(
    'UPDATE siklus_haid SET tgl_mulai=?, tgl_selesai=?, flow_intensity=?, symptoms=?, notes=? WHERE id=?',
    [data.tgl_mulai, data.tgl_selesai, data.flow_intensity, data.symptoms, data.notes, id]
  );
}

export async function deleteSiklus(id: number) {
  return execute('DELETE FROM siklus_haid WHERE id = ?', [id]);
}

export async function getLastSiklus(limit = 3): Promise<SiklusHaid[]> {
  return queryAll<SiklusHaid>('SELECT * FROM siklus_haid ORDER BY tgl_mulai DESC LIMIT ?', [limit]);
}
