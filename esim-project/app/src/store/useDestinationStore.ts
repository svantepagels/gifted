import { create } from 'zustand';
import type { Destination } from '../types';

interface DestinationState {
  destinations: Destination[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setDestinations: (destinations: Destination[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const useDestinationStore = create<DestinationState>((set) => ({
  destinations: [],
  loading: true,
  error: null,
  searchQuery: '',

  setDestinations: (destinations) =>
    set({ destinations, loading: false }),

  setLoading: (loading) =>
    set({ loading }),

  setError: (error) =>
    set({ error, loading: false }),

  setSearchQuery: (searchQuery) =>
    set({ searchQuery }),
}));
