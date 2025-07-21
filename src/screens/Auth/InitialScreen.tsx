import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from './AuthNavigator';

const InitialScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.supportText}>If you need any support click here</Text>
      <View style={styles.featuresRow}>
        <View style={styles.featureItem}>
          <View style={styles.iconCircle}>
            {/* 这里可替换为图片或SVG */}
            <Text style={styles.iconText}>A</Text>
          </View>
          <Text style={styles.featureLabel}>AI accurate{'\n'}translation</Text>
        </View>
        <View style={[styles.featureItem, styles.featureCenter]}>
          <View style={styles.iconCircleLarge}>
            {/* 这里可替换为图片或SVG */}
            <Text style={styles.iconTextLarge}>||</Text>
          </View>
          <Text style={styles.featureLabelCenter}>Personal{'\n'}voice cloning</Text>
        </View>
        <View style={styles.featureItem}>
          <View style={styles.iconCircle}>
            {/* 这里可替换为图片或SVG */}
            <Text style={styles.iconText}>C</Text>
          </View>
          <Text style={styles.featureLabel}>Communication{'\n'}Partner</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate('RegisterPhone')}
      >
        <Text style={styles.registerButtonText}>Register a lingo account</Text>
      </TouchableOpacity>
      <Text style={styles.loginText}>
        Already have an account?{' '}
        <Text
          style={styles.loginLink}
          onPress={() => navigation.navigate('LoginPhone')}
        >
          Log in now
        </Text>
      </Text>
      <Text style={styles.agreementText}>
        By registering or logging in, you have read and agreed to the User Service Agreement and Privacy Policy.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181A1B',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 20,
  },
  title: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  supportText: {
    color: '#B0B0B0',
    fontSize: 16,
    marginBottom: 32,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
  },
  featureCenter: {
    zIndex: 1,
    elevation: 2,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6FFF6F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircleLarge: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#6FFF6F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  iconText: {
    fontSize: 28,
    color: '#181A1B',
    fontWeight: 'bold',
  },
  iconTextLarge: {
    fontSize: 40,
    color: '#181A1B',
    fontWeight: 'bold',
  },
  featureLabel: {
    color: '#B0B0B0',
    fontSize: 14,
    textAlign: 'center',
  },
  featureLabelCenter: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#6FFF6F',
    borderRadius: 30,
    width: '100%',
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  registerButtonText: {
    color: '#181A1B',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loginText: {
    color: '#B0B0B0',
    fontSize: 16,
    marginBottom: 16,
  },
  loginLink: {
    color: '#6FFF6F',
    textDecorationLine: 'underline',
  },
  agreementText: {
    color: '#B0B0B0',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default InitialScreen;
