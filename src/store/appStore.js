import { create } from 'zustand';
import { api } from '../lib/api';
export const useApp = create((set) => ({
  matches: [], competitions: [], leaderboard: [], rivalries: [], wallet: [], loading: false,
  loadMatches: async (token, competition = null) => { set({ loading: true }); try { const rows = await api.listMatches(token, competition); set({ matches: rows || [] }); } finally { set({ loading: false }); } },
  loadCompetitions: async (token) => { const rows = await api.listCompetitions(token); set({ competitions: rows || [] }); },
  loadLeaderboard: async (token) => { const rows = await api.leaderboard(token); set({ leaderboard: rows || [] }); },
  loadRivalries: async (token) => { const rows = await api.listRivalries(token); set({ rivalries: rows || [] }); },
  loadWallet: async (token) => { const rows = await api.walletHistory(token); set({ wallet: rows || [] }); }
}));
