import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CustomTabBar from '../screens/Home/CustomTabBar'

// 首页-翻译
import TranslateScreen from '../screens/Home/TranslateScreen';
import MusicStackNavigator from '../screens/Home/MusicScreen/navigator';
// 首页-个人资料
import ProfileScreen from '../screens/Home/ProfileScreen';

export type MainAppStackParamList = {
  Translate: undefined;
  Music: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainAppStackParamList>();

const MainAppNavigator: React.FC = () => (
  <Tab.Navigator
    initialRouteName="Translate"
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{
      headerShown: false,
      tabBarStyle: {
        borderTopWidth: 0, // 去掉顶部边框
        elevation: 0, // Android 去掉阴影
        display: 'none', // 关键！彻底隐藏原生容器
      }
    }}
  >
    <Tab.Screen name="Translate" component={TranslateScreen} />
    <Tab.Screen name="Music" component={MusicStackNavigator} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default MainAppNavigator;
