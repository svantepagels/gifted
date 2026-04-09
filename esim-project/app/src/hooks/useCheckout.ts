import { useState } from 'react';
import { createOrder } from '../api/orders';
import { useCartStore } from '../store/useCartStore';

export function useCheckout() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { selectedPlan, destination, setOrder } = useCartStore();

  async function checkout(email: string): Promise<boolean> {
    if (!selectedPlan || !destination) {
      setError('No plan selected.');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const order = await createOrder({ plan: selectedPlan, destination, email });
      setOrder(order);
      return true;
    } catch {
      setError('Something went wrong. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }

  return { checkout, loading, error };
}
