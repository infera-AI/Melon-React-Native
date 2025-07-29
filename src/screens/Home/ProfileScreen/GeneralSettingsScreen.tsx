import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';


const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const { width, height } = require('react-native').Dimensions.get('window');
  const scale = based === 'width' ? width / 375 : height / 812;
  return Math.round(size * scale);
};

const normalizeFontSize = (size: number) => {
  return normalize(size, 'width');
};

type GeneralSettingsScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'GeneralSettings'>;

const GeneralSettingsScreen: React.FC = () => {
  const navigation = useNavigation<GeneralSettingsScreenNavigationProp>();
  const [cacheSize, setCacheSize] = useState('366M');

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLanguageSelection = () => {
    // 导航到语言选择页面
    navigation.navigate('SystemLanguage');
  };

  const handleClearCache = () => {
    Alert.alert(
      '清除缓存',
      '确定要清除所有缓存数据吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '确定',
          style: 'destructive',
          onPress: () => {
            // 这里可以调用清除缓存的API
            setCacheSize('0M');
            Alert.alert('成功', '缓存已清除');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '删除账户',
      '此操作将永久删除您的账户，无法恢复。确定要继续吗？',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '删除',
          style: 'destructive',
          onPress: () => {
            navigation.navigate('DeregisterAccount');
          },
        },
      ]
    );
  };

  const handleHelpFeedback = () => {
    // 导航到帮助和反馈页面
    navigation.navigate('HelpFeedback');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image 
              source={require('../../../assets/main/page_return_icon.png')} 
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.title}>General settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* System Language Selection */}
        <TouchableOpacity style={styles.settingCard} onPress={handleLanguageSelection}>
          <View style={styles.settingContent}>
            <View style={styles.settingLeft}>
                             <Image 
                 source={require('../../../assets/profile/profile_setting_language.png')} 
                 style={styles.settingIcon}
               />
              <Text style={styles.settingTitle}>System language selection</Text>
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
        <View style={styles.settingCard}>
          <View style={styles.settingContent}>
            <View style={styles.settingLeft}>
                             <Image 
                 source={require('../../../assets/profile/profile_clear_icon.png')} 
                 style={styles.settingIcon}
               />
              <Text style={styles.settingTitle}>Clear the cache</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={styles.cacheSize}>{cacheSize}</Text>
              <TouchableOpacity onPress={handleClearCache}>
                 <Image 
                   source={require('../../../assets/profile/profile_clear_clear.png')} 
                   style={styles.deleteIcon}
                 />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.cacheDescription}>
            Temporary data generated during the use of cache will not affect the normal use of Melon.
          </Text>
                 </View>

         {/* Delete Account */}
         <TouchableOpacity style={styles.settingCard} onPress={handleDeleteAccount}>
           <View style={styles.settingContent}>
             <View style={styles.settingLeft}>
               <Image 
                 source={require('../../../assets/profile/profile_security_icon.png')} 
                 style={styles.settingIcon}
               />
               <Text style={[styles.settingTitle, styles.deleteAccountTitle]}>Delete account</Text>
             </View>
             <View style={styles.settingRight}>
               <Image 
                 source={require('../../../assets/main/right_arrow_icon.png')} 
                 style={styles.arrowIcon}
               />
             </View>
           </View>
                   </TouchableOpacity>

          {/* Help and Feedback */}
          <TouchableOpacity style={styles.settingCard} onPress={handleHelpFeedback}>
            <View style={styles.settingContent}>
              <View style={styles.settingLeft}>
                <Image 
                  source={require('../../../assets/profile/profile_help_icon.png')} 
                  style={styles.settingIcon}
                />
                <Text style={styles.settingTitle}>Help and feedback</Text>
              </View>
              <View style={styles.settingRight}>
                <Image 
                  source={require('../../../assets/main/right_arrow_icon.png')} 
                  style={styles.arrowIcon}
                />
              </View>
            </View>
          </TouchableOpacity>
        </ScrollView>
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
});

export default GeneralSettingsScreen; 