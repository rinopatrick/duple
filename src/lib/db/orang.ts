import { queryAll, insert, execute } from './core';

export interface OrangPenting {
  id: number;
  nama: string;
  relasi: string;
  role: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export async function getAllOrang(): Promise<OrangPenting[]> {
  return queryAll<OrangPenting>('SELECT * FROM orang_penting ORDER BY nama');
}

export async function createOrang(data: Omit<OrangPenting, 'id' | 'created_at' | 'updated_at'>) {
  return insert(
    'INSERT INTO orang_penting (nama, relasi, role, notes) VALUES (?, ?, ?, ?)',
    [data.nama, data.relasi, data.role, data.notes]
  );
}

export async function updateOrang(id: number, data: Omit<OrangPenting, 'id' | 'created_at' | 'updated_at'>) {
  return execute(
    'UPDATE orang_penting SET nama=?, relasi=?, role=?, notes=?, updated_at=datetime("now","localtime") WHERE id=?',
    [data.nama, data.relasi, data.role, data.notes, id]
  );
}

export async function deleteOrang(id: number) {
  return execute('DELETE FROM orang_penting WHERE id = ?', [id]);
}
