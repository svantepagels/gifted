import { useEffect } from 'react';
import { getDestinations } from '../api/destinations';
import { useDestinationStore } from '../store/useDestinationStore';

export function useDestinations() {
  const { destinations, loading, error, setDestinations, setError } = useDestinationStore();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await getDestinations();
        if (!cancelled) setDestinations(data);
      } catch {
        if (!cancelled) setError('Failed to load destinations. Please try again.');
      }
    }

    if (destinations.length === 0 && !error) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [destinations.length, error, setDestinations, setError]);

  return { destinations, loading, error };
}
