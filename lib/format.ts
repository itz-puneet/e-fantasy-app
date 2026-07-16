// ============================================================================
//  lib/format.ts
//  Small helpers to make numbers and dates look nice. Written without any
//  external date library so it "just works" everywhere.
// ============================================================================

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// 1000 -> "1,000"
export function formatTokens(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Fantasy points: whole numbers stay whole (130), half-points show one
// decimal (97.5). Handles the string Postgres sometimes returns for numeric.
export function formatPoints(n: number | string): string {
  const value = typeof n === 'string' ? parseFloat(n) : n;
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

// ISO date -> "5 Jul, 8:30 PM"  (used on match cards)
export function formatMatchTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${formatClock(d)}`;
}

// ISO date -> "5 Jul 2026, 8:30 PM"  (used in transaction history)
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${formatClock(d)}`;
}

function formatClock(d: Date): string {
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = ((hours + 11) % 12) + 1; // 0 -> 12, 13 -> 1, etc.
  return `${hour12}:${minutes} ${ampm}`;
}
