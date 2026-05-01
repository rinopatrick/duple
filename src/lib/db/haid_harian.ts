import { queryAll, insert, execute } from './core';

export interface HaidHarian {
  id: number;
  tanggal: string;
  status: string;
  flow_level: number;
  symptoms: string;
  notes: string;
  created_at: string;
}

export async function getAllHaidHarian(month?: string): Promise<HaidHarian[]> {
  if (month) {
    return queryAll<HaidHarian>(
      'SELECT * FROM haid_harian WHERE tanggal LIKE ? ORDER BY tanggal',
      [`${month}%`]
    );
  }
  return queryAll<HaidHarian>('SELECT * FROM haid_harian ORDER BY tanggal DESC LIMIT 365');
}

export async function setHaidHarian(tanggal: string, status: string, flow_level = 3) {
  return execute(
    'INSERT OR REPLACE INTO haid_harian (tanggal, status, flow_level) VALUES (?, ?, ?)',
    [tanggal, status, flow_level]
  );
}

export async function deleteHaidHarian(tanggal: string) {
  return execute("DELETE FROM haid_harian WHERE tanggal = ?", [tanggal]);
}

export async function getHaidRange(startDate: string, endDate: string): Promise<HaidHarian[]> {
  return queryAll<HaidHarian>(
    'SELECT * FROM haid_harian WHERE tanggal >= ? AND tanggal <= ? ORDER BY tanggal',
    [startDate, endDate]
  );
}
