import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './useCartStore';
import type { Plan, Destination, Order } from '../types';

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ selectedPlan: null, destination: null, order: null });
  });

  it('should start with empty cart', () => {
    const { selectedPlan, destination } = useCartStore.getState();
    expect(selectedPlan).toBeNull();
    expect(destination).toBeNull();
  });

  it('should select a plan with destination', () => {
    const mockPlan: Plan = {
      id: '1',
      data: '5 GB',
      dataBytes: 5000000000,
      duration: 7,
      price: 10,
      currency: 'USD',
    };

    const mockDestination: Destination = {
      slug: 'united-states',
      countryCode: 'US',
      name: 'United States',
      flag: '🇺🇸',
      plans: [],
      region: 'Americas',
      popular: true,
    };

    useCartStore.getState().selectPlan(mockPlan, mockDestination);
    const { selectedPlan, destination } = useCartStore.getState();
    
    expect(selectedPlan).toEqual(mockPlan);
    expect(destination).toEqual(mockDestination);
  });

  it('should clear cart', () => {
    const mockPlan: Plan = {
      id: '1',
      data: '5 GB',
      dataBytes: 5000000000,
      duration: 7,
      price: 10,
      currency: 'USD',
    };

    const mockDestination: Destination = {
      slug: 'united-states',
      countryCode: 'US',
      name: 'United States',
      flag: '🇺🇸',
      plans: [],
      region: 'Americas',
      popular: true,
    };

    useCartStore.getState().selectPlan(mockPlan, mockDestination);
    useCartStore.getState().clearCart();
    const { selectedPlan, destination } = useCartStore.getState();
    
    expect(selectedPlan).toBeNull();
    expect(destination).toBeNull();
  });

  it('should set and clear order', () => {
    const mockPlan: Plan = {
      id: '1',
      data: '5 GB',
      dataBytes: 5000000000,
      duration: 7,
      price: 10,
      currency: 'USD',
    };

    const mockDestination: Destination = {
      slug: 'united-states',
      countryCode: 'US',
      name: 'United States',
      flag: '🇺🇸',
      plans: [],
      region: 'Americas',
      popular: true,
    };

    const mockOrder: Order = {
      id: 'ORD-123',
      email: 'test@example.com',
      plan: mockPlan,
      destination: mockDestination,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    useCartStore.getState().setOrder(mockOrder);
    expect(useCartStore.getState().order).toEqual(mockOrder);

    useCartStore.getState().clearOrder();
    expect(useCartStore.getState().order).toBeNull();
  });
});
