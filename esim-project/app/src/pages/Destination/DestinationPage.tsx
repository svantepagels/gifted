import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Container } from '../../components/layout/Container/Container';
import { PlanCard } from '../../components/domain/PlanCard/PlanCard';
import { CartSummary } from '../../components/domain/CartSummary/CartSummary';
import { Skeleton } from '../../components/ui/Skeleton/Skeleton';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { getDestination } from '../../api/destinations';
import { useCartStore } from '../../store/useCartStore';
import { formatPrice } from '../../utils/format';
import type { Destination, Plan } from '../../types';
import styles from './DestinationPage.module.css';

export function DestinationPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<{
    destination: Destination | null;
    loading: boolean;
    notFound: boolean;
  }>({
    destination: null,
    loading: true,
    notFound: false,
  });

  const { selectedPlan, destination: cartDest, selectPlan } = useCartStore();

  useEffect(() => {
    let cancelled = false;
    
    // Reset state for new slug — valid data fetching pattern
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState((prev) => {
      // Only reset if slug changed (avoid unnecessary re-render)
      if (prev.destination?.slug === slug) return prev;
      return { destination: null, loading: true, notFound: false };
    });

    getDestination(slug ?? '').then((d) => {
      if (cancelled) return;
      setState({
        destination: d,
        loading: false,
        notFound: !d,
      });
    });

    return () => { cancelled = true; };
  }, [slug]);

  // SEO: Update page title and description when destination loads
  useEffect(() => {
    if (state.destination) {
      const cheapestPlan = state.destination.plans.reduce((min, plan) =>
        plan.price < min.price ? plan : min
      , state.destination.plans[0]);
      
      const title = `${state.destination.name} eSIM Plans from ${formatPrice(cheapestPlan.price)} | Roamly`;
      const description = `Get instant eSIM data for ${state.destination.name}. ${state.destination.plans.length} plans available. Activate in seconds, no physical SIM needed.`;
      
      document.title = title;
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }
  }, [state.destination]);

  const handleSelect = (plan: Plan) => {
    if (state.destination) {
      selectPlan(plan, state.destination);
      // Auto-navigate to checkout for seamless UX (Fix #1)
      navigate('/checkout');
    }
  };

  const isSelected = (plan: Plan) =>
    selectedPlan?.id === plan.id && cartDest?.slug === state.destination?.slug;

  const hasSelection = selectedPlan !== null && cartDest?.slug === state.destination?.slug;

  if (state.notFound) {
    return (
      <Container>
        <div className={`${styles.notFound} page-enter`}>
          <p>Destination not found.</p>
          <Link to="/">
            <Button variant="secondary">Browse all destinations</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className={`${styles.page} page-enter ${hasSelection ? styles.bottomPad : ''}`}>
        <Link to="/" className={styles.backLink}>
          <ArrowLeft size={16} strokeWidth={1.75} />
          All destinations
        </Link>

        {state.loading ? (
          <>
            <div className={styles.header}>
              <Skeleton width={64} height={64} borderRadius="50%" />
              <div className={styles.headerInfo}>
                <Skeleton width={200} height={32} />
                <Skeleton width={300} height={16} />
              </div>
            </div>
            <div className={styles.skeletonPlans}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Skeleton height={28} width="30%" />
                    <Skeleton height={14} width="50%" />
                    <Skeleton height={14} width="40%" />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                      <Skeleton height={22} width={60} />
                      <Skeleton height={44} width={90} borderRadius="var(--radius-md)" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : state.destination ? (
          <>
            <div className={styles.header}>
              <span className={styles.flag} role="img" aria-label={`${state.destination.name} flag`}>
                {state.destination.flag}
              </span>
              <div className={styles.headerInfo}>
                <h1>{state.destination.name}</h1>
                <p className={styles.subtitle}>
                  Coverage in {state.destination.name} · eSIM · Instant delivery
                </p>
              </div>
            </div>

            <div className={styles.content}>
              <div className={styles.plans}>
                <h2>Choose a plan</h2>
                <div className={styles.planGrid}>
                  {state.destination.plans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      selected={isSelected(plan)}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              </div>

              {hasSelection && (
                <div className={styles.sidebar}>
                  <CartSummary />
                </div>
              )}
            </div>

            <div className={styles.mobileCartOnly}>
              {hasSelection && <CartSummary />}
            </div>

          </>
        ) : null}
      </div>
    </Container>
  );
}
