/**
 * useOfflineProgress — applies missed weekly ticks silently on app mount.
 *
 * Runs once in MainGame before any tab mounts.  Writes the updated GameState
 * directly to localStorage so that when TournamentTab (or any other tab) loads
 * it already sees the correct state.  No React state is mutated here — the
 * individual tabs re-read localStorage on their own mount.
 */

import { useEffect } from 'react';

import { getMissedTicks, setLastTickTs } from '../lib/autoTick';
import { loadGameState, saveGameState, createDefaultPlayerState } from '../lib/gameState';
import { applyWeeklyTick } from '../lib/tickEngine';
import { getLeagueAtLevel } from '../data/leaguesData';
import { getLeagueLevel } from '../lib/storage';
import { ALL_MARKET_PLAYERS } from '../data/playersMarket';
import { FIRST_SQUAD_TMPL, scaleRating } from '../data/squadData';

export function useOfflineProgress(): void {
  useEffect(() => {
    const missed = getMissedTicks(Date.now());
    if (missed <= 0) return;

    const state = loadGameState();
    // Nothing to simulate if the season hasn't started yet, or has already finished.
    if (!state.season.schedule.length || !state.season.schedule.some(m => !m.played)) return;

    const level   = getLeagueLevel();
    const country = (() => { try { return localStorage.getItem('fcorp_league_country') ?? 'Англия'; } catch { return 'Англия'; } })();
    const clubName = (() => { try { const r = localStorage.getItem('fcorp_club'); return r ? (JSON.parse(r)?.name ?? 'F-CORP') : 'F-CORP'; } catch { return 'F-CORP'; } })();

    // Build squad name lookup
    const squadNames = new Map<number, string>();
    for (const id of state.purchasedPlayerIds) {
      const p = ALL_MARKET_PLAYERS.find(mp => mp.id === id);
      if (p) squadNames.set(id, p.name);
    }
    for (const ps of state.playerStates) {
      if (!squadNames.has(ps.id)) squadNames.set(ps.id, `Игрок #${ps.id}`);
    }

    // Ensure playerStates are initialised (guard against old saves)
    let s = state.playerStates.length === 0
      ? {
          ...state,
          playerStates: FIRST_SQUAD_TMPL.map(t =>
            createDefaultPlayerState(t.id, t.pos, scaleRating(t.rating, level))
          ),
        }
      : state;

    // Apply each missed tick sequentially
    const league = getLeagueAtLevel(country, level);
    void league; // used implicitly via applyWeeklyTick internal routing
    for (let i = 0; i < missed; i++) {
      const { newState } = applyWeeklyTick(s, squadNames, level, clubName);
      s = newState;
    }

    setLastTickTs(Date.now());
    saveGameState(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
