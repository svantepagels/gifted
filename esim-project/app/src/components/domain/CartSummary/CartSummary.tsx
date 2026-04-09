import { useNavigate } from 'react-router-dom';
import { Card } from '../../ui/Card/Card';
import { Button } from '../../ui/Button/Button';
import { useCartStore } from '../../../store/useCartStore';
import { formatPrice, formatValidity } from '../../../utils/format';
import styles from './CartSummary.module.css';

export function CartSummary() {
  const { selectedPlan, destination } = useCartStore();
  const navigate = useNavigate();

  if (!selectedPlan || !destination) return null;

  const handleContinue = () => navigate('/checkout');

  return (
    <>
      {/* Desktop sidebar card */}
      <div className={styles.desktopCard}>
      <Card>
        <div className={styles.summary}>
          <div className={styles.destination}>
            <span className={styles.flag}>{destination.flag}</span>
            <span className={styles.destName}>{destination.name}</span>
          </div>
          <div className={styles.details}>
            <div className={styles.row}>
              <span>Plan</span>
              <span>{selectedPlan.data}</span>
            </div>
            <div className={styles.row}>
              <span>Validity</span>
              <span>{formatValidity(selectedPlan.duration)}</span>
            </div>
          </div>
          <div className={styles.totalRow}>
            <span>Total</span>
            <span>{formatPrice(selectedPlan.price)}</span>
          </div>
          <Button fullWidth onClick={handleContinue}>
            Continue to checkout
          </Button>
        </div>
      </Card>
      </div>

      {/* Mobile bottom bar */}
      <div className={styles.mobileBar}>
        <div className={styles.mobileInfo}>
          <span className={styles.mobilePlan}>
            {destination.flag} {selectedPlan.data} · {formatValidity(selectedPlan.duration)}
          </span>
          <span className={styles.mobilePrice}>{formatPrice(selectedPlan.price)}</span>
        </div>
        <Button onClick={handleContinue}>Continue</Button>
      </div>
    </>
  );
}
