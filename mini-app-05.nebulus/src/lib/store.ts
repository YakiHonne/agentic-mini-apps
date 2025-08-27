import { create } from 'zustand'


export interface User {
  display_name: string;
  name: string;
  picture: string;
  pubkey: string;
  banner: string;
  about: string;
  lud06: string;
  lud16: string;
  website: string;
  nip05: string;
}

interface StoreState {
    user: User | null;
    setUser: (user: User | null) => void;
    origin: string | null;
    setOrigin: (origin: string | null) => void;
}

export const useStore = create<StoreState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  origin: null,
  setOrigin: (origin) => set({ origin }),
}))
