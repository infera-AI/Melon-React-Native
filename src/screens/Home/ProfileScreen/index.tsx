import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../../../contexts/LanguageContext';

const ProfileScreen: React.FC = () => {
  const { t } = useLanguage();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{t('profile_screen')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
