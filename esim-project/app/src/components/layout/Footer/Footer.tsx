import { Container } from '../Container/Container';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.inner}>
          <span className={styles.copy}>&copy; 2026 Roamly</span>
          <ul className={styles.links}>
            <li><a href="#about">About</a></li>
            <li><a href="#support">Support</a></li>
            <li><a href="#terms">Terms</a></li>
          </ul>
        </div>
      </Container>
    </footer>
  );
}
