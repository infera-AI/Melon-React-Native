import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CustomTabBar from '../screens/Home/CustomTabBar'

// 首页-翻译
import TranslateScreen from '../screens/Home/TranslateScreen';
import MusicStackNavigator from '../screens/Home/MusicScreen/navigator';
// 首页-个人资料
import ProfileNavigator from '../screens/Home/ProfileScreen/ProfileNavigator';
import { useUserStore } from '@/store';

export type MainAppStackParamList = {
  Translate: undefined;
  Music: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainAppStackParamList>();

const MainAppNavigator: React.FC = () => {

  // 定义 Tab 切换事件监听器
  const tabScreenListeners = ({ navigation }: any) => ({
    // 监听 Tab 点击事件
    tabPress: (e: any) => {
      // 获取当前点击的 Tab 名称
      const targetTabName = e.target;
      // console.log('Tab栏点击---', e);
      

      // 仅处理 "Music" Tab 的点击
      if (targetTabName.startsWith('Music')) {
        console.log('来到了Music Tab页');
        if (!useUserStore.getState().token) {
          // 阻止默认行为（避免直接跳转到上次停留的页面）
          e.preventDefault();

          // 手动导航到 Music Tab，并强制重置到首页（MusicMain）
          navigation.navigate('Music', {
            screen: 'MusicMain', // 指定 Music Stack 的首页路由名
          });

          // 若需要彻底重置 Stack 历史（清除返回栈），可使用 reset 动作
          // navigation.reset(
          //   {
          //     index: 0,
          //     routes: [{ name: 'Music', params: { screen: 'MusicMain' } }],
          //   }
          // );
        }

        

        
      }
    },
  });

  return (
    <Tab.Navigator
      initialRouteName="Music"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0, // 去掉顶部边框
          elevation: 0, // Android 去掉阴影
          display: 'none', // 关键！彻底隐藏原生容器
        }
      }}
      // 绑定监听器到所有 Tab
      screenListeners={tabScreenListeners}
    >
      <Tab.Screen name="Translate" component={TranslateScreen} />
      <Tab.Screen name="Music" component={MusicStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  )
};

export default MainAppNavigator;
