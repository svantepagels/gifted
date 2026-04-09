import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Container } from '../components/layout/Container/Container';
import { Button } from '../components/ui/Button/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
    // Increment error count to force fresh mount on retry
    this.setState(state => ({ errorCount: state.errorCount + 1 }));
  }

  handleReset = () => {
    this.setState(state => ({
      hasError: false,
      errorCount: state.errorCount + 1,
    }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container>
          <div style={{ textAlign: 'center', padding: '64px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <h1>Something went wrong</h1>
            <p style={{ color: 'var(--color-stone)' }}>
              Please try refreshing the page.
            </p>
            <Button onClick={this.handleReset}>
              Try again
            </Button>
          </div>
        </Container>
      );
    }

    return <div key={this.state.errorCount}>{this.props.children}</div>;
  }
}
