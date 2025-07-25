import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LanguageScreen from '../screens/LanguageScreen';
import AuthNavigator from '../screens/Auth/AuthNavigator';
import MainAppNavigator from './MainAppNavigator';

import { NavigatorScreenParams } from '@react-navigation/native';
import { AuthStackParamList } from '../screens/Auth/AuthNavigator';
import { MainAppStackParamList } from './MainAppNavigator';

export type RootStackParamList = {
  Splash: undefined;
  Language: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  MainApp: NavigatorScreenParams<MainAppStackParamList>;
};

// const Stack = createStackNavigator<RootStackParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#000', // 统一背景色为黑色，可根据主题调整
  },
};

const AppNavigator = () => {
  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false, // 由页面自定义 header
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Language" component={LanguageScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        {/* 添加MainApp路由 */}
        <Stack.Screen
          name="MainApp"
          component={MainAppNavigator}
          options={{ gestureEnabled: false }} // 禁用返回手势
        />
        {/* 这里可继续添加其他页面 */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
