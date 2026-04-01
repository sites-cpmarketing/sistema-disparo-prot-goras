import React, { useEffect } from 'react';
import { useAppStore } from './store';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';

function App() {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const ghlApiKey = useAppStore((state) => state.ghlApiKey);
  const ghlLocationId = useAppStore((state) => state.ghlLocationId);

  useEffect(() => {
    // Check if already authenticated via localStorage
    if (ghlApiKey && ghlLocationId) {
      useAppStore.setState({ isAuthenticated: true });
    }
  }, [ghlApiKey, ghlLocationId]);

  if (!isAuthenticated) {
    return <Settings />;
  }

  return <Dashboard />;
}

export default App;
