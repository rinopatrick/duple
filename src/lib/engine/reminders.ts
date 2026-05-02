import dayjs from 'dayjs';
import { getAllMomen, type Momen } from '../db/momen';
import { getLastSiklus } from '../db/siklus';
import { tr } from '../i18n';

export interface Reminder {
  id: string;
  type: 'pms' | 'anniversary' | 'momen' | 'streak';
  title: string;
  description: string;
  daysLeft: number;
  priority: 'high' | 'medium' | 'low';
  icon: string;
}

export async function getReminders(): Promise<Reminder[]> {
  const reminders: Reminder[] = [];
  const today = dayjs();

  const siklus = await getLastSiklus(3);
  if (siklus.length >= 2) {
    const cycles: number[] = [];
    for (let i = 0; i < siklus.length - 1; i++) {
      const d = dayjs(siklus[i].tgl_mulai).diff(dayjs(siklus[i + 1].tgl_mulai), 'day');
      if (d > 0 && d < 50) cycles.push(d);
    }
    if (cycles.length > 0) {
      const avg = Math.round(cycles.reduce((a, b) => a + b, 0) / cycles.length);
      const lastStart = dayjs(siklus[0].tgl_mulai);
      const nextPMS = lastStart.add(avg, 'day').subtract(5, 'day');
      const daysLeft = nextPMS.diff(today, 'day');

      if (daysLeft >= 0 && daysLeft <= 5) {
        reminders.push({
          id: 'pms', type: 'pms',
          title: tr().engine.pmsAlert,
          description: daysLeft === 0 ? tr().engine.pmsToday : tr().engine.pmsInDays.replace('{n}', String(daysLeft)),
          daysLeft, priority: 'high', icon: '🩸'
        });
      }

      const nextHaid = lastStart.add(avg, 'day');
      const haidDays = nextHaid.diff(today, 'day');
      if (haidDays >= 0 && haidDays <= 3) {
        reminders.push({
          id: 'haid', type: 'pms',
          title: tr().engine.cycleSoon,
          description: haidDays === 0 ? tr().engine.cycleToday : tr().engine.cycleInDays.replace('{n}', String(haidDays)),
          daysLeft: haidDays, priority: 'high', icon: '📅'
        });
      }
    }
  }

  const momens = await getAllMomen();
  const todayStr = today.format('YYYY-MM-DD');
  const relevant = momens.filter(m => {
    const d = dayjs(m.tanggal);
    const days = d.diff(today, 'day');
    return days >= 0 && days <= 14;
  });

  for (const m of relevant) {
    const days = dayjs(m.tanggal).diff(today, 'day');
    reminders.push({
      id: `momen-${m.id}`, type: 'momen',
      title: m.nama,
      description: days === 0 ? `TODAY! 🎉` : tr().engine.daysAway.replace('{n}', String(days)),
      daysLeft: days, priority: days <= 3 ? 'high' : 'medium',
      icon: days === 0 ? '🎉' : '📌'
    });
  }

  reminders.sort((a, b) => a.daysLeft - b.daysLeft);
  return reminders.slice(0, 6);
}

// sendDesktopNotifications removed — notification plugin not available in production build

