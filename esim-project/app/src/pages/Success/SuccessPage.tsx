import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Check, Smartphone } from 'lucide-react';
import { Container } from '../../components/layout/Container/Container';
import { Card } from '../../components/ui/Card/Card';
import { Button } from '../../components/ui/Button/Button';
import { useCartStore } from '../../store/useCartStore';
import { usePageTitle } from '../../hooks/usePageTitle';
import { formatPrice, formatValidity } from '../../utils/format';
import { isMobileDevice, getPlatformName } from '../../utils/deviceDetection';
import { 
  fetchActivationDetails, 
  generateLPAUrl, 
  generateInstallUrl,
  generateQRCodeDataUrl,
  type ESIMActivation 
} from '../../utils/esimInstallation';
import styles from './SuccessPage.module.css';

export function SuccessPage() {
  const { order, clearCart } = useCartStore();
  const [activation, setActivation] = useState<ESIMActivation | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loadingActivation, setLoadingActivation] = useState(true);
  const isMobile = isMobileDevice();
  const platformName = getPlatformName();

  usePageTitle(
    'Order Confirmed — Roamly',
    'Your eSIM has been delivered. Install it now to start using data worldwide.'
  );

  // Fetch eSIM activation details on mount
  useEffect(() => {
    if (!order) return;

    let cancelled = false;

    fetchActivationDetails(order.id)
      .then(async (details) => {
        if (cancelled) return;
        
        setActivation(details);
        
        // Generate QR code for desktop users
        if (!isMobile) {
          const lpaUrl = generateLPAUrl(details);
          const qrUrl = await generateQRCodeDataUrl(lpaUrl);
          if (!cancelled) {
            setQrCodeUrl(qrUrl);
          }
        }
      })
      .catch((error) => {
        console.error('Failed to fetch eSIM activation:', error);
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingActivation(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [order, isMobile]);

  useEffect(() => {
    if (order) clearCart();
  }, [order, clearCart]);

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <Container>
      <div className={`${styles.page} page-enter`}>
        <div className={styles.checkmark}>
          <Check size={32} strokeWidth={2} />
        </div>

        <h1>You're all set!</h1>
        <p className={styles.orderId}>Order {order.id}</p>

        <Card className={styles.orderDetails}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Destination</span>
            <span className={styles.detailValue}>
              {order.destination.flag} {order.destination.name}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Plan</span>
            <span className={styles.detailValue}>
              {order.plan.data} · {formatValidity(order.plan.duration)}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Price</span>
            <span className={styles.detailValue}>{formatPrice(order.plan.price)}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Delivered to</span>
            <span className={styles.detailValue}>{order.email}</span>
          </div>
        </Card>

        {/* Fix #2: Conditional eSIM installation UI based on device type */}
        <div className={styles.installSection}>
          {loadingActivation ? (
            <div className={styles.loadingState}>
              <p>Preparing your eSIM...</p>
            </div>
          ) : isMobile && activation ? (
            // Mobile: Show direct install button
            <div className={styles.mobileInstall}>
              <Button
                onClick={() => {
                  const lpaUrl = generateLPAUrl(activation);
                  const installUrl = generateInstallUrl(lpaUrl);
                  window.location.href = installUrl;
                }}
                className={styles.installButton}
              >
                <Smartphone size={20} />
                Install eSIM on {platformName}
              </Button>
              <p className={styles.installHint}>
                This will open your device settings to complete installation
              </p>
            </div>
          ) : qrCodeUrl ? (
            // Desktop: Show QR code
            <div className={styles.qrSection}>
              <div className={styles.qrCode}>
                <img src={qrCodeUrl} alt="eSIM QR Code" className={styles.qrImage} />
              </div>
              <span className={styles.qrLabel}>Scan with your phone to install eSIM</span>
            </div>
          ) : null}
        </div>

        <div className={styles.steps}>
          <h2 className={styles.stepsTitle}>How to install</h2>
          {isMobile ? (
            // Mobile-specific instructions
            <>
              <div className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <span className={styles.stepText}>
                  Tap the "Install eSIM" button above to open your device settings.
                </span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <span className={styles.stepText}>
                  Follow the on-screen prompts to install the eSIM profile.
                  Keep Wi-Fi connected during setup.
                </span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <span className={styles.stepText}>
                  When you arrive at your destination, enable the eSIM in your
                  cellular settings. Data roaming must be turned on.
                </span>
              </div>
            </>
          ) : (
            // Desktop-specific instructions
            <>
              <div className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <span className={styles.stepText}>
                  Open your phone's camera and scan the QR code above, or go to
                  Settings → Cellular → Add eSIM.
                </span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <span className={styles.stepText}>
                  Follow the on-screen prompts to install the eSIM profile.
                  Keep Wi-Fi connected during setup.
                </span>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <span className={styles.stepText}>
                  When you arrive at your destination, enable the eSIM in your
                  cellular settings. Data roaming must be turned on.
                </span>
              </div>
            </>
          )}
        </div>

        <Link to="/">
          <Button variant="secondary">Browse more destinations</Button>
        </Link>
      </div>
    </Container>
  );
}
