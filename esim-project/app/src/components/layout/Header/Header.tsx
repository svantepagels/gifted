import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Container } from '../Container/Container';
import { useCartStore } from '../../../store/useCartStore';
import styles from './Header.module.css';

export function Header() {
  const selectedPlan = useCartStore((s) => s.selectedPlan);
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <Container>
        <div className={styles.inner}>
          <Link to="/" className={styles.logo} aria-label="Roamly home">
            Roamly
          </Link>
          <nav className={styles.nav}>
            <button
              className={styles.cartButton}
              onClick={() => navigate('/checkout')}
              aria-label={selectedPlan ? 'View cart — 1 item' : 'Cart is empty'}
            >
              <ShoppingBag size={20} strokeWidth={1.75} />
              {selectedPlan && <span className={styles.cartBadge} />}
            </button>
          </nav>
        </div>
      </Container>
    </header>
  );
}
