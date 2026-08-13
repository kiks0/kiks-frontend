import React from 'react';
import PageLoader from './PageLoader';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Check if it's a chunk loading error (common on new deployments)
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      console.warn("System: Chunk loading failure detected. Triggering self-healing reload...");
      window.location.reload();
      return { hasError: false };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("System Error caught by Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
          <img src="/logo-kiks.png" alt="KIKS" className="w-24 mb-10 opacity-30" />
          <h2 className="text-[12px] tracking-[0.2em] uppercase font-black mb-4">Something went wrong</h2>
          <p className="text-[10px] tracking-[0.1em] text-black/40 max-w-xs mb-4 leading-relaxed">
            The system encountered an error. Please refresh the page to continue.
          </p>
          {this.state.error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded text-left font-mono text-[11px] max-w-2xl mb-8 overflow-auto max-h-60 w-full shadow-inner">
              <div className="font-bold border-b border-red-200 pb-2 mb-2">Error: {this.state.error.toString()}</div>
              <pre className="whitespace-pre-wrap text-[9px] text-red-700/80 leading-normal">{this.state.error.stack}</pre>
            </div>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="text-[10px] tracking-[0.2em] font-black uppercase border-b border-black pb-2 hover:opacity-50 transition-all"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
