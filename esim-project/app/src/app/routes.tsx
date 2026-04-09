import { lazy, Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Container } from '../components/layout/Container/Container';
import { Skeleton } from '../components/ui/Skeleton/Skeleton';
import { Button } from '../components/ui/Button/Button';

const HomePage = lazy(() => import('../pages/Home/HomePage').then((m) => ({ default: m.HomePage })));
const DestinationPage = lazy(() => import('../pages/Destination/DestinationPage').then((m) => ({ default: m.DestinationPage })));
const CheckoutPage = lazy(() => import('../pages/Checkout/CheckoutPage').then((m) => ({ default: m.CheckoutPage })));
const SuccessPage = lazy(() => import('../pages/Success/SuccessPage').then((m) => ({ default: m.SuccessPage })));

function NotFoundPage() {
  return (
    <Container>
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <h1 style={{ fontSize: 48, marginBottom: 8 }}>404</h1>
        <p style={{ color: 'var(--color-stone)', marginBottom: 24 }}>Page not found</p>
        <Link to="/">
          <Button variant="secondary">Back to home</Button>
        </Link>
      </div>
    </Container>
  );
}

function PageFallback() {
  return (
    <Container>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 32 }}>
        <Skeleton height={32} width="40%" />
        <Skeleton height={20} width="60%" />
        <Skeleton height={200} />
      </div>
    </Container>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/destination/:slug" element={<DestinationPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
