import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Zap, Headphones } from 'lucide-react';
import { Input } from '../../ui/Input/Input';
import { Button } from '../../ui/Button/Button';
import { useCheckout } from '../../../hooks/useCheckout';
import { isValidEmail } from '../../../utils/format';
import styles from './CheckoutForm.module.css';

export function CheckoutForm() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState(false);
  const { checkout, loading, error } = useCheckout();
  const navigate = useNavigate();

  const validate = (value: string) => {
    if (!value) return 'Email is required for eSIM delivery';
    if (!isValidEmail(value)) return 'Please enter a valid email address';
    return '';
  };

  const handleBlur = () => {
    setTouched(true);
    setEmailError(validate(email));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validate(email);
    setTouched(true);
    setEmailError(err);
    if (err) return;

    const success = await checkout(email);
    if (success) {
      navigate('/success');
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Delivery</h3>
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (touched) setEmailError(validate(e.target.value));
          }}
          onBlur={handleBlur}
          error={touched ? emailError : undefined}
          required
          autoComplete="email"
        />
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Payment</h3>
        <div className={styles.paymentStub}>
          Payment integration coming soon.
          <br />
          Click below to simulate a purchase.
        </div>
      </div>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <Button
        type="submit"
        fullWidth
        loading={loading}
        disabled={!email || (touched && !!emailError)}
      >
        Complete order
      </Button>

      <div className={styles.trust}>
        <span className={styles.trustItem}>
          <Zap size={16} strokeWidth={1.75} /> Instant delivery
        </span>
        <span className={styles.trustItem}>
          <Shield size={16} strokeWidth={1.75} /> Secure checkout
        </span>
        <span className={styles.trustItem}>
          <Headphones size={16} strokeWidth={1.75} /> 24/7 support
        </span>
      </div>
    </form>
  );
}
