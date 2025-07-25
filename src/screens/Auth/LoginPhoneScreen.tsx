import React, {useEffect} from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigationState } from '@react-navigation/native';

const LoginPhoneScreen: React.FC = () => {
  const navState = useNavigationState(state => state);

  useEffect(() => {
    console.log('当前导航状态:', JSON.stringify(navState, null, 2));
  }, [navState])

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Login with Phone</Text>
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

export default LoginPhoneScreen;
