import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Theme, defineTheme } from '@astryxdesign/core';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';
import AppRoutes from './routes/AppRoutes';

const appTheme = defineTheme({
  name: 'tsshop',
});

function App() {
  return (
    <Theme theme={appTheme} mode="system">
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <AppRoutes />
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </Theme>
  );
}

export default App;
