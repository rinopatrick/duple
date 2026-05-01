import { queryAll, queryOne, execute, insert } from './core';

export interface MakananFavorit {
  id: number;
  nama: string;
  kategori: string;
  rating: number;
  mood_tags: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export async function getAllMakanan(): Promise<MakananFavorit[]> {
  return queryAll<MakananFavorit>('SELECT * FROM makanan_favorit ORDER BY nama');
}

export async function getMakananById(id: number): Promise<MakananFavorit | null> {
  return queryOne<MakananFavorit>('SELECT * FROM makanan_favorit WHERE id = ?', [id]);
}

export async function createMakanan(data: Omit<MakananFavorit, 'id' | 'created_at' | 'updated_at'>) {
  return insert(
    'INSERT INTO makanan_favorit (nama, kategori, rating, mood_tags, notes) VALUES (?, ?, ?, ?, ?)',
    [data.nama, data.kategori, data.rating, data.mood_tags, data.notes]
  );
}

export async function updateMakanan(id: number, data: Omit<MakananFavorit, 'id' | 'created_at' | 'updated_at'>) {
  return execute(
    'UPDATE makanan_favorit SET nama=?, kategori=?, rating=?, mood_tags=?, notes=?, updated_at=datetime("now","localtime") WHERE id=?',
    [data.nama, data.kategori, data.rating, data.mood_tags, data.notes, id]
  );
}

export async function deleteMakanan(id: number) {
  return execute('DELETE FROM makanan_favorit WHERE id = ?', [id]);
}

export async function getMakananByMood(mood: string): Promise<MakananFavorit[]> {
  return queryAll<MakananFavorit>(
    `SELECT * FROM makanan_favorit WHERE mood_tags LIKE ? ORDER BY rating DESC`,
    [`%${mood}%`]
  );
}
