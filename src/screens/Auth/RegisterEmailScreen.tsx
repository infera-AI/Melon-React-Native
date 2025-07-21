import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RegisterEmailScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Register with Email</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A1B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 20,
  },
});

export default RegisterEmailScreen;
