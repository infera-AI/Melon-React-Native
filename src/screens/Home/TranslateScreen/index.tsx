import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../../../contexts/LanguageContext';

const TranslateScreen: React.FC = () => {
  const { t } = useLanguage();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('translate_screen')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#181819',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default TranslateScreen;
