import { queryAll, insert, execute } from './core';

export interface WishlistHadiah {
  id: number;
  nama_barang: string;
  harga_estimasi: number;
  status: string;
  occasion: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export async function getAllWishlist(): Promise<WishlistHadiah[]> {
  return queryAll<WishlistHadiah>('SELECT * FROM wishlist_hadiah ORDER BY status, nama_barang');
}

export async function createWishlist(data: Omit<WishlistHadiah, 'id' | 'created_at' | 'updated_at'>) {
  return insert(
    'INSERT INTO wishlist_hadiah (nama_barang, harga_estimasi, status, occasion, notes) VALUES (?, ?, ?, ?, ?)',
    [data.nama_barang, data.harga_estimasi, data.status, data.occasion, data.notes]
  );
}

export async function updateWishlist(id: number, data: Omit<WishlistHadiah, 'id' | 'created_at' | 'updated_at'>) {
  return execute(
    'UPDATE wishlist_hadiah SET nama_barang=?, harga_estimasi=?, status=?, occasion=?, notes=?, updated_at=datetime("now","localtime") WHERE id=?',
    [data.nama_barang, data.harga_estimasi, data.status, data.occasion, data.notes, id]
  );
}

export async function deleteWishlist(id: number) {
  return execute('DELETE FROM wishlist_hadiah WHERE id = ?', [id]);
}

export interface UkuranPasangan {
  id: number;
  kategori: string;
  ukuran: string;
  brand_favorit: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export async function getAllUkuran(): Promise<UkuranPasangan[]> {
  return queryAll<UkuranPasangan>('SELECT * FROM ukuran_pasangan ORDER BY kategori');
}

export async function createUkuran(data: Omit<UkuranPasangan, 'id' | 'created_at' | 'updated_at'>) {
  return insert(
    'INSERT INTO ukuran_pasangan (kategori, ukuran, brand_favorit, notes) VALUES (?, ?, ?, ?)',
    [data.kategori, data.ukuran, data.brand_favorit, data.notes]
  );
}

export async function deleteUkuran(id: number) {
  return execute('DELETE FROM ukuran_pasangan WHERE id = ?', [id]);
}
