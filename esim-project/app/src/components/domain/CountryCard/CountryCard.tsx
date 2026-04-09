import { Link } from 'react-router-dom';
import { Card } from '../../ui/Card/Card';
import { Badge } from '../../ui/Badge/Badge';
import { formatPrice } from '../../../utils/format';
import type { Destination } from '../../../types';
import styles from './CountryCard.module.css';

interface CountryCardProps {
  destination: Destination;
}

export function CountryCard({ destination }: CountryCardProps) {
  const minPrice = Math.min(...destination.plans.map((p) => p.price));

  return (
    <Link to={`/destination/${destination.slug}`} style={{ textDecoration: 'none' }}>
      <Card interactive>
        <div className={styles.card}>
          <span className={styles.flag} role="img" aria-label={`${destination.name} flag`}>
            {destination.flag}
          </span>
          <div className={styles.info}>
            <span className={styles.name}>
              {destination.name}
              {destination.popular && (
                <>
                  {' '}
                  <Badge>Popular</Badge>
                </>
              )}
            </span>
            <span className={styles.price}>From {formatPrice(minPrice)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
