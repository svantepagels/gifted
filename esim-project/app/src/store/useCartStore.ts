import { create } from 'zustand';
import type { Plan, Destination, Order } from '../types';

interface CartState {
  selectedPlan: Plan | null;
  destination: Destination | null;
  order: Order | null;
  selectPlan: (plan: Plan, destination: Destination) => void;
  clearCart: () => void;
  setOrder: (order: Order) => void;
  clearOrder: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  selectedPlan: null,
  destination: null,
  order: null,

  selectPlan: (plan, destination) =>
    set({ selectedPlan: plan, destination }),

  clearCart: () =>
    set({ selectedPlan: null, destination: null }),

  setOrder: (order) =>
    set({ order }),

  clearOrder: () =>
    set({ order: null }),
}));
