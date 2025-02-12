// Import React and ReactDOM
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';

// Import main App component
import App from './App';

// Import global styles (if any)
import './index.css';

// Get the root element in the HTML file
const root = createRoot(document.getElementById('root'));

// Render the application
root.render(
  <StrictMode>
    <Auth0Provider
      domain="dev-yis1mhtj5nqvuvr4.us.auth0.com"
      clientId="oHV3nXY9J0oItTNY4gWZjVrMh3pxdLFA"
      authorizationParams={{
        redirect_uri: window.location.origin
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>
);
