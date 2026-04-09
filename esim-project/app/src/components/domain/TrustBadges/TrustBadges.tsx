import { Star, Users, Shield } from 'lucide-react';
import styles from './TrustBadges.module.css';

export function TrustBadges() {
  return (
    <div className={styles.container}>
      <div className={styles.badge}>
        <Star size={20} fill="currentColor" />
        <span className={styles.text}>
          <strong>4.8/5</strong> from 50K+ travelers
        </span>
      </div>
      <div className={styles.badge}>
        <Users size={20} />
        <span className={styles.text}>
          <strong>150K+</strong> active users
        </span>
      </div>
      <div className={styles.badge}>
        <Shield size={20} />
        <span className={styles.text}>
          30-day money-back guarantee
        </span>
      </div>
    </div>
  );
}
