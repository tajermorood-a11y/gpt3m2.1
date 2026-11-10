import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';
const KEY = 'phantom_session_v1';

export const useAuth = create((set, get) => ({
  token: null, user: null, ready: false,
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const user = await api.getMe(saved.token);
        set({ token: saved.token, user, ready: true });
        return;
      }
    } catch (error) { await AsyncStorage.removeItem(KEY); }
    set({ token: null, user: null, ready: true });
  },
  signIn: async (username, password) => {
    const result = await api.login(username.trim(), password);
    await AsyncStorage.setItem(KEY, JSON.stringify({ token: result.token }));
    set({ token: result.token, user: result.user });
  },
  signUp: async (username, password, displayName) => {
    const result = await api.register(username.trim(), password, displayName.trim());
    await AsyncStorage.setItem(KEY, JSON.stringify({ token: result.token }));
    set({ token: result.token, user: result.user });
  },
  refreshUser: async () => { const token = get().token; if (token) set({ user: await api.getMe(token) }); },
  setUser: (user) => set({ user }),
  signOut: async () => {
    const token = get().token;
    try { if (token) await api.logout(token); } catch (error) { /* local logout must still complete */ }
    await AsyncStorage.removeItem(KEY);
    set({ token: null, user: null });
  }
}));
