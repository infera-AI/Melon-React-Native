import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import { useUserStore } from '../../../store';
import theme from '../../../utils/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';
import { getUserInfo, getInvitationCode } from '../../../api/profile/profile';
import { useLanguage } from '../../../contexts/LanguageContext';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import CommonModal from '@/components/CommonModal';
import { useBackHandler } from '@/utils/BackHandlerUtil'; // 导入工具类
import Clipboard from '@react-native-clipboard/clipboard';
import { useMessageModal } from '@/contexts/MessageModalContext';
import { usePointsStore } from '@/store/modules/points.store';

type ProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

const ProfileScreen: React.FC = () => {
  useBackHandler('再按一次退出')
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const userInfo = useUserStore((state) => state.userInfo);
  const token = useUserStore((state) => state.token);
  const { t } = useLanguage();
  const [showInvitationModal, setShowInvitationModal] = useState(false);
  const { show } = useMessageModal();
  const pointsBalance = usePointsStore((state) => state.pointsBalance);
  const refreshPointsBalance = usePointsStore((state) => state.refreshPointsBalance);
  const [inviteCode, setInViteCode] = useState("")
  const menuItems = [
    {
      id: 'my_points',
      title: 'My Points',
      icon: require('@/assets/profile/menu_points_icon.png'),
      hasArrow: true,
      hasIcon: true,
    },
    // {
    //   id: 'invitation_code',
    //   title: 'Invitation code',
    //   icon: require('@/assets/profile/menu_invitationcode_icon.png'),
    //   hasArrow: true,
    //   hasIcon: true,
    // },
    {
      id: 'ai_voiceprint',
      title: t('profile.ai_voiceprint_management'),
      icon: require('@/assets/profile/profile_voice_icon.png'),
      hasArrow: true,
      hasIcon: true,
    },
    {
      id: 'offline_voice_package',
      title: 'Offline voice package',
      icon: require('@/assets/profile/menu_offlinelanguage_icon.png'),
      hasArrow: true,
      hasIcon: true,
    },
    {
      id: 'account_security',
      title: t('profile.account_and_security'),
      icon: require('@/assets/profile/profile_security_icon.png'),
      hasArrow: true,
    },
    {
      id: 'language_selection',
      title: t('general_settings.system_language_selection'),
      icon: require('@/assets/profile/profile_setting_language.png'),
      hasArrow: true,
    },
    // {
    //   id: 'help_feedback',
    //   title: t('profile.help_and_feedback'),
    //   icon:require('@/assets/profile/profile_help_icon.png'),
    //   hasArrow: true,
    // },
    {
      id: 'about_melon',
      title: t('profile.about_melon'),
      icon: require('@/assets/profile/profile_about_icon.png'),
      hasArrow: true,
    },
  ];

  const handleMenuItemPress = (itemId: string) => {
    console.log('Menu item pressed:', itemId);
    // 这里可以添加导航逻辑
    switch (itemId) {
      case 'ai_voiceprint':
        navigation.navigate('VoiceprintManagementList' as any);
        break;
      case 'language_selection':
        navigation.navigate('SystemLanguage');
        break;
      case 'account_security':
        navigation.navigate('AccountSecurity');
        break;
      case 'help_feedback':
        navigation.navigate('HelpFeedback');
        break;
      case 'about_melon':
        navigation.navigate('About');
        break;
      case 'my_points':
        navigation.navigate('MyPoints');
        break;
      case 'invitation_code':
        setShowInvitationModal(true);
        break;
      case 'offline_voice_package':
        navigation.navigate('OfflineVoicePackage' as any);
        break;
      // case 'about_melon':
      default:
        console.log('Menu item not implemented yet:', itemId);
        break;
    }
  };

  const handleEditProfile = () => {
    // 导航到编辑个人资料页面
    navigation.navigate('EditProfile');
  };

  //获取邀请码
  const getInvitationCodeRequest = async () => {
    const response = await getInvitationCode();
    setInViteCode(response.invitation_code);
    console.log('Invitation code', response);
  }

  // 邀请码弹窗配置
  const invitationModalConfig = {
    title: 'Invitation Code',
    content: inviteCode,
    buttons: [
      {
        text: 'Cancle',
        onPress: () => {
          console.log('Cancel pressed');
        },
        type: 'secondary' as const,
      },
      {
        text: 'Copy',
        onPress: () => {
          // 这里可以添加复制到剪贴板的功能
          handleInvitationCode();
        },
        type: 'primary' as const,
      },
    ],
  };
  const getUserInfoRequest = async () => {
    const info: any = await getUserInfo({});
    console.log('UserInfo', info);
    if (info) {
      useUserStore.getState().setUserInfo({
        id: info.id,
        username: info.username,
        avatar_url: info.avatar_url,
        email: info.email,
      });
    }
  }

  //复制邀请码
  const handleInvitationCode = () => {
    Clipboard.setString(inviteCode || '');
    show({
      message: "Copy Success!",
    });
    console.log('Copy invitation code');
  }

  useEffect(() => {
    if (!token) {
      navigation.replace('Auth' as any);
    } else {
      getUserInfoRequest();
      getInvitationCodeRequest();
      refreshPointsBalance();
    }
  }, [token, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />

      {/* 用户信息卡片 */}
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          <Image source={userInfo?.avatar_url ? { uri: userInfo?.avatar_url } : require('../../../assets/profile/profile_default_avatar.png')} style={styles.avatarContainer} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{`Melon(${userInfo?.username || 'name'})`}</Text>
            <Text style={styles.userId}>{t('profile.melon_id')}: {userInfo?.id || ''}</Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Image source={require('../../../assets/main/right_arrow_icon.png')} style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.invitationCodeContainer}>
        <Text style={styles.invitationCodeText} onPress={() => setShowInvitationModal(true)} ellipsizeMode="middle" numberOfLines={1}>Invitation code: {inviteCode}</Text>
        <TouchableOpacity style={styles.invitationCodeCopyButton} onPress={handleInvitationCode}>
          <Image source={require('@/assets/main/copy_icon.png')} style={styles.arrowIcon} />
        </TouchableOpacity>
      </View>

      {/* 功能菜单 */}
      <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
        {menuItems.slice(0, 3).map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, index === 0 && styles.menuItemFirst, index === 2 && styles.menuItemLast]}
            onPress={() => handleMenuItemPress(item.id)}
          >
            <View style={styles.menuItemLeft}>
              <Image source={item.icon} style={styles.menuIcon} />
              <Text style={styles.menuTitle}>{item.title}</Text>
            </View>
            <Text style={styles.menuItemPoints}>{item.id === 'my_points' ? pointsBalance : ''}</Text>
            {item.hasArrow && (
              <View style={styles.arrowContainer}>
                <Image source={require('../../../assets/main/right_arrow_icon.png')} style={styles.arrowIcon} />
              </View>
            )}
          </TouchableOpacity>
        ))}

        {/* 其他菜单项 */}
        {menuItems.slice(3).map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, index === 0 && styles.menuItemFirst, index === 2 && styles.menuItemLast]}
            onPress={() => handleMenuItemPress(item.id)}
          >
            <View style={styles.menuItemLeft}>
              <Image source={item.icon} style={styles.menuIcon} />
              <Text style={styles.menuTitle}>{item.title}</Text>
            </View>
            {item.hasArrow && (
              <View style={styles.arrowContainer}>
                <Image source={require('../../../assets/main/right_arrow_icon.png')} style={styles.arrowIcon} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 邀请码弹窗 */}
      <CommonModal
        visible={showInvitationModal}
        onClose={() => setShowInvitationModal(false)}
        config={invitationModalConfig}
      />

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
    paddingHorizontal: normalize(24),
  },
  userCard: {
    width: "100%",
    height: normalize(108),
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    padding: normalize(18),
    marginTop: normalize(72),
    marginBottom: normalize(17),
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: normalize(70),
    height: normalize(70),
    borderRadius: normalize(35),
    overflow: 'hidden',
    marginRight: normalize(16),
  },
  avatar: {
    width: normalize(20),
    height: normalize(20),
    borderRadius: normalize(35),
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: normalize(35),
    backgroundColor: '#85F380',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: normalizeFontSize(24),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: normalizeFontSize(20),
    fontWeight: '600',
    color: '#F5F5F5',
    marginBottom: normalize(8),
  },
  userId: {
    fontSize: normalizeFontSize(12),
    color: '#B3B3B3',
    fontWeight: '400',
  },
  editButton: {
    width: normalize(24),
    height: normalize(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: normalizeFontSize(18),
    color: '#4F4F4F',
    fontWeight: 'bold',
  },
  menuContainer: {
    flex: 1,
  },
  menuCard: {
    width: "100%",
    height: normalize(52),
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    marginBottom: normalize(16),
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: normalize(16),
    paddingHorizontal: normalize(16),
    backgroundColor: '#262626',
    // borderRadius: normalize(12),
    // marginBottom: normalize(8),
  },
  menuItemFirst: {
    borderTopLeftRadius: normalize(12),
    borderTopRightRadius: normalize(12),
  },
  menuItemLast: {
    borderBottomLeftRadius: normalize(12),
    borderBottomRightRadius: normalize(12),
    marginBottom: normalize(16),
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: normalize(20),
    height: normalize(20),
    marginRight: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    width: normalize(20),
    height: normalize(20),
    marginRight: normalize(12),
  },
  menuTitle: {
    fontSize: normalizeFontSize(14),
    color: '#FFFFFF',
    fontWeight: '400',
    letterSpacing: 0.25,
  },
  arrowContainer: {
    width: normalize(24),
    height: normalize(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    width: normalize(20),
    height: normalize(20),
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    paddingVertical: normalize(16),
    paddingHorizontal: normalize(24),
    marginBottom: normalize(16),
    justifyContent: 'space-around',
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: normalize(60),
    height: normalize(24),
  },
  navIcon: {
    fontSize: normalizeFontSize(20),
    color: '#494949',
  },
  activeNavIcon: {
    color: '#85F380',
  },
  invitationCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(15),
  },
  invitationCodeText: {
    width: "80%",
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: theme.textPrimary,
    letterSpacing: 1,
  },
  invitationCodeCopyButton: {
    width: normalize(22),
    height: normalize(22),
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemPoints: {
    fontSize: normalizeFontSize(14),
    color: theme.textPrimary,
    fontWeight: '400',
  },
});

export default ProfileScreen;
