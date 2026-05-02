import Database from '@tauri-apps/plugin-sql';
import Dexie, { type Table } from 'dexie';
import { SCHEMA } from './schema';

let db: any = null;
const isTauri = typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

// ─── Dexie-backed browser database (persistent via IndexedDB) ───

class PacarDB extends Dexie {
  makanan_favorit!: Table<any>;
  log_makanan!: Table<any>;
  siklus_haid!: Table<any>;
  haid_harian!: Table<any>;
  mood_log!: Table<any>;
  rencana_tempat!: Table<any>;
  momen!: Table<any>;
  wishlist_hadiah!: Table<any>;
  ukuran_pasangan!: Table<any>;
  trigger_words!: Table<any>;
  orang_penting!: Table<any>;
  settings!: Table<any>;

  constructor() {
    super('Duple');
    this.version(1).stores({
      makanan_favorit: '++id, kategori, rating',
      log_makanan: '++id, tanggal, waktu',
      siklus_haid: '++id, tgl_mulai',
      haid_harian: '++id, &tanggal',
      mood_log: '++id, tanggal',
      rencana_tempat: '++id, status, kategori',
      momen: '++id, tanggal, kategori',
      wishlist_hadiah: '++id, status',
      ukuran_pasangan: '++id, kategori',
      trigger_words: '++id, kategori',
      orang_penting: '++id, role',
      settings: 'key',
    });
  }
}

class DexieDatabase {
  private dexie: PacarDB;

  constructor() {
    this.dexie = new PacarDB();
    console.log('🗄️ Browser mode: using IndexedDB (data persists across sessions)');
  }

  get native() { return this.dexie; }

  async select<T>(sql: string, params: any[] = []): Promise<T[]> {
    const upper = sql.toUpperCase().trim();
    const table = this.extractTable(sql);

    if (upper.startsWith('SELECT') && upper.includes('*')) {
      const orderMatch = upper.match(/ORDER\s+BY\s+(\S+)\s+(ASC|DESC)?/i);
      const limitMatch = upper.match(/LIMIT\s+(\d+)/i);
      const whereMatch = upper.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+LIMIT|\s*$)/i);

      let collection = this.dexie.table(table).toCollection();

      if (whereMatch) {
        const clause = whereMatch[1].trim();
        const eqMatch = clause.match(/^(\S+)\s*=\s*\?$/);
        const likeMatch = clause.match(/^(\S+)\s+LIKE\s+\?$/);
        const gteMatch = clause.match(/^(\S+)\s*>=\s*\?$/);

        if (eqMatch && params.length > 0) {
          const col = eqMatch[1].toLowerCase();
          collection = this.dexie.table(table).where(col).equals(params[0]);
        } else if (likeMatch && params.length > 0) {
          const col = likeMatch[1].toLowerCase();
          const pattern = String(params[0]).replace(/%/g, '').toLowerCase();
          collection = this.dexie.table(table).filter((row: any) =>
            String(row[col] || '').toLowerCase().includes(pattern)
          );
        } else if (gteMatch && params.length > 0) {
          const col = gteMatch[1].toLowerCase();
          collection = this.dexie.table(table).where(col).aboveOrEqual(params[0]);
        }
      }

      let result = await collection.toArray();

      if (orderMatch) {
        const col = orderMatch[1].toLowerCase();
        const dir = orderMatch[2];
        result.sort((a: any, b: any) => {
          const va = a[col] ?? '';
          const vb = b[col] ?? '';
          if (dir === 'DESC') return String(vb).localeCompare(String(va));
          return String(va).localeCompare(String(vb));
        });
      }

      if (limitMatch) {
        result = result.slice(0, parseInt(limitMatch[1]));
      }

      return result as T[];
    }

    return [];
  }

  async execute(sql: string, params: any[] = []): Promise<{ lastInsertId?: number }> {
    const upper = sql.toUpperCase().trim();
    const table = this.extractTable(sql);
    const now = new Date().toISOString();

    // INSERT OR REPLACE — must check before INSERT since it also starts with 'INSERT'
    if (upper.startsWith('INSERT OR REPLACE')) {
      if (table === 'haid_harian') {
        const existing = await this.dexie.table(table).where('tanggal').equals(params[0]).first();
        if (existing) {
          await this.dexie.table(table).update(existing.id, { status: params[1], flow_level: params[2] });
        } else {
          await this.dexie.table(table).add({ tanggal: params[0], status: params[1], flow_level: params[2], created_at: now });
        }
      } else if (table === 'settings') {
        await this.dexie.table('settings').put({ key: params[0], value: params[1], updated_at: now });
      }
      return { lastInsertId: 0 };
    }

    if (upper.startsWith('INSERT')) {
      const data: any = {};

      if (table === 'makanan_favorit') {
        Object.assign(data, { nama: params[0], kategori: params[1], rating: params[2], mood_tags: params[3], notes: params[4], created_at: now, updated_at: now });
      } else if (table === 'log_makanan') {
        Object.assign(data, { tanggal: params[0], waktu: params[1], makanan: params[2], mood_sebelum: params[3], mood_sesudah: params[4], notes: params[5], created_at: now });
      } else if (table === 'siklus_haid') {
        Object.assign(data, { tgl_mulai: params[0], tgl_selesai: params[1], flow_intensity: params[2], symptoms: params[3], notes: params[4], created_at: now });
      } else if (table === 'haid_harian') {
        Object.assign(data, { tanggal: params[0], status: params[1], flow_level: params[2], created_at: now });
      } else if (table === 'mood_log') {
        Object.assign(data, { tanggal: params[0], waktu: params[1], mood: params[2], trigger_penyebab: params[3], notes: params[4], created_at: now });
      } else if (table === 'rencana_tempat') {
        Object.assign(data, { nama: params[0], kategori: params[1], lokasi: params[2], maps_url: params[3], status: params[4], estimasi_biaya: params[5], notes: params[6], created_at: now, updated_at: now });
      } else if (table === 'momen') {
        Object.assign(data, { nama: params[0], tanggal: params[1], kategori: params[2], notes: params[3], created_at: now, updated_at: now });
      } else if (table === 'wishlist_hadiah') {
        Object.assign(data, { nama_barang: params[0], harga_estimasi: params[1], status: params[2], occasion: params[3], notes: params[4], created_at: now, updated_at: now });
      } else if (table === 'ukuran_pasangan') {
        Object.assign(data, { kategori: params[0], ukuran: params[1], brand_favorit: params[2], notes: params[3], created_at: now, updated_at: now });
      } else if (table === 'trigger_words') {
        Object.assign(data, { kategori: params[0], kata_kalimat_jangan: params[1], konteks: params[2], alternatif_aman: params[3], created_at: now, updated_at: now });
      } else if (table === 'orang_penting') {
        Object.assign(data, { nama: params[0], relasi: params[1], role: params[2], notes: params[3], created_at: now, updated_at: now });
      } else if (table === 'settings') {
        await this.dexie.table('settings').put({ key: params[0], value: params[1], updated_at: now });
        return { lastInsertId: 0 };
      }

      const id = await this.dexie.table(table).add(data);
      return { lastInsertId: id as number };
    }

    if (upper.startsWith('DELETE')) {
      const idMatch = upper.match(/WHERE\s+id\s*=\s*\?/);
      if (idMatch && params.length > 0) {
        await this.dexie.table(table).delete(params[0]);
      } else {
        await this.dexie.table(table).clear();
      }
      return {};
    }

    if (upper.startsWith('UPDATE')) {
      const idMatch = upper.match(/WHERE\s+id\s*=\s*\?/);
      const setMatch = upper.match(/SET\s+(.+?)(?:\s+WHERE|\s*$)/i);

      if (idMatch && setMatch && params.length > 0) {
        const id = params[params.length - 1];
        const updates: any = { updated_at: now };

        // Parse SET clause
        const setParts = setMatch[1].split(',');
        const setValues: string[] = [];
        for (const part of setParts) {
          const colMatch = part.trim().match(/^(\S+)\s*=\s*(.+)$/);
          if (colMatch) {
            const col = colMatch[1];
            const val = colMatch[2].trim();
            if (val === '?') setValues.push(col);
            else if (val.includes('datetime')) updates[col] = now;
          }
        }

        // Map set params to columns
        for (let i = 0; i < setValues.length; i++) {
          updates[setValues[i]] = params[i];
        }

        await this.dexie.table(table).update(id, updates);
      }
      return {};
    }

    // INSERT OR REPLACE for settings
    if (upper.startsWith('INSERT OR REPLACE')) {
      if (table === 'settings') {
        await this.dexie.table('settings').put({ key: params[0], value: params[1], updated_at: now });
      }
      return { lastInsertId: 0 };
    }

    return {};
  }

  async close() {
    this.dexie.close();
  }

  private extractTable(sql: string): string {
    const insertMatch = sql.match(/INTO\s+(\w+)/i);
    if (insertMatch) return insertMatch[1];
    const fromMatch = sql.match(/FROM\s+(\w+)/i);
    if (fromMatch) return fromMatch[1];
    const updateMatch = sql.match(/UPDATE\s+(\w+)/i);
    if (updateMatch) return updateMatch[1];
    const deleteMatch = sql.match(/DELETE\s+FROM\s+(\w+)/i) || sql.match(/DELETE\s+(\w+)/i);
    if (deleteMatch) return deleteMatch[1];
    return '';
  }
}

