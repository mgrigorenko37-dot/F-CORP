/**
 * autoTick.ts — Real-time to game-time mapping.
 *
 * One real hour = one game week.  On app open, missed ticks (up to MAX_CATCH_UP)
 * are applied silently.  While the Tournament tab is visible a countdown fires a
 * live tick when it reaches zero.
 *
 * We store a Unix-ms timestamp in a dedicated key so we can measure sub-day
 * precision — GameState.lastWeekTick only carries a YYYY-MM-DD string and is
 * used purely for display.
 */

const TICK_TS_KEY = 'fcorp_tick_ts';

/** One real hour advances the game by one week. */
export const TICK_INTERVAL_MS = 60 * 60 * 1000;

/** Never apply more than this many catch-up weeks on a single app open. */
export const MAX_CATCH_UP_TICKS = 4;

export function getLastTickTs(): number {
  try { return parseInt(localStorage.getItem(TICK_TS_KEY) ?? '0', 10) || 0; }
  catch { return 0; }
}

export function setLastTickTs(ts: number): void {
  try { localStorage.setItem(TICK_TS_KEY, String(ts)); } catch {}
}

/**
 * How many complete intervals have elapsed since the last recorded tick.
 * Returns 0 if the timestamp has never been set (first session).
 */
export function getMissedTicks(now: number): number {
  const last = getLastTickTs();
  if (!last) return 0;
  return Math.min(
    Math.floor((now - last) / TICK_INTERVAL_MS),
    MAX_CATCH_UP_TICKS,
  );
}

/** Milliseconds remaining until the next auto-tick fires. */
export function msUntilNextTick(now: number): number {
  const last = getLastTickTs();
  if (!last) return TICK_INTERVAL_MS;
  const elapsed = (now - last) % TICK_INTERVAL_MS;
  return TICK_INTERVAL_MS - elapsed;
}

/** Format countdown as "MM:SS" or "1ч 23м" when > 1 h. */
export function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}ч ${String(m).padStart(2, '0')}м`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Progress fraction (0–1) of the current interval elapsed. */
export function tickProgress(now: number): number {
  const last = getLastTickTs();
  if (!last) return 0;
  return Math.min(1, ((now - last) % TICK_INTERVAL_MS) / TICK_INTERVAL_MS);
}
