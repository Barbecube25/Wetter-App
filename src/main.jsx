import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

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
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
