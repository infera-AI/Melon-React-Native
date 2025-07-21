import React from 'react';
import { LanguageProvider } from './contexts/LanguageContext';
import AppNavigator from './navigation/AppNavigator';

const App = () => {
  return (
    <LanguageProvider>
      <AppNavigator />
    </LanguageProvider>
  );
};

export default App;
