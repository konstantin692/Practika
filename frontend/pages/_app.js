// pages/_app.js
import '../styles/globals.css';
import { AuthProvider } from '../hooks/useAuth';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            backdropFilter: 'blur(16px)',
          },
          success: {
            style: {
              background: 'linear-gradient(135deg, #10b981, #059669)',
            },
          },
          error: {
            style: {
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            },
          },
        }}
      />
    </AuthProvider>
  );
}