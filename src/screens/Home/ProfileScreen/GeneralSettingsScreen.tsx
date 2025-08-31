import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';
import { useMessageModal } from '@/contexts/MessageModalContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeSelector } from '@/components/ThemeSelector';
import { useGlobalTheme } from '@/hooks/useGlobalTheme';

type GeneralSettingsScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'GeneralSettings'>;

export const GeneralSettingsScreen: React.FC = () => {
  const navigation = useNavigation<GeneralSettingsScreenNavigationProp>();
  const [cacheSize, setCacheSize] = useState('366M');
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const { show } = useMessageModal();
  const { t } = useLanguage();
  const { colors, themeMode } = useTheme();
  const { apply, applyItem, text, textSecondary } = useGlobalTheme();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLanguageSelection = () => {
    // 导航到语言选择页面
    navigation.navigate('SystemLanguage');
  };

  // 旋转动画效果
  useEffect(() => {
    if (showLoadingModal) {
      const startRotation = () => {
        rotateAnim.setValue(0);
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.linear,
        }).start(() => startRotation());
      };
      startRotation();
    } else {
      // 停止动画
      rotateAnim.stopAnimation();
    }
  }, [showLoadingModal, rotateAnim]);

  const handleClearCache = () => {
    // 显示加载弹窗
    setShowLoadingModal(true);

    // 模拟清除缓存的过程
    setTimeout(() => {
      setCacheSize('0M');
      setShowLoadingModal(false);
      show({ message: t('general_settings.cache_cleared_successfully') });
    }, 3000);
  };

  return (
    <SafeAreaView style={apply(styles.container)} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={applyItem(styles.backButton)} onPress={handleBack}>
            <Image
              source={require('../../../assets/main/page_return_icon.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={[styles.title, text]}>{t('general_settings.general_settings')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* System Language Selection */}
        <TouchableOpacity style={applyItem(styles.settingCard)} onPress={handleLanguageSelection}>
          <View style={styles.settingContent}>
            <View style={styles.settingLeft}>
              <Image
                source={require('../../../assets/profile/profile_setting_language.png')}
                style={styles.settingIcon}
              />
              <Text style={[styles.settingTitle, text]}>{t('general_settings.system_language_selection')}</Text>
            </View>
            <View style={styles.settingRight}>
              <Image
                source={require('../../../assets/main/right_arrow_icon.png')}
                style={styles.arrowIcon}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Clear Cache */}
        <View style={applyItem(styles.settingCard)}>
          <View style={styles.settingContent}>
            <View style={styles.settingLeft}>
              <Image
                source={require('../../../assets/profile/profile_clear_icon.png')}
                style={styles.settingIcon}
              />
              <Text style={[styles.settingTitle, text]}>{t('general_settings.clear_the_cache')}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.cacheSize, textSecondary]}>{cacheSize}</Text>
              <TouchableOpacity onPress={handleClearCache}>
                <Image
                  source={require('../../../assets/profile/profile_clear_clear.png')}
                  style={styles.deleteIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={[styles.cacheDescription, textSecondary]}>
            {t('general_settings.cache_description')}
          </Text>
        </View>

        {/* Theme and Language Settings */}
        {/* <View style={styles.section}>
          <ThemeSelector />
        </View> */}
      </ScrollView>

      {/* 清除缓存加载弹窗 */}
      <Modal
        visible={showLoadingModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLoadingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* 加载动画 */}
            <View style={styles.loadingContainer}>
              <Animated.View
                style={[
                  styles.rotatingCircle,
                  {
                    transform: [
                      {
                        rotate: rotateAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Image
                  source={require('../../../assets/profile/profile_clearloading_icon.png')}
                  style={styles.outerCircle}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>

            {/* 文本 */}
            <Text style={styles.loadingText}>{t('general_settings.cleaning_cache')}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(24),
    paddingTop: normalize(12),
    paddingBottom: normalize(20),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: normalize(16),
    height: normalize(16),
  },
  headerSpacer: {
    width: normalize(40),
  },
  title: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  settingCard: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    marginHorizontal: normalize(24),
    marginBottom: normalize(16),
    padding: normalize(16),
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: normalize(22),
    height: normalize(22),
    marginRight: normalize(12),
  },
  settingTitle: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: 0.25,
  },
  deleteAccountTitle: {
    color: '#FF6B6B',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowIcon: {
    width: normalize(20),
    height: normalize(20),
  },
  cacheSize: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: '#B0B0B0',
    marginRight: normalize(8),
    fontFamily: 'Roboto',
  },
  deleteIcon: {
    width: normalize(11),
    height: normalize(15),
  },
  cacheDescription: {
    fontSize: normalizeFontSize(14),
    fontWeight: '300',
    color: '#B0B0B0',
    marginTop: normalize(8),
    marginLeft: normalize(34),
    lineHeight: normalizeFontSize(16),
  },
  // 弹窗样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: normalize(327),
    height: normalize(162),
    backgroundColor: '#333333',
    borderRadius: normalize(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    width: normalize(56),
    height: normalize(56),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(16),
  },
  rotatingCircle: {
    position: 'absolute',
    width: normalize(56),
    height: normalize(56),
  },
  outerCircle: {
    width: normalize(56),
    height: normalize(56),
  },
  innerCircle: {
    position: 'absolute',
    width: normalize(8.4),
    height: normalize(8.4),
    borderRadius: normalize(4.2),
    backgroundColor: '#85F380',
    top: normalize(24.08),
    left: normalize(47.6),
  },
  loadingText: {
    fontSize: normalizeFontSize(17),
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: normalize(22),
    letterSpacing: -0.4,
  },
});

export default GeneralSettingsScreen; 