import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Remove any existing loading screen
setTimeout(() => {
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0';
    loadingScreen.style.transition = 'opacity 0.5s ease';
    setTimeout(() => {
      loadingScreen.remove();
    }, 500);
  }
}, 100);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
