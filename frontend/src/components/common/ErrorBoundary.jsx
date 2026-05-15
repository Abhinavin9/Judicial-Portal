import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 p-6">
          <div className="glass-card p-10 max-w-lg w-full text-center space-y-6">
            <div className="p-4 bg-rose-500/20 rounded-full inline-block">
              <AlertCircle className="h-12 w-12 text-rose-500" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">System Interruption</h2>
            <p className="text-gray-400 font-medium">
              We encountered an unexpected error while loading this module. This could be due to a connection issue or a component failure.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-3 w-full px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-black shadow-2xl shadow-primary-500/20 transition-all transform hover:-translate-y-1"
            >
              <RefreshCw className="h-5 w-5" />
              RELOAD SYSTEM
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