// ─── DB Singleton ───

export async function getDb(): Promise<any> {
  if (!db) {
    if (isTauri) {
      db = await Database.load('sqlite:duple.db');
      await initSchema(db);
    } else {
      db = new DexieDatabase();
    }
  }
  return db;
}

async function initSchema(db: any) {
  if (isTauri) {
    const statements = SCHEMA.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      await db.execute(stmt);
    }
    try { await db.execute("ALTER TABLE rencana_tempat ADD COLUMN maps_url TEXT DEFAULT ''"); } catch (_) {}
    try { await db.execute("CREATE TABLE IF NOT EXISTS haid_harian (id INTEGER PRIMARY KEY AUTOINCREMENT, tanggal TEXT NOT NULL UNIQUE, status TEXT NOT NULL DEFAULT 'haid', flow_level INTEGER DEFAULT 3, symptoms TEXT DEFAULT '[]', notes TEXT DEFAULT '', created_at TEXT DEFAULT (datetime('now','localtime')))"); } catch (_) {}
  }
}

export async function queryAll<T>(sql: string, params: any[] = []): Promise<T[]> {
  const database = await getDb();
  return await database.select<T>(sql, params);
}

export async function queryOne<T>(sql: string, params: any[] = []): Promise<T | null> {
  const results = await queryAll<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

export async function execute(sql: string, params: any[] = []): Promise<void> {
  const database = await getDb();
  await database.execute(sql, params);
}

export async function insert(sql: string, params: any[] = []): Promise<number> {
  const database = await getDb();
  const result = await database.execute(sql, params);
  return result.lastInsertId as number;
}

export async function clearTable(table: string): Promise<void> {
  await execute(`DELETE FROM ${table}`);
}

export async function importTable(tableName: string, rows: any[]): Promise<void> {
  const database = await getDb();

  if (isTauri) {
    await database.execute(`DELETE FROM ${tableName}`, []);
    const now = new Date().toISOString();
    for (const row of rows) {
      const { id, created_at, updated_at, ...data } = row;
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => '?').join(', ');
      await database.execute(
        `INSERT INTO ${tableName} (${keys.join(', ')}, created_at) VALUES (${placeholders}, ?)`,
        [...values, created_at || now]
      );
    }
  } else {
    const dexie = database.native;
    await dexie.table(tableName).clear();
    const now = new Date().toISOString();
    const cleanRows = rows.map(({ id, ...rest }: any) => ({
      ...rest,
      created_at: rest.created_at || now,
      updated_at: rest.updated_at || now,
    }));
    await dexie.table(tableName).bulkAdd(cleanRows);
  }
}
