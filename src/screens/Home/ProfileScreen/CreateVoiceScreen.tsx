import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  ScrollView,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../../../utils/theme';
import { getVoiceprintDemoConfig } from '../../../api/profile';
import { useVoiceStore } from '@/store';
import { VoiceType } from '@/store/modules/voice.store';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const newSize = based === 'height' ? size * screenHeight / 812 : size * screenWidth / 375;
  return Math.round(newSize);
};

const normalizeFontSize = (size: number) => {
  const newSize = size * screenWidth / 375;
  return Math.min(Math.round(newSize), size);
};

const langs={
  zh:'中文简体',
  en:'English',
  ja:'日语',
  de:'德语',
  fr:'法语',
  es:'西班牙语',
}

type CreateVoiceScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'CreateVoice'>;

const CreateVoiceScreen: React.FC = () => {
  const navigation = useNavigation<CreateVoiceScreenNavigationProp>();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [languageList, setLanguageList] = useState<any[]>([]);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  // 动画值 - 根据Figma设计稿的三个椭圆
  const outerAnim = useRef(new Animated.Value(1)).current;
  const middleAnim = useRef(new Animated.Value(1)).current;
  const innerAnim = useRef(new Animated.Value(1)).current;

  // 页面加载时启动动画
  useEffect(() => {
    getLanguageListRequest();
    // 启动动画
    const outerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(outerAnim, {
          toValue: 1.2,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(outerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    
    const middleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(middleAnim, {
          toValue: 1.15,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(middleAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );  
    
    const innerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(innerAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(innerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    // 错开动画开始时间，创造层次感
    setTimeout(() => outerAnimation.start(), 0);
    setTimeout(() => middleAnimation.start(), 500);
    setTimeout(() => innerAnimation.start(), 1000);

    // 清理动画
    return () => {
      outerAnim.stopAnimation();
      middleAnim.stopAnimation();
      innerAnim.stopAnimation();
    };
  }, [outerAnim, middleAnim, innerAnim]);

  useEffect(() => {
    useVoiceStore.getState().setLocal(selectedLanguage);
  }, [selectedLanguage]);

  const getLanguageListRequest = async () => {
    try{
      const res = await getVoiceprintDemoConfig();
      setLanguageList(res.supported_languages);
      setSelectedLanguage(res.supported_languages?.[0]);

    }catch(error){
      console.log(error);
    }
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const handleStartRecording = () => {
    // 导航到录音页面
    navigation.navigate('Recording',{locale: selectedLanguage});
  };

  const handleLanguageToggle = () => {
    setShowLanguageModal(true);
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    setShowLanguageModal(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image 
            source={require('../../../assets/main/page_return_icon.png')} 
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{useVoiceStore.getState().type === VoiceType.CREATE ? 'Create your own voice' : 'Voiceprint optimization'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* 主要内容区域 */}
      <View style={styles.content}>
        {/* 说明文字 */}
        <View style={styles.descriptionContainer}>
         {/* Timer动画显示 */}
        <View style={styles.recordingContainer}>
          <View style={styles.recordingAnimation}>
             {/* Timer动画圆圈 - 使用timer图标 */}
             <Animated.View style={styles.recordingCircle}>
               <Animated.View 
                 style={[
                   styles.timerIconContainer,
                   {
                     transform: [{ scale: outerAnim }]
                   }
                 ]} 
               >
                 <Image 
                   source={require('../../../assets/profile/timer_create_icon1.png')} 
                   style={styles.timerIcon}
                 />
               </Animated.View>
               <Animated.View 
                 style={[
                   styles.timerIconContainer,
                   {
                     transform: [{ scale: middleAnim }]
                   }
                 ]} 
               >
                 <Image 
                   source={require('../../../assets/profile/timer_create_icon2.png')} 
                   style={styles.timerIcon}
                 />
               </Animated.View>
               <Animated.View 
                 style={[
                   styles.timerIconContainer,
                   {
                     transform: [{ scale: innerAnim }]
                   }
                 ]} 
               >
                 <Image 
                   source={require('../../../assets/profile/timer_create_icon3.png')} 
                   style={styles.timerIcon}
                 />
               </Animated.View>
               {/* 中间的voice图标 */}
               <View style={styles.centerVoiceIcon}>
                 <Image 
                   source={require('../../../assets/profile/timer_create_voice.png')} 
                   style={styles.voiceIconCenter}
                 />
               </View>
             </Animated.View>
          </View>
        </View>
          <Text style={styles.descriptionText}>
            Personalize your voice for more natural translations.
          </Text>
        </View>

        {/* 录音指导 */}
        <Text style={styles.guidanceTitle}>
          To accurately clone your voice color, please:
        </Text>

        <View style={styles.guidanceContainer}>
          <Image 
            source={require('../../../assets/profile/profile_unvoice_icon.png')} 
            style={styles.guidanceImage}
          />
          <Text style={styles.guidanceText}> Conduct the recording in a <Text style={styles.guidanceTextColor}>quiet environment</Text> to avoid background noise interference.</Text>
        </View>

        <View style={styles.guidanceContainer}>
          <Image 
            source={require('../../../assets/profile/profile_record_icon.png')} 
            style={styles.guidanceImage}
          />
          <Text style={styles.guidanceText}>Read the text on the screen with your <Text style={styles.guidanceTextColor}>natural, clear speaking speed and volume.</Text></Text>
        </View>

        <View style={styles.guidanceContainer}>
          <Image 
            source={require('../../../assets/profile/profile_unrecord_icon.png')} 
            style={styles.guidanceImage}
          />
          <Text style={styles.guidanceText}>Face the phone's microphone <Text style={styles.guidanceTextColor}>directly at you</Text> and maintain a distance of 15 - 20 centimeters.</Text>
        </View>


        {/* 录音语言选择器 */}
        <TouchableOpacity style={styles.languageSelector} onPress={handleLanguageToggle}>
          <View style={styles.languageContainer}>
            <Image 
              source={require('../../../assets/main/language_icon.png')} 
              style={styles.voiceIcon}
            />
            <Text style={styles.languageText}>{langs[selectedLanguage as keyof typeof langs]}</Text>
            <Image 
              source={require('../../../assets/main/dropdown_icon.png')} 
              style={styles.arrowIcon}
            />
          </View>
        </TouchableOpacity>

        

        {/* 底部按钮 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.startButton} onPress={handleStartRecording}>
            <Text style={styles.startButtonText}>I'm ready, let's start recording</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.bottomText}>Not recording for now, will record later in settings.</Text>

      </View>
      </ScrollView>

      {/* 语言选择弹窗 */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>选择录音语言</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.languageList}>
              {languageList?.map((language: any, index: number) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.languageOption} 
                  onPress={() => handleLanguageSelect(language)}
                >
                  <Text style={styles.languageOptionText}>{langs[language as keyof typeof langs]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    paddingHorizontal: normalize(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(10),
    marginBottom: normalize(16),
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
  content: {
    flex: 1,
    paddingTop: normalize(20),
  },
  descriptionContainer: {
    alignItems: 'center',
    marginBottom: normalize(32),
  },
  descriptionText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#B0B0B0',
    textAlign: 'center',
    lineHeight: normalize(20),
    letterSpacing: -0.4,
  },
  guidanceTitle: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: normalize(12),
    lineHeight: normalize(20),
  },
     guidanceContainer: {
     flexDirection: 'row',
     alignItems: 'flex-start',
     gap: normalize(12),
     marginBottom: normalize(16),
   },
   guidanceImage: {
     width: normalize(24),
     height: normalize(24),
     marginTop: normalize(2),
   },
   guidanceText: {
     fontSize: normalizeFontSize(14),
     fontWeight: '400',
     color: '#B0B0B0',
     lineHeight: normalize(20),
     flex: 1,
   },
   guidanceTextColor: {
    color: theme.primary,
   },
  languageSelector: {
    marginHorizontal:normalize(44),
    width: normalize(244),
    marginBottom: normalize(100),
    marginTop: normalize(26),
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    padding: normalize(16),
    borderWidth: 1,
    borderColor: '#85F380',
  },
  voiceIcon: {
    width: normalize(20),
    height: normalize(20),
    marginRight: normalize(8),
  },
  languageText: {
    flex: 1,
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  arrowIcon: {
    width: normalize(10.67),
    height: normalize(6),
  },
  recordingContainer: {
    alignItems: 'center',
  },
  recordingAnimation: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingCircle: {
    width: normalize(153.6),
    height: normalize(153.6),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#708A6F',
    shadowOffset: {
      width: 0,
      height: normalize(3.4),
    },
    shadowOpacity: 1,
    shadowRadius: normalize(23),
    elevation: 8,
  },
  timerIconContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
     timerIcon: {
     width: normalize(110),
     height: normalize(110),
     resizeMode: 'contain',
   },
   centerVoiceIcon: {
     position: 'absolute',
     alignItems: 'center',
     justifyContent: 'center',
     zIndex: 10,
   },
   voiceIconCenter: {
     width: normalize(60),
     height: normalize(60),
     resizeMode: 'contain',
   },
  buttonContainer: {
    position: 'absolute',
    bottom: normalize(20),
    left: 0,
    right: 0,
  },
  bottomText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: theme.primary,
    textAlign: 'center',
    lineHeight: normalize(20),
  },
  startButton: {
    backgroundColor: '#85F380',
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: 'rgba(12, 12, 13, 0.7)',
    letterSpacing: -0.4,
  },
  recordingText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: '#85F380',
    textAlign: 'center',
    lineHeight: normalize(21),
    letterSpacing: -0.4,
  },
  recordingControls: {
    alignItems: 'center',
    gap: normalize(16),
  },
  stopButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  // 弹窗样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    width: normalize(300),
    maxHeight: normalize(400),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalClose: {
    fontSize: normalizeFontSize(18),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  languageList: {
    maxHeight: normalize(300),
  },
  languageOption: {
    padding: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  languageOptionText: {
    fontSize: normalizeFontSize(14),
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default CreateVoiceScreen; 