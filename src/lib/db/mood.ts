import { queryAll, insert, execute } from './core';

export interface MoodLog {
  id: number;
  tanggal: string;
  waktu: string;
  mood: string;
  trigger_penyebab: string;
  notes: string;
  created_at: string;
}

export async function getAllMoodLogs(tanggal?: string): Promise<MoodLog[]> {
  if (tanggal) {
    return queryAll<MoodLog>('SELECT * FROM mood_log WHERE tanggal = ? ORDER BY waktu', [tanggal]);
  }
  return queryAll<MoodLog>('SELECT * FROM mood_log ORDER BY tanggal DESC, waktu DESC LIMIT 100');
}

export async function createMoodLog(data: Omit<MoodLog, 'id' | 'created_at'>) {
  return insert(
    'INSERT INTO mood_log (tanggal, waktu, mood, trigger_penyebab, notes) VALUES (?, ?, ?, ?, ?)',
    [data.tanggal, data.waktu, data.mood, data.trigger_penyebab, data.notes]
  );
}

export async function deleteMoodLog(id: number) {
  return execute('DELETE FROM mood_log WHERE id = ?', [id]);
}
