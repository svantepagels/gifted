import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Container } from '../../components/layout/Container/Container';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { CheckoutForm } from '../../components/domain/CheckoutForm/CheckoutForm';
import { useCartStore } from '../../store/useCartStore';
import { usePageTitle } from '../../hooks/usePageTitle';
import { formatPrice, formatValidity } from '../../utils/format';
import styles from './CheckoutPage.module.css';

export function CheckoutPage() {
  const { selectedPlan, destination } = useCartStore();

  usePageTitle(
    'Checkout — Roamly',
    'Complete your eSIM purchase. Instant delivery, activate in seconds.'
  );

  if (!selectedPlan || !destination) {
    return (
      <Container>
        <div className={`${styles.empty} page-enter`}>
          <p>No plan selected yet.</p>
          <Link to="/">
            <Button>Browse destinations</Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className={`${styles.page} page-enter`}>
        <Link to={`/destination/${destination.slug}`} className={styles.backLink}>
          <ArrowLeft size={16} strokeWidth={1.75} />
          Back to {destination.name}
        </Link>

        <h1>Checkout</h1>

        <Card>
          <div className={styles.orderSummary}>
            <span className={styles.flag}>{destination.flag}</span>
            <div className={styles.orderInfo}>
              <span className={styles.orderDest}>{destination.name}</span>
              <span className={styles.orderPlan}>
                {selectedPlan.data} · {formatValidity(selectedPlan.duration)}
              </span>
            </div>
            <span className={styles.orderPrice}>{formatPrice(selectedPlan.price)}</span>
          </div>
        </Card>

        <CheckoutForm />
      </div>
    </Container>
  );
}
