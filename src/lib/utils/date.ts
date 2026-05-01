import dayjs from 'dayjs';

export function formatDate(date: string, format = 'DD MMM YYYY') {
  return dayjs(date).format(format);
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
}

export function today(): string {
  return dayjs().format('YYYY-MM-DD');
}

export function now(): string {
  return dayjs().format('HH:mm');
}

export function daysBetween(d1: string, d2: string): number {
  return dayjs(d2).diff(dayjs(d1), 'day');
}

export function addDays(date: string, days: number): string {
  return dayjs(date).add(days, 'day').format('YYYY-MM-DD');
}

export function formatDateTime(date: string): string {
  return dayjs(date).format('DD MMM YYYY HH:mm');
}
