import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';
import { useVoiceStore } from '@/store';
import { generateVoiceId, getVoiceprintDemoConfig, synthesizeSpeech, translateText } from '@/api/profile';
import Sound from 'react-native-sound';
import FullScreenLoader from '@/components/FullScreenLoader';
import { useMessageModal } from '@/contexts/MessageModalContext';
import { useLanguage } from '../../../contexts/LanguageContext';

const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const { width, height } = require('react-native').Dimensions.get('window');
  const scale = based === 'width' ? width / 375 : height / 812;
  return Math.round(size * scale);
};

const normalizeFontSize = (size: number) => {
  return normalize(size, 'width');
};

type LanguageVoiceScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'LanguageVoice'>;

const testTexContent = 'Hello World!\nGlad that I can communicate with you in your voice';

const LanguageVoiceScreen: React.FC = () => {
  const navigation = useNavigation<LanguageVoiceScreenNavigationProp>();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [languageList, setLanguageList] = useState<any[]>([]);
  const [sound, setSound] = useState<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [testText, setTestText] = useState<string>(testTexContent);
  const [loading, setLoading] = useState<boolean>(false);
  const { show } = useMessageModal(); 
  const { t } = useLanguage();

  const languages={
    zh:{name:'Chinese',flag: require('../../../../assets/images/flag_cn.png')},
    en:{name:'English',flag: require('../../../../assets/images/flag_usuk.png')},
    ja:{name:'Japanese',flag: require('../../../../assets/images/flag_jp.png')},
    de:{name:'Deutsch',flag: require('../../../../assets/images/flag_de.png')},
    fr:{name:'Francasis',flag: require('../../../../assets/images/flag_fr.png')},
    es:{name:'Espanol',flag: require('../../../../assets/images/flag_es.png')},
  }

  const handleBack = () => {
    navigation.goBack();
  };

   const generateVoiceIdRequest = async () => {
    const recordFile = useVoiceStore.getState().recordVoiceFile;
      console.log(recordFile,'recordFile')
      try {
        const res = await generateVoiceId({ 
          audio_file: recordFile,
        });
        console.log(res,'res')
        show({message: t('language_voice.voice_id_generated_successfully')});
        useVoiceStore.getState().setVoiceFile({
          uri: '',
          type: '',
          name: '',
        });
        useVoiceStore.getState().setLocal("");
        navigation.navigate('ProfileMain');
      } catch (error) {
        show({message: t('language_voice.failed_to_generate_voice_id')});
        console.log(error,'error')
      }
    }

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
    translateTextRequest(language);
  };

  const handleRecordAgain = () => {
    useVoiceStore.getState().setVoiceFile({
      uri: '',
      type: '',
      name: '',
    });
    useVoiceStore.getState().setLocal("");
    // 重新录音逻辑
    navigation.navigate('CreateVoice');
  };

  // 翻译文本
  const translateTextRequest = async (language: string) => {
    try{
      const res = await translateText({
        format_type: 'text',
        source_language: 'en',
        source_text: testTexContent,
        target_language: language,
      });
        console.log(res,res.Translated  )
      setTestText(res.Translated);
      getAudioUrlRequest(res.Translated);
    }catch(error){
      console.log(error);
    }
  }

  // 获取音频
  const getAudioUrlRequest = async (text: string) => {
    setLoading(true);
    try{
      const res = await synthesizeSpeech({
        text: text,
      });
      handlePlayAudio(res.audio_url);
    }catch(error){  
      console.log(error);
    }finally{
      setLoading(false);
    }
  }

  // 播放音频
  const handlePlayAudio = (audioUrl: string) => {
    if (!audioUrl) {
      // show({message: 'No audio available'});
      show({message: t('language_voice.no_audio_available')});
      return;
    }

    // 停止当前播放的音频
    if (sound) {
      sound.stop();
      sound.release();
    }

    // 创建新的音频实例
    const newSound = new Sound(audioUrl, Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.log('Failed to load audio:', error);
        show({message: t('language_voice.failed_to_load_audio')});  
        return;
      }

      // 音频加载成功，开始播放
      newSound.play((success) => {
        if (success) {
          console.log('Audio played successfully');
        } else {
          console.log('Audio playback failed');
        }
        setIsPlaying(false);
        newSound.release();
      });

      setIsPlaying(true);
    });

    setSound(newSound);
  };

  const handleDone = () => {
    // 完成逻辑
    // generateVoiceIdRequest();
    // navigation.navigate('GeneratingVoice');
    useVoiceStore.getState().setVoiceFile({
      uri: '',
      type: '',
      name: '',
    });
    useVoiceStore.getState().setLocal("");
    navigation.navigate('ProfileMain');
  };

  useEffect(() => {
    const getLanguageListRequest = async () => {
      try{
        const res = await getVoiceprintDemoConfig();
        setLanguageList(res.supported_languages);
        setSelectedLanguage(res.supported_languages?.[0]);
        setTestText(res.demo_text);
        getAudioUrlRequest(res.demo_text);

      }catch(error){
        console.log(error);
      }
    }
    getLanguageListRequest();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        {/* <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image 
            source={require('../../../assets/main/page_return_icon.png')} 
            style={styles.backIcon}
          />
        </TouchableOpacity> */}
        <View style={styles.headerSpacer} />
        <View style={styles.headerSpacer} />
      </View>

      {/* 标题 */}
      <Text style={styles.title}>{t('language_voice.generate_your_own_voice')}</Text>

      {/* 主要内容 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 示例文本 */}
        <View style={styles.sampleTextContainer}>
          <Text style={styles.sampleText}>
            {testText}
          </Text>
        </View>

        {/* 语言选择网格 */}
        <View style={styles.languageGrid}>
          {languageList.slice(0, 3).map((language) => (
            <TouchableOpacity
              key={language}
              disabled={isPlaying}
              style={[
                styles.languageCard,
                selectedLanguage === language && styles.languageCardSelected
              ]}
              onPress={() => handleLanguageSelect(language)}
            >
              <Image source={languages[language as keyof typeof languages].flag as any} style={styles.languageFlag} />
              <Text style={styles.languageName}>{languages[language as keyof typeof languages].name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 提示文本 */}
        <Text style={styles.hintText}>{t('language_voice.click_to_test_different_language')}</Text>
      </ScrollView>

      {/* 底部按钮 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.recordAgainButton} onPress={handleRecordAgain}>
          <Text style={styles.recordAgainText}>{t('language_voice.record_again')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
          <Text style={styles.doneText}>{t('language_voice.done')}</Text>
        </TouchableOpacity>
      </View>
      <FullScreenLoader
        visible={loading}
        text={t('language_voice.please_wait')}
        timeout={5000}
        onTimeout={() => setLoading(false)}
      />
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
    fontSize: normalizeFontSize(22),
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: normalize(20),
  },
  content: {
    flex: 1,
  },
  sampleTextContainer: {
    alignItems: 'center',
    marginBottom: normalize(20),
  },
  sampleText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: normalize(20),
  },
  languageGrid: {
    flexDirection: 'row',
    gap: normalize(12),
    marginBottom: normalize(12),
  },
  languageCard: {
    flex: 1,
    height: normalize(120),
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
    padding: normalize(20),
  },
  languageCardSelected: {
    borderWidth: normalize(3),
    borderColor: '#87ED89',
  },
  languageFlag: {
    width: normalize(70),
    height: normalize(70),
    borderRadius: normalize(35),
    marginBottom: normalize(8),
    resizeMode: 'cover',
  },
  languageName: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  hintText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#B0B0B0',
    textAlign: 'center',
    marginBottom: normalize(20),
  },
  buttonContainer: {
    gap: normalize(12),
    marginBottom: normalize(20),
  },
  recordAgainButton: {
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    alignItems: 'center',
  },
  recordAgainText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: '#FFFFFF',
  },
  doneButton: {
    backgroundColor: '#85F380',
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    alignItems: 'center',
  },
  doneText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: 'rgba(12, 12, 13, 0.7)',
  },
});

export default LanguageVoiceScreen; 