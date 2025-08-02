import { useEffect, useState } from 'react'
import { View, TouchableOpacity, Image, StyleSheet, Keyboard } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const tabMenuData: any = {
  Translate: {
    activeImg: require('../../../assets/images/home_Tab_Translate_active.png'),
    normalImg: require('../../../assets/images/home_Tab_Translate_normal.png')
  },
  Music: {
    activeImg: require('../../../assets/images/home_Tab_Music_active.png'),
    normalImg: require('../../../assets/images/home_Tab_Music_normal.png')
  },
  Profile: {
    activeImg: require('../../../assets/images/home_Tab_Profile_active.png'),
    normalImg: require('../../../assets/images/home_Tab_Profile_normal.png')
  },
}

const CustomTabBar = ({
    state,
    descriptors,
    navigation
}: BottomTabBarProps) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false)
  const insets = useSafeAreaInsets(); // 获取安全区域距离
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true)
    })
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false)
    })

    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  // 隐藏 tabBar: 1. 键盘弹出时 2. Music tab下的HummingMusic页面
  if (isKeyboardVisible) return null;

  // 检查是否在Music tab下的HummingMusic页面
  const currentRoute = state.routes[state.index];
  // 需要隐藏tabBar的Music子页面
  const HIDE_TABBAR_SCREENS = ['HummingMusic', 'MusicEdit'];
  if (
    currentRoute.name === 'Music' &&
    currentRoute.state &&
    currentRoute.state.routes &&
    HIDE_TABBAR_SCREENS.includes(
      currentRoute.state.routes[currentRoute.state.index || 0]?.name
    )
  ) {
    return null;
  }

  return (
    <View style={styles.outContainer}>
      <View
        style={[
          styles.container,
          {
            marginBottom: insets.bottom > 0 ? insets.bottom : 16
          }
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const routeName = route.name

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[
                styles.tab,
              ]}
            >
              <Image
                source={
                  isFocused ? tabMenuData[routeName].activeImg : tabMenuData[routeName].normalImg
                }
                style={styles.menuImg}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const menuImgSize = 28
const containerPaddLR = 38

const styles = EStyleSheet.create({
  outContainer: {
    backgroundColor: '#181819',
  },
  container: {
    width: '100% - 32',
    marginTop: 16,
    marginLeft: 16,
    flexDirection: 'row',
    height: 56,
    backgroundColor: '#262626',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: containerPaddLR,
    paddingRight: containerPaddLR,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuImg: {
    width: menuImgSize,
    height: menuImgSize,
    resizeMode: 'contain',
  },
});

export default CustomTabBar;
