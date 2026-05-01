import { queryAll, insert, execute } from './core';

export interface Momen {
  id: number;
  nama: string;
  tanggal: string;
  kategori: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export async function getAllMomen(): Promise<Momen[]> {
  return queryAll<Momen>('SELECT * FROM momen ORDER BY tanggal ASC');
}

export async function createMomen(data: Omit<Momen, 'id' | 'created_at' | 'updated_at'>) {
  return insert(
    'INSERT INTO momen (nama, tanggal, kategori, notes) VALUES (?, ?, ?, ?)',
    [data.nama, data.tanggal, data.kategori, data.notes]
  );
}

export async function deleteMomen(id: number) {
  return execute('DELETE FROM momen WHERE id = ?', [id]);
}

export async function getUpcomingMomen(limit = 5): Promise<Momen[]> {
  return queryAll<Momen>(
    `SELECT * FROM momen WHERE tanggal >= date('now','localtime') ORDER BY tanggal ASC LIMIT ?`,
    [limit]
  );
}
