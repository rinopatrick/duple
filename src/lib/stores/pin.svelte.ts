// Simple PIN module using localStorage (data stays local)
// In production, consider hashing the PIN before storing

function hash(s: string): string {
  // Simple hash for basic obfuscation
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return String(h);
}

export function getPin(): string | null {
  return localStorage.getItem('duple_pin');
}

export function setPin(pin: string): void {
  localStorage.setItem('duple_pin', hash(pin));
}

export function removePin(): void {
  localStorage.removeItem('duple_pin');
}

export function hasPin(): boolean {
  return !!getPin();
}

export function verifyPin(pin: string): boolean {
  const stored = getPin();
  return stored === hash(pin);
}

// Check if PIN is enabled
export function isPinEnabled(): boolean {
  return hasPin();
}
