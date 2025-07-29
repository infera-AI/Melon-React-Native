import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
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

type HelpFeedbackScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'HelpFeedback'>;

const HelpFeedbackScreen: React.FC = () => {
  const navigation = useNavigation<HelpFeedbackScreenNavigationProp>();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleTranslationHelp = () => {
    // 导航到翻译功能帮助页面
    console.log('Navigate to translation help');
  };

  const handleVoiceprintHelp = () => {
    // 导航到语音设置帮助页面
    console.log('Navigate to voiceprint help');
  };

  const handleAccountSecurityHelp = () => {
    // 导航到产品反馈页面
    navigation.navigate('ProductFeedback');
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
          <Text style={styles.title}>Help and feedback</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* FAQ Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>FAQ</Text>
        </View>

        {/* Translation Function Help */}
        <TouchableOpacity style={styles.helpCard} onPress={handleTranslationHelp}>
          <View style={styles.helpContent}>
            <View style={styles.helpLeft}>
              <Image 
                source={require('../../../assets/profile/profile_feedback_translate.png')} 
                style={styles.helpIcon}
              />
              <View style={styles.helpTextContainer}>
                <Text style={styles.helpTitle}>Using the translation function</Text>
                <Text style={styles.helpDescription}>Graphic description</Text>
              </View>
            </View>
            <View style={styles.helpRight}>
              <Image 
                source={require('../../../assets/main/right_arrow_icon.png')} 
                style={styles.arrowIcon}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Voiceprint Settings Help */}
        <TouchableOpacity style={styles.helpCard} onPress={handleVoiceprintHelp}>
          <View style={styles.helpContent}>
            <View style={styles.helpLeft}>
                             <Image 
                 source={require('../../../assets/profile/profile_voice_setting.png')} 
                 style={styles.helpIcon}
               />
              <View style={styles.helpTextContainer}>
                <Text style={styles.helpTitle}>Voiceprint settings</Text>
                <Text style={styles.helpDescription}>Graphic description</Text>
              </View>
            </View>
            <View style={styles.helpRight}>
              <Image 
                source={require('../../../assets/main/right_arrow_icon.png')} 
                style={styles.arrowIcon}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Account and Security Help */}
        <TouchableOpacity style={styles.helpCard} onPress={handleAccountSecurityHelp}>
          <View style={styles.helpContent}>
            <View style={styles.helpLeft}>
              <Image 
                 source={require('../../../assets/profile/profile_security_icon.png')} 
                 style={styles.helpIcon}
               />
              <View style={styles.helpTextContainer}>
                <Text style={styles.helpTitle}>Account and security</Text>
                <Text style={styles.helpDescription}>Graphic description</Text>
              </View>
            </View>
            <View style={styles.helpRight}>
              <Image 
                source={require('../../../assets/main/right_arrow_icon.png')} 
                style={styles.arrowIcon}
              />
            </View>
          </View>
        </TouchableOpacity>
        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleAccountSecurityHelp}>
          <Text style={styles.submitButtonText}>Product feedback</Text>
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
  sectionContainer: {
    paddingHorizontal: normalize(24),
    marginBottom: normalize(16),
  },
  sectionTitle: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  helpCard: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    marginHorizontal: normalize(24),
    marginBottom: normalize(16),
    padding: normalize(16),
  },
  helpContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  helpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  helpIcon: {
    width: normalize(20),
    height: normalize(18),
    marginRight: normalize(12),
  },
  helpTextContainer: {
    flex: 1,
  },
  helpTitle: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: 0.25,
    marginBottom: normalize(4),
  },
  helpDescription: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: '#B0B0B0',
    letterSpacing: -0.4,
  },
  helpRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    width: normalize(20),
    height: normalize(20),
  },
  submitButton: {
    width: normalize(327),
    height: normalize(48),
    backgroundColor: '#85F380',
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    marginHorizontal: normalize(24),
    alignItems: 'center',
    marginTop: normalize(50),
    
  },
  submitButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: 'rgba(12, 12, 13, 0.7)',
    letterSpacing: -0.4,
  },
});

export default HelpFeedbackScreen; 