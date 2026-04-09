import { Card } from '../../ui/Card/Card';
import { Badge } from '../../ui/Badge/Badge';
import { Button } from '../../ui/Button/Button';
import { formatPrice, formatValidity, pricePerGB } from '../../../utils/format';
import type { Plan } from '../../../types';
import styles from './PlanCard.module.css';

interface PlanCardProps {
  plan: Plan;
  selected: boolean;
  onSelect: (plan: Plan) => void;
}

export function PlanCard({ plan, selected, onSelect }: PlanCardProps) {
  const perGb = pricePerGB(plan.price, plan.data);

  return (
    <Card
      interactive
      selected={selected}
      onClick={() => onSelect(plan)}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`${plan.data} plan, ${formatValidity(plan.duration)}, ${formatPrice(plan.price)}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(plan);
        }
      }}
    >
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.data}>{plan.data}</span>
          <div className={styles.badgeRow}>
            {plan.bestValue && <Badge>Best value</Badge>}
          </div>
        </div>
        <div className={styles.details}>
          <span className={styles.detail}>{formatValidity(plan.duration)} validity</span>
          {perGb !== null && (
            <span className={styles.detail}>{formatPrice(perGb)}/GB</span>
          )}
        </div>
        <div className={styles.footer}>
          <span className={styles.price}>{formatPrice(plan.price)}</span>
          <Button variant={selected ? 'primary' : 'secondary'} tabIndex={-1}>
            {selected ? 'Selected' : 'Select'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
