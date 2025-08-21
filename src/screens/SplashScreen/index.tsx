import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Dimensions, StatusBar, SafeAreaView, Animated, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useUserStore } from '../../store';
import { RootStackParamList } from '../../navigation/AppNavigator';

const { width, height } = Dimensions.get('window');
const SplashScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (useUserStore.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      const unsub = useUserStore.persist.onFinishHydration(() => {
        setHydrated(true);
      });
      return unsub;
    }
   
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const token = useUserStore.getState().token;
    console.log('hydrated token ==>', token);
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        // 根据是否有 token 决定跳转到哪个页面
        if (token) {
          // 有 token，跳转到主应用（Translate 页面）
          // navigation.navigate('MainApp' as any);
          navigation.reset({index: 0, routes: [{name: 'MainApp'}]})
        } else {
          // 没有 token，跳转到欢迎页面
          navigation.navigate('Auth' as any);
        }
      });
    }, 1500)
    
   
  }, [hydrated])

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Image
          source={require('../../../assets/images/splash.png')}
          style={styles.image}
          resizeMode="stretch"
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  image: {
    width: width,
    height: height,
    position:'absolute',
    top:0,
    left:0,
    right:0,
    bottom:0,
  },
});

export default SplashScreen;
