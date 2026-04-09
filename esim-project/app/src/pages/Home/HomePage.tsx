import { useMemo } from 'react';
import { Container } from '../../components/layout/Container/Container';
import { SearchBar } from '../../components/domain/SearchBar/SearchBar';
import { CountryCard } from '../../components/domain/CountryCard/CountryCard';
import { TrustBadges } from '../../components/domain/TrustBadges/TrustBadges';
import { Skeleton } from '../../components/ui/Skeleton/Skeleton';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { useDestinations } from '../../hooks/useDestinations';
import { useDestinationStore } from '../../store/useDestinationStore';
import { usePageTitle } from '../../hooks/usePageTitle';
import type { Destination } from '../../types';
import styles from './HomePage.module.css';

function fuzzyMatch(query: string, name: string, code: string): boolean {
  const q = query.toLowerCase();
  const n = name.toLowerCase();
  if (n.includes(q)) return true;
  if (code.toLowerCase().includes(q)) return true;
  // Handle common aliases
  if (q === 'uk' && code === 'GB') return true;
  if (q === 'usa' && code === 'US') return true;
  if (q === 'uae' && code === 'AE') return true;
  return false;
}

export function HomePage() {
  usePageTitle(
    'Roamly — eSIM for International Travel',
    'Get instant data for 150+ countries. Browse eSIM plans by destination, pick your data, and stay connected worldwide.'
  );

  const { destinations, loading, error } = useDestinations();
  const searchQuery = useDestinationStore((s) => s.searchQuery);
  const setError = useDestinationStore((s) => s.setError);
  const setLoading = useDestinationStore((s) => s.setLoading);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return destinations;
    return destinations.filter((d) => fuzzyMatch(searchQuery, d.name, d.countryCode));
  }, [destinations, searchQuery]);

  const popular = useMemo(() => filtered.filter((d) => d.popular), [filtered]);

  const grouped = useMemo(() => {
    const groups: Record<string, Destination[]> = {};
    filtered.forEach((d) => {
      if (!groups[d.region]) groups[d.region] = [];
      groups[d.region].push(d);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  if (error) {
    return (
      <Container>
        <div className={`${styles.page} page-enter`}>
          <div className={styles.errorBox}>
            <p>{error}</p>
            <Button
              onClick={() => {
                setError(null);
                setLoading(true);
              }}
            >
              Try again
            </Button>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className={`${styles.page} page-enter`}>
        <div className={styles.hero}>
          <h1>Instant data, everywhere.</h1>
          <p className={styles.tagline}>
            Pick a country, pick a plan, go.
          </p>
          <TrustBadges />
          <SearchBar />
        </div>

        {loading ? (
          <div className={styles.skeletonGrid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px' }}>
                  <Skeleton width={32} height={32} borderRadius="50%" />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Skeleton height={16} width="70%" />
                    <Skeleton height={14} width="40%" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <p>
              No destinations found for{' '}
              <span className={styles.emptyQuery}>"{searchQuery}"</span>
            </p>
            <p>Try a different search or browse all destinations below.</p>
          </div>
        ) : (
          <>
            {!searchQuery && popular.length > 0 && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Popular destinations</h2>
                <div className={styles.grid}>
                  {popular.map((d) => (
                    <CountryCard key={d.countryCode} destination={d} />
                  ))}
                </div>
              </div>
            )}

            {grouped.map(([region, dests]) => (
              <div key={region} className={styles.section}>
                <h2 className={styles.sectionTitle}>{region}</h2>
                <div className={styles.grid}>
                  {dests.map((d) => (
                    <CountryCard key={d.countryCode} destination={d} />
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </Container>
  );
}
