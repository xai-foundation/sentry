import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ({ error }: { error: Error }) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🔥 React Error Boundary Caught:', {
      error,
      errorInfo,
      timestamp: new Date().toISOString()
    });
  }

  public render() {
    if (this.state.hasError && this.state.error) {
      return this.props.fallback({ error: this.state.error });
    }

    return this.props.children;
  }
}

export default ErrorBoundary;