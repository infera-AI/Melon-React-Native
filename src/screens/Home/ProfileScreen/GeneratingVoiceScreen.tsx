import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import LottieView from 'lottie-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const newSize = based === 'height' ? size * screenHeight / 812 : size * screenWidth / 375;
  return Math.round(newSize);
};

const normalizeFontSize = (size: number) => {
  const newSize = size * screenWidth / 375;
  return Math.min(Math.round(newSize), size);
};

type GeneratingVoiceScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'GeneratingVoice'>;

const GeneratingVoiceScreen: React.FC = () => {
  const navigation = useNavigation<GeneratingVoiceScreenNavigationProp>();
  const navigationRef = useRef(navigation);
  navigationRef.current = navigation;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 模拟进度更新
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 5 + 3;
        if (newProgress >= 100) {
          // 进度完成后导航到下一个页面
          setTimeout(() => {
            // navigationRef.current.navigate('LanguageVoice');
          }, 1000);
          return 100;
        }
        return newProgress;
      });
    }, 500);

    return () => {
      clearInterval(progressInterval);
    };
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
     <ScrollView>
       {/* 背景图片 */}
       <Image 
        source={require('../../../assets/profile/profile_generate_bg.png')} 
        style={styles.backgroundImage} 
      />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image 
            source={require('../../../assets/main/page_return_icon.png')} 
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Create your own voice</Text>
        <View style={styles.headerSpacer} />
      </View>

       {/* 动画容器 */}
       <View style={styles.animationContainer}>
        <LottieView
          source={require('../../../assets/lottie/generate_voice.json')}
          style={styles.lottieAnimation}
          autoPlay
          loop
          speed={1}
        />
      </View>

      {/* 进度百分比 */}
      <Text style={styles.progressText}>{Math.round(progress)}%</Text>

      {/* 状态文本 */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Your exclusive tone is being generated…
        </Text>
      </View>
     </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
    paddingHorizontal: normalize(24),
  },
  backgroundImage: {
    position: 'absolute',
    top: normalize(0),
    left: normalize(-224),
    width: normalize(831),
    height: normalize(747),
    backgroundColor: 'transparent',
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
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: normalize(400),
    marginTop: normalize(50),
  },
  lottieAnimation: {
    width: normalize(517),
    height: normalize(517),
  },
  progressText: {
    fontSize: normalizeFontSize(25),
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: normalize(100),
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: normalize(20),
  },
  statusText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.5,
    lineHeight: normalize(20),
  },
});

export default GeneratingVoiceScreen; 