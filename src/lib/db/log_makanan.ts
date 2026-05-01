import { queryAll, insert, execute } from './core';

export interface LogMakanan {
  id: number;
  tanggal: string;
  waktu: string;
  makanan: string;
  mood_sebelum: string;
  mood_sesudah: string;
  notes: string;
  created_at: string;
}

export async function getAllLogMakanan(tanggal?: string): Promise<LogMakanan[]> {
  if (tanggal) {
    return queryAll<LogMakanan>('SELECT * FROM log_makanan WHERE tanggal = ? ORDER BY waktu', [tanggal]);
  }
  return queryAll<LogMakanan>('SELECT * FROM log_makanan ORDER BY tanggal DESC, waktu DESC LIMIT 100');
}

export async function createLogMakanan(data: Omit<LogMakanan, 'id' | 'created_at'>) {
  return insert(
    'INSERT INTO log_makanan (tanggal, waktu, makanan, mood_sebelum, mood_sesudah, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [data.tanggal, data.waktu, data.makanan, data.mood_sebelum, data.mood_sesudah, data.notes]
  );
}

export async function deleteLogMakanan(id: number) {
  return execute('DELETE FROM log_makanan WHERE id = ?', [id]);
}
