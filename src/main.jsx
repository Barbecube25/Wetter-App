import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Error Boundary Component to catch initialization errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('App initialization error:', error, errorInfo);
  }

  clearCacheAndReload = () => {
    // Clear all caches, localStorage, and service worker, then reload
    Promise.all([
      // Clear all caches
      'caches' in window
        ? caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))))
        : Promise.resolve(),
      
      // Clear localStorage
      Promise.resolve().then(() => {
        try {
          localStorage.clear();
        } catch (e) {
          console.error('Failed to clear localStorage:', e);
        }
      }),
      
      // Unregister service worker
      'serviceWorker' in navigator
        ? navigator.serviceWorker.getRegistrations().then(registrations =>
            Promise.all(registrations.map(reg => reg.unregister()))
          )
        : Promise.resolve()
    ])
    .then(() => {
      console.log('All caches and data cleared, reloading...');
      window.location.reload();
    })
    .catch(err => {
      console.error('Error during cache clearing:', err);
      // Reload anyway to attempt recovery
      window.location.reload();
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '20px',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: '#f5f5f5'
        }}>
          <div style={{
            maxWidth: '400px',
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#333' }}>
              ⚠️ App Error
            </h1>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              The app failed to load. This might be due to corrupted cache or an update issue.
            </p>
            <button
              onClick={this.clearCacheAndReload}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Clear Cache & Reload
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{ marginTop: '20px', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#666' }}>Error Details</summary>
                <pre style={{
                  fontSize: '12px',
                  backgroundColor: '#f5f5f5',
                  padding: '10px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  marginTop: '10px'
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Erweiterte Service Worker Registrierung
if ('serviceWorker' in navigator) {
  let refreshing = false; // Prevent infinite reload loop
  
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registriert:', registration.scope);
        
        // Check auf Updates beim Start
        registration.update();
        
        // Reload on service worker activation (fixes white screen after update)
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'activated' && !refreshing) {
                refreshing = true;
                console.log('Neuer Service Worker aktiviert - Seite wird neu geladen');
                // Small delay to ensure cache is cleaned
                setTimeout(() => {
                  window.location.reload();
                }, 100);
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('SW Fehler:', error);
        // Don't fail the app if SW registration fails
        // The app should still work without service worker
      });
  });
}

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
  // Don't prevent default - let error boundary handle it
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Don't fail the app on promise rejections
  event.preventDefault();
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
