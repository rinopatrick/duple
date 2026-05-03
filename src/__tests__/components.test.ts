import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import '@testing-library/jest-dom/vitest';
import PinGuard from '../lib/components/PinGuard.svelte';
import Landing from '../lib/components/Landing.svelte';

vi.mock('../lib/stores/pin.svelte', () => ({
  getPin: vi.fn(() => 'abc123hash'),
  verifyPin: vi.fn(),
  setPin: vi.fn(),
  removePin: vi.fn(),
  hasPin: vi.fn(() => true),
  isPinEnabled: vi.fn(() => true),
}));

async function tick() {
  await new Promise(r => setTimeout(r, 0));
}

describe('PinGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error on wrong PIN', async () => {
    const { verifyPin } = await import('../lib/stores/pin.svelte');
    vi.mocked(verifyPin).mockResolvedValue(false);

    const onUnlock = vi.fn();
    render(PinGuard, { props: { onUnlock } });

    const input = screen.getByPlaceholderText('****');
    await fireEvent.input(input, { target: { value: '9999' } });
    await fireEvent.keyDown(input, { key: 'Enter' });
    await tick();

    expect(verifyPin).toHaveBeenCalledWith('9999');
    expect(screen.getByText('Wrong PIN')).toBeInTheDocument();
    expect(onUnlock).not.toHaveBeenCalled();
  });

  it('calls onUnlock on correct PIN', async () => {
    const { verifyPin } = await import('../lib/stores/pin.svelte');
    vi.mocked(verifyPin).mockResolvedValue(true);

    const onUnlock = vi.fn();
    render(PinGuard, { props: { onUnlock } });

    const input = screen.getByPlaceholderText('****');
    await fireEvent.input(input, { target: { value: '1234' } });

    const btn = screen.getByText('Unlock');
    await fireEvent.click(btn);
    await tick();

    expect(verifyPin).toHaveBeenCalledWith('1234');
    expect(onUnlock).toHaveBeenCalledOnce();
  });

  it('disables button when PIN is too short', () => {
    const onUnlock = vi.fn();
    render(PinGuard, { props: { onUnlock } });

    const btn = screen.getByText('Unlock');
    expect(btn).toBeDisabled();
  });
});

describe('Landing', () => {
  it('renders the app title', () => {
    render(Landing, { props: { onStart: vi.fn() } });
    expect(screen.getByText('Duple')).toBeInTheDocument();
  });

  it('renders the start button', () => {
    render(Landing, { props: { onStart: vi.fn() } });
    expect(screen.getByText("Get Started — It's Free")).toBeInTheDocument();
  });

  it('toggles support dropdown on button click', async () => {
    render(Landing, { props: { onStart: vi.fn() } });

    const supportBtn = screen.getByText('Support Us');
    await fireEvent.click(supportBtn);

    expect(screen.getByText('☕ Ko-fi')).toBeInTheDocument();
    expect(screen.getByText('💰 Saweria')).toBeInTheDocument();

    await fireEvent.click(supportBtn);
    expect(screen.queryByText('☕ Ko-fi')).not.toBeInTheDocument();
  });
});
