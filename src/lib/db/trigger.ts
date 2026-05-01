import { queryAll, insert, execute } from './core';

export interface TriggerWord {
  id: number;
  kategori: string;
  kata_kalimat_jangan: string;
  konteks: string;
  alternatif_aman: string;
  created_at: string;
  updated_at: string;
}

export async function getAllTriggerWords(): Promise<TriggerWord[]> {
  return queryAll<TriggerWord>('SELECT * FROM trigger_words ORDER BY kategori, kata_kalimat_jangan');
}

export async function createTriggerWord(data: Omit<TriggerWord, 'id' | 'created_at' | 'updated_at'>) {
  return insert(
    'INSERT INTO trigger_words (kategori, kata_kalimat_jangan, konteks, alternatif_aman) VALUES (?, ?, ?, ?)',
    [data.kategori, data.kata_kalimat_jangan, data.konteks, data.alternatif_aman]
  );
}

export async function updateTriggerWord(id: number, data: Omit<TriggerWord, 'id' | 'created_at' | 'updated_at'>) {
  return execute(
    'UPDATE trigger_words SET kategori=?, kata_kalimat_jangan=?, konteks=?, alternatif_aman=?, updated_at=datetime("now","localtime") WHERE id=?',
    [data.kategori, data.kata_kalimat_jangan, data.konteks, data.alternatif_aman, id]
  );
}

export async function deleteTriggerWord(id: number) {
  return execute('DELETE FROM trigger_words WHERE id = ?', [id]);
}
