import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
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

type OptimizVoiceScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'OptimizVoice'>;

const OptimizVoiceScreen: React.FC = () => {
  const navigation = useNavigation<OptimizVoiceScreenNavigationProp>();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentPage, setCurrentPage] = useState(3);
  const totalPages = 20;
  
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const waveformAnimations = useRef<Animated.Value[]>([]);

  // 初始化波形动画
  useEffect(() => {
    waveformAnimations.current = Array.from({ length: 16 }, () => new Animated.Value(1));
  }, [waveformAnimations]);

  // 开始录音
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    
    // 开始计时
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);

    // 开始波形动画
    startWaveformAnimation();
  };

  // 停止录音
  const stopRecording = () => {
    setIsRecording(false);
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    // 停止波形动画
    stopWaveformAnimation();
  };

  // 波形动画
  const startWaveformAnimation = () => {
    const animations = waveformAnimations.current.map((anim, _index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: Math.random() * 0.5 + 0.5,
            duration: 200 + Math.random() * 300,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 200 + Math.random() * 300,
            useNativeDriver: false,
          }),
        ])
      );
    });

    animations.forEach((animation: Animated.CompositeAnimation) => animation.start());
  };

  const stopWaveformAnimation = () => {
    waveformAnimations.current.forEach(anim => {
      anim.stopAnimation();
      anim.setValue(1);
    });
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 上一页
  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // 下一页
  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView>
        {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image 
            source={require('../../../assets/main/page_return_icon.png')} 
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>Voiceprint optimization</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        <Text style={styles.contentText}>
          At present, we have not locked down the city inShanghai, and we don't have to lock down the city!now. So the current form of the epidemic inShanghai, we will depend on the regional risk.
        </Text>
      </View>

      {/* Page Navigation */}
      <View style={styles.pageNavigation}>
        <TouchableOpacity 
          style={[styles.navButton, currentPage === 1 && styles.navButtonDisabled]} 
          onPress={goToPrevious}
          disabled={currentPage === 1}
        >
          <Image 
            source={require('../../../assets/main/page_return_icon.png')} 
            style={styles.navIcon}
          />
        </TouchableOpacity>
        
        <Text style={styles.pageText}>{currentPage}/{totalPages}</Text>
        
        <TouchableOpacity 
          style={[styles.navButton, currentPage === totalPages && styles.navButtonDisabled]} 
          onPress={goToNext}
          disabled={currentPage === totalPages}
        >
          <Image 
            source={require('../../../assets/main/right_arrow_icon.png')} 
            style={styles.navIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Recording Controls */}
      <View style={styles.recordingSection}>
        {/* Recording Button */}
        <View style={styles.recordingButtonContainer}>
          <TouchableOpacity 
            style={[styles.recordingButton, isRecording && styles.recordingButtonActive]} 
            onPress={isRecording ? stopRecording : startRecording}
          >
            <View style={styles.recordingButtonInner} />
          </TouchableOpacity>
          <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
        </View>

        {/* Waveform */}
        <View style={styles.waveformContainer}>
          {Array.from({ length: 16 }, (_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.waveformBar,
                {
                  height: waveformAnimations.current[index]?.interpolate({
                    inputRange: [0.5, 1],
                    outputRange: [2, 16],
                  }) || 2,
                },
              ]}
            />
          ))}
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
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
  contentContainer: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    marginHorizontal: normalize(26),
    marginBottom: normalize(20),
    padding: normalize(18),
    minHeight: normalize(524),
  },
  contentText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: '#B0B0B0',
    lineHeight: normalizeFontSize(20),
    letterSpacing: -0.4,
  },
  pageNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(40),
    gap: normalize(20),
  },
  navButton: {
    width: normalize(20),
    height: normalize(20),
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(14),
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navIcon: {
    width: normalize(8),
    height: normalize(8),
  },
  pageText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#FFFFFF',
  },
  recordingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(64),
    marginBottom: normalize(40),
  },
  recordingButtonContainer: {
    alignItems: 'center',
  },
  recordingButton: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(28),
    backgroundColor: '#262626',
    borderWidth: normalize(2.4),
    borderColor: '#262626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3C3C3C',
    shadowOffset: {
      width: normalize(4),
      height: normalize(4),
    },
    shadowOpacity: 1,
    shadowRadius: normalize(18),
    elevation: 8,
  },
  recordingButtonActive: {
    backgroundColor: '#EA4335',
  },
  recordingButtonInner: {
    width: normalize(49),
    height: normalize(49),
    borderRadius: normalize(24.5),
    backgroundColor: '#EA4335',
  },
  recordingTime: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#85F380',
    marginTop: normalize(8),
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
    height: normalize(32),
  },
  waveformBar: {
    width: normalize(2),
    backgroundColor: '#85F380',
    opacity: 0.5,
    borderRadius: normalize(1),
  },
});

export default OptimizVoiceScreen; 