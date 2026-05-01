export type Route =
  | 'dashboard'
  | 'makanan'
  | 'log-makanan'
  | 'siklus'
  | 'mood'
  | 'rekomendasi'
  | 'rencana'
  | 'momen'
  | 'wishlist'
  | 'trigger'
  | 'orang'
  | 'date-generator'
  | 'settings';

export const NAV_ITEMS: { route: Route; label: string; icon: string }[] = [
  { route: 'dashboard', label: 'Dashboard', icon: '🏠' },
  { route: 'makanan', label: 'Makanan Favorit', icon: '🍕' },
  { route: 'log-makanan', label: 'Log Makanan', icon: '📋' },
  { route: 'date-generator', label: 'Date Generator', icon: '🎲' },
  { route: 'siklus', label: 'Siklus Haid', icon: '🩸' },
  { route: 'mood', label: 'Mood Tracker', icon: '😊' },
  { route: 'rekomendasi', label: 'Rekomendasi', icon: '💡' },
  { route: 'rencana', label: 'Rencana Tempat', icon: '📅' },
  { route: 'momen', label: 'Momen Spesial', icon: '❤️' },
  { route: 'wishlist', label: 'Wishlist', icon: '🎁' },
  { route: 'trigger', label: 'Trigger Words', icon: '⚡' },
  { route: 'orang', label: 'Orang Penting', icon: '👥' },
  { route: 'settings', label: 'Settings', icon: '⚙️' },
];

let _route: Route = $state('dashboard');
let _sidebarOpen: boolean = $state(true);

export function getRoute() {
  return _route;
}

export function setRoute(r: Route) {
  _route = r;
}

export function getSidebarOpen() {
  return _sidebarOpen;
}

export function toggleSidebar() {
  _sidebarOpen = !_sidebarOpen;
}

let _theme: 'light' | 'dark' = $state('light');

export function getTheme() {
  return _theme;
}

export function setTheme(t: 'light' | 'dark') {
  _theme = t;
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', t);
  }
}

export function toggleTheme() {
  setTheme(_theme === 'light' ? 'dark' : 'light');
}
