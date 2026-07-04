/**
 * F-CORP localStorage helpers with validation.
 * All reads return null on missing, malformed, or invalid data.
 */

import { countries } from '../data/countries';

const COLORS = [
  '#ef4444', '#3b82f6', '#eab308', '#22c55e',
  '#ffffff', '#000000', '#f97316', '#a855f7',
  '#9f1239', '#1e3a8a', '#0ea5e9', '#ca8a04',
];

// ── Types ──────────────────────────────────────────────────────────────────

export interface StoredUser {
  name: string;
  age: number;
  country: string;
}

export interface StoredClub {
  name: string;
  stadium: string;
  primaryColor: string;
  secondaryColor: string;
}

// ── Readers ────────────────────────────────────────────────────────────────

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Returns a validated StoredUser or null. */
export function getUser(): StoredUser | null {
  const d = readJson<StoredUser>('fcorp_user');
  if (!d) return null;
  const name = typeof d.name === 'string' ? d.name.trim() : '';
  const age = Number(d.age);
  const country = typeof d.country === 'string' ? d.country : '';
  if (!name || isNaN(age) || age < 16 || age > 80 || !countries.includes(country)) return null;
  return { name, age, country };
}

/** Returns the stored league country string or null. */
export function getLeagueCountry(): string | null {
  const raw = localStorage.getItem('fcorp_league_country');
  if (!raw || !countries.includes(raw)) return null;
  return raw;
}

/** Returns a validated StoredClub or null. */
export function getClub(): StoredClub | null {
  const d = readJson<StoredClub>('fcorp_club');
  if (!d) return null;
  const name = typeof d.name === 'string' ? d.name.trim() : '';
  const stadium = typeof d.stadium === 'string' ? d.stadium.trim() : '';
  const primaryColor = COLORS.includes(d.primaryColor) ? d.primaryColor : '#ffffff';
  const secondaryColor = COLORS.includes(d.secondaryColor) ? d.secondaryColor : '#000000';
  if (!name || !stadium) return null;
  return { name, stadium, primaryColor, secondaryColor };
}

/** Returns true only if onboarding is fully and validly complete. */
export function isOnboardingComplete(): boolean {
  return (
    localStorage.getItem('fcorp_onboarding_complete') === 'true' &&
    getUser() !== null &&
    getLeagueCountry() !== null &&
    getClub() !== null
  );
}

// ── Writers ────────────────────────────────────────────────────────────────

export function saveUser(user: StoredUser): void {
  localStorage.setItem('fcorp_user', JSON.stringify(user));
}

export function saveLeagueCountry(country: string): void {
  localStorage.setItem('fcorp_league_country', country);
}

export function saveClub(club: StoredClub): void {
  localStorage.setItem('fcorp_club', JSON.stringify(club));
}

export function completeOnboarding(): void {
  localStorage.setItem('fcorp_onboarding_complete', 'true');
}
