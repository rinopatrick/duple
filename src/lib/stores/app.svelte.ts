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
  | 'stats'
  | 'apology'
  | 'quiz'
  | 'health'
  | 'calendar'
  | 'ai'
  | 'settings';

export const NAV_GROUPS: { label: string; items: { route: Route; label: string; icon: string }[] }[] = [
  {
    label: 'Main',
    items: [
      { route: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { route: 'stats', label: 'Stats & Charts', icon: 'BarChart3' },
    ]
  },
  {
    label: 'Food',
    items: [
      { route: 'makanan', label: 'Makanan Favorit', icon: 'UtensilsCrossed' },
      { route: 'log-makanan', label: 'Log Makanan', icon: 'ClipboardList' },
    ]
  },
  {
    label: 'Relationship',
    items: [
      { route: 'mood', label: 'Mood Tracker', icon: 'Smile' },
      { route: 'siklus', label: 'Siklus Haid', icon: 'CalendarHeart' },
      { route: 'rekomendasi', label: 'Rekomendasi', icon: 'Lightbulb' },
      { route: 'apology', label: 'Apology Playbook', icon: 'Shield' },
      { route: 'quiz', label: 'Love Quiz', icon: 'HeartHandshake' },
      { route: 'health', label: 'Health Check', icon: 'Activity' },
    ]
  },
  {
    label: 'Plans',
    items: [
      { route: 'date-generator', label: 'Date Generator', icon: 'Dices' },
      { route: 'rencana', label: 'Rencana Tempat', icon: 'MapPin' },
      { route: 'momen', label: 'Momen Spesial', icon: 'Heart' },
    ]
  },
  {
    label: 'Tracking',
    items: [
      { route: 'wishlist', label: 'Wishlist', icon: 'Gift' },
      { route: 'trigger', label: 'Trigger Words', icon: 'AlertTriangle' },
      { route: 'orang', label: 'Orang Penting', icon: 'Users' },
    ]
  },
  {
    label: 'Tools',
    items: [
      { route: 'calendar', label: 'Calendar Export', icon: 'Calendar' },
      { route: 'ai', label: 'AI Advisor', icon: 'Bot' },
      { route: 'settings', label: 'Settings', icon: 'Settings' },
    ]
  },
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
let _features: Record<string, boolean> = $state({ siklus: true });

export function getFeature(key: string): boolean {
  return _features[key] ?? true;
}

export function setFeature(key: string, value: boolean) {
  _features = { ..._features, [key]: value };
  if (typeof localStorage !== 'undefined') {
    const flags = JSON.parse(localStorage.getItem('duple_features') || '{}');
    flags[key] = value;
    localStorage.setItem('duple_features', JSON.stringify(flags));
  }
}

export function loadFeatures() {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('duple_features');
    if (saved) {
      _features = { ..._features, ...JSON.parse(saved) };
    }
  }
}

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
