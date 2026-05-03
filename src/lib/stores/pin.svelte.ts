async function hash(s: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(s);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function getPin(): string | null {
  return localStorage.getItem('duple_pin');
}

export async function setPin(pin: string): Promise<void> {
  localStorage.setItem('duple_pin', await hash(pin));
}

export function removePin(): void {
  localStorage.removeItem('duple_pin');
}

export function hasPin(): boolean {
  return !!getPin();
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = getPin();
  return stored === await hash(pin);
}

// Check if PIN is enabled
export function isPinEnabled(): boolean {
  return hasPin();
}
