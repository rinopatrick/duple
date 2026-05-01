import { queryAll, queryOne, insert, execute } from './core';

export interface RencanaTempat {
  id: number;
  nama: string;
  kategori: string;
  lokasi: string;
  status: string;
  estimasi_biaya: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export async function getAllRencana(): Promise<RencanaTempat[]> {
  return queryAll<RencanaTempat>('SELECT * FROM rencana_tempat ORDER BY status, nama');
}

export async function createRencana(data: Omit<RencanaTempat, 'id' | 'created_at' | 'updated_at'>) {
  return insert(
    'INSERT INTO rencana_tempat (nama, kategori, lokasi, status, estimasi_biaya, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [data.nama, data.kategori, data.lokasi, data.status, data.estimasi_biaya, data.notes]
  );
}

export async function updateRencana(id: number, data: Omit<RencanaTempat, 'id' | 'created_at' | 'updated_at'>) {
  return execute(
    'UPDATE rencana_tempat SET nama=?, kategori=?, lokasi=?, status=?, estimasi_biaya=?, notes=?, updated_at=datetime("now","localtime") WHERE id=?',
    [data.nama, data.kategori, data.lokasi, data.status, data.estimasi_biaya, data.notes, id]
  );
}

export async function deleteRencana(id: number) {
  return execute('DELETE FROM rencana_tempat WHERE id = ?', [id]);
}
