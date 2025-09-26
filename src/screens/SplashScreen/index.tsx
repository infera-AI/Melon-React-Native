import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Dimensions, StatusBar, SafeAreaView, Animated, Image, View, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useUserStore, useAppStore } from '../../store';
import { RootStackParamList } from '../../navigation/AppNavigator';
import CSJSplashAd, { CSJSplashAdMethods } from '@/components/CSJSplashAd'; // 导入封装好的开屏广告组件
import { useBackHandler } from '@/utils/BackHandlerUtil'; // 导入工具类
import {APP_SIGN_ENUM} from '@/utils/constants'

import { AppOpenAd, InterstitialAd, RewardedAd, BannerAd, TestIds, AdEventType } from 'react-native-google-mobile-ads';

const { width, height } = Dimensions.get('window');
const SplashScreen: React.FC = () => {
  useBackHandler('再按一次退出')
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [hydrated, setHydrated] = useState(false);

  // 1. 创建组件ref，用于调用内部方法
  const splashAdRef = useRef<CSJSplashAdMethods | null>(null);

  // 页面获取焦点时调用
  const handleFocus = () => {
    splashAdRef.current?.onResume();
  };

  // 页面失去焦点时调用
  const handleBlur = () => {
    splashAdRef.current?.onStop();
  };

  useEffect(() => {

    let unsub: (() => void) | undefined;
    if (useUserStore.persist.hasHydrated()) {
      setHydrated(true);
    } else {
      unsub = useUserStore.persist.onFinishHydration(() => {
        setHydrated(true);
      });
    }
    const appSign = useAppStore.getState().appSign
    let appOpenAd:any
    if ( // 国外版需要谷歌广告
      appSign === APP_SIGN_ENUM.TYPE_MELONS ||
      appSign === APP_SIGN_ENUM.TYPE_MOMORS
    ) {
      // appOpenAd = AppOpenAd.createForAdRequest(TestIds.APP_OPEN, {});
      // appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      //   console.log('谷歌开屏广告已加载完成');
      //   appOpenAd.show()
      // })
      // appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
      //   console.log('谷歌开屏广告已关闭');
      //   goPageHandle()
        
      // })

      // appOpenAd.load()
      goPageHandle()
    }
    

    return () => {
      unsub && unsub()
      appOpenAd && appOpenAd?.removeAllListeners()
    }
   
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const token = useUserStore.getState().token;
    console.log('hydrated token ==>', token);
    // setTimeout(() => {
    //   Animated.timing(fadeAnim, {
    //     toValue: 0,
    //     duration: 2000,
    //     useNativeDriver: true,
    //   }).start(() => {
    //     // 根据是否有 token 决定跳转到哪个页面
    //     if (token) {
    //       // 有 token，跳转到主应用（Translate 页面）
    //       // navigation.navigate('MainApp' as any);
    //       navigation.reset({index: 0, routes: [{name: 'MainApp'}]})
    //     } else {
    //       // 没有 token，跳转到欢迎页面
    //       navigation.navigate('Auth' as any);
    //     }
    //   });
    // }, 1500)
    
   
  }, [hydrated])

  const goPageHandle = () => {
    // // if (!hydrated) return;
    // const token = useUserStore.getState().token;
    // console.log('hydrated token ==>', token);
    // // 根据是否有 token 决定跳转到哪个页面
    // if (token) {
    //   // 有 token，跳转到主应用（Translate 页面）
    //   // navigation.navigate('MainApp' as any);
    //   navigation.reset({index: 0, routes: [{name: 'MainApp'}]})
    // } else {
    //   // 没有 token，跳转到欢迎页面
    //   // navigation.navigate('Auth' as any);
    //   navigation.reset({index: 0, routes: [{name: 'Auth'}]})
    // }


    navigation.reset({index: 0, routes: [{name: 'MainApp'}]})
  }

  // return (
  //   <SafeAreaView style={styles.safe}>
  //     <StatusBar backgroundColor="#000" barStyle="light-content" />
  //     <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
  //       <Image
  //         source={require('../../../assets/images/splash.png')}
  //         style={styles.image}
  //         resizeMode="stretch"
  //       />
  //     </Animated.View>
  //   </SafeAreaView>
  // );
  return (
    <View style={{flex: 1}}>
      {
        (
          useAppStore.getState().appSign === APP_SIGN_ENUM.TYPE_MELON ||
          useAppStore.getState().appSign === APP_SIGN_ENUM.TYPE_MOMOR
        ) &&
          <CSJSplashAd
            ref={splashAdRef}  // 绑定ref
            // adCodeId={Platform.OS === 'android' ? '892518263' : '892577270'}
            adCodeId={'892518263'}
            timeout={5000}
            onAdClose={goPageHandle}
            onError={goPageHandle}
            // 其他回调...
          />
      }
    </View>
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
