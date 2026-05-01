import { getMakananByMood, type MakananFavorit } from '../db/makanan';
import { getLastSiklus, type SiklusHaid } from '../db/siklus';
import { getAllMoodLogs, type MoodLog } from '../db/mood';
import { getAllTriggerWords, type TriggerWord } from '../db/trigger';
import dayjs from 'dayjs';

export interface RekomendasiResult {
  makanan: MakananFavorit[];
  fase: 'normal' | 'pms' | 'haid' | 'ovulasi' | 'unknown';
  mood_hari_ini: string;
  warnings: TriggerWord[];
  saran: string;
}

const MOOD_MAP: Record<string, string> = {
  'senang': 'senang',
  'biasa': 'biasa',
  'kesel': 'kesel',
  'sedih': 'sedih',
  'gaenak': 'gaenak',
};

const MOOD_FOOD_TAGS: Record<string, string[]> = {
  'senang': ['senang', 'celebration', 'spesial'],
  'biasa': ['nyaman', 'comfort', 'favorit'],
  'kesel': ['nyaman', 'comfort', 'manis', 'pedas'],
  'sedih': ['manis', 'comfort', 'hangat', 'nostalgia'],
  'gaenak': ['hangat', 'ringan', 'sehat', 'sup'],
};

function predictFase(siklusList: SiklusHaid[]): {
  fase: 'haid' | 'pms' | 'ovulasi' | 'normal' | 'unknown';
  prediksi_mulai?: string;
  hari_ke: number;
} {
  if (siklusList.length < 2) return { fase: 'unknown', hari_ke: -1 };

  const lastStart = dayjs(siklusList[0].tgl_mulai);
  const today = dayjs();
  const hariKe = today.diff(lastStart, 'day');

  if (siklusList[0].tgl_selesai) {
    const lastEnd = dayjs(siklusList[0].tgl_selesai);
    if (today.isSameOrBefore(lastEnd) && today.isSameOrAfter(lastStart)) {
      return { fase: 'haid', hari_ke: hariKe + 1 };
    }
  }

  const cycles: number[] = [];
  for (let i = 0; i < siklusList.length - 1; i++) {
    const durasi = dayjs(siklusList[i].tgl_mulai).diff(dayjs(siklusList[i + 1].tgl_mulai), 'day');
    if (durasi > 0) cycles.push(durasi);
  }

  const avgCycle = cycles.length > 0 ? Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length) : 28;
  const nextPredicted = lastStart.add(avgCycle, 'day');
  const daysUntilNext = nextPredicted.diff(today, 'day');

  if (daysUntilNext <= 5 && daysUntilNext >= 0) {
    return { fase: 'pms', prediksi_mulai: nextPredicted.format('YYYY-MM-DD'), hari_ke: hariKe + 1 };
  }

  const ovulasiStart = lastStart.add(Math.round(avgCycle / 2) - 2, 'day');
  const ovulasiEnd = lastStart.add(Math.round(avgCycle / 2) + 2, 'day');
  if (today.isSameOrAfter(ovulasiStart) && today.isSameOrBefore(ovulasiEnd)) {
    return { fase: 'ovulasi', hari_ke: hariKe + 1 };
  }

  return { fase: 'normal', hari_ke: hariKe + 1 };
}

export async function generateRekomendasi(): Promise<RekomendasiResult> {
  const [lastSiklus, moodLogs, triggerWords] = await Promise.all([
    getLastSiklus(3),
    getAllMoodLogs(dayjs().format('YYYY-MM-DD')),
    getAllTriggerWords(),
  ]);

  const { fase, prediksi_mulai, hari_ke } = predictFase(lastSiklus);

  const moodToday = moodLogs.length > 0
    ? moodLogs[moodLogs.length - 1].mood
    : 'biasa';

  let searchTags = MOOD_FOOD_TAGS[moodToday] || ['favorit'];

  if (fase === 'pms') {
    searchTags = [...searchTags, 'manis', 'comfort', 'hangat'];
  } else if (fase === 'haid') {
    searchTags = [...searchTags, 'hangat', 'ringan', 'sehat'];
  }

  const makananResults = await Promise.all(
    searchTags.map(tag => getMakananByMood(tag))
  );

  const makananMap = new Map<number, MakananFavorit>();
  for (const list of makananResults) {
    for (const item of list) {
      const existing = makananMap.get(item.id);
      if (!existing || existing.rating < item.rating) {
        makananMap.set(item.id, item);
      }
    }
  }

  const sortedMakanan = Array.from(makananMap.values()).sort((a, b) => b.rating - a.rating);

  const relevantWarnings: TriggerWord[] = [];
  if (moodToday === 'kesel' || moodToday === 'sedih' || fase === 'pms') {
    const riskyCategories = ['umum', 'ngambek', 'pms', 'emosi'];
    for (const tw of triggerWords) {
      if (riskyCategories.includes(tw.kategori)) {
        relevantWarnings.push(tw);
      }
    }
  }

  let saran = '';
  if (fase === 'pms') {
    saran = `Fase PMS (hari ke-${hari_ke}). Dia mungkin lebih sensitif. Hindari debat, kasih perhatian ekstra.`;
    if (prediksi_mulai) saran += ` Prediksi haid: ${prediksi_mulai}.`;
  } else if (fase === 'haid') {
    saran = `Fase Haid (hari ke-${hari_ke}). Dia butuh kenyamanan. Makanan hangat, jangan ajak jalan jauh.`;
  } else if (fase === 'ovulasi') {
    saran = `Masa subur. Mood biasanya lebih baik. Waktu tepat buat date spesial!`;
  } else if (fase === 'normal') {
    saran = `Fase normal. Mood: ${moodToday}. Aman buat ngobrolin apa aja.`;
  } else {
    saran = `Belum cukup data siklus untuk prediksi. Isi data siklus haid minimal 2 kali.`;
  }

  return {
    makanan: sortedMakanan.slice(0, 10),
    fase,
    mood_hari_ini: moodToday,
    warnings: relevantWarnings,
    saran,
  };
}
