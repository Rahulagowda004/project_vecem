import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Auth0Provider } from '@auth0/auth0-react';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-yis1mhtj5nqvuvr4.us.auth0.com"
      clientId="oHV3nXY9J0oItTNY4gWZjVrMh3pxdLFA"
      authorizationParams={{
        redirect_uri: window.location.origin + '/home'
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>
);