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
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("System Error caught by Boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
          <img src="/logo-kiks.png" alt="KIKS" className="w-24 mb-10 opacity-30" />
          <h2 className="text-[10px] tracking-[0.5em] uppercase font-black mb-4">System Refinement</h2>
          <p className="text-[9px] tracking-[0.2em] uppercase text-black/40 max-w-xs mb-10 leading-relaxed">
            We are currently optimizing our digital flagship. Please allow a moment for the system to synchronize.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="text-[9px] tracking-[0.4em] font-black uppercase border-b border-black pb-2 hover:opacity-50 transition-all"
          >
            Refresh System
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
