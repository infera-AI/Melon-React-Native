import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
  Platform,
  UIManager
} from 'react-native';
import { Buffer } from 'buffer';

interface VoiceWaveProps {
  pcmData: string; // Base64 PCM 字符串
  barCount?: number;
  barColor?: string;
  barMinHeight?: number;
  barMaxHeight?: number;
  style?: ViewStyle;
}

const DEFAULT_BAR_COUNT = 5;
const DEFAULT_BAR_COLOR = '#00c06d';
const DEFAULT_BAR_MIN_HEIGHT = 4;
const DEFAULT_BAR_MAX_HEIGHT = 20;
const BAR_WIDTH = 4;
const BAR_SPACING = 3;
const VOLUME_THRESHOLD = 0.02;
const UPDATE_INTERVAL = 100; // ms，动画更新频率

// 启用 Android 支持
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const VoiceWave: React.FC<VoiceWaveProps> = ({
  pcmData,
  barCount = DEFAULT_BAR_COUNT,
  barColor = DEFAULT_BAR_COLOR,
  barMinHeight = DEFAULT_BAR_MIN_HEIGHT,
  barMaxHeight = DEFAULT_BAR_MAX_HEIGHT,
  style,
}) => {
  const animatedValues = useRef<Animated.Value[]>(
    Array.from({ length: barCount }, () => new Animated.Value(barMinHeight))
  ).current;

  const volumeRef = useRef(0);
  const updateTimer = useRef<NodeJS.Timeout | null>(null);

  // 提取音量
  const extractVolume = (base64: string): number => {
    if (!base64) return 0;
    try {
      const buffer = Buffer.from(base64, 'base64');
      const samples = new Int16Array(buffer.buffer, buffer.byteOffset, buffer.length / 2);
      const rms = Math.sqrt(
        samples.reduce((sum, val) => sum + val * val, 0) / samples.length
      );
      return Math.min(rms / 32768, 1);
    } catch {
      return 0;
    }
  };

const smoothVolume = useRef(0);

const SMOOTHING_UP = 0.6;
const SMOOTHING_DOWN = 0.4;

const updateSmoothVolume = () => {
  let target = volumeRef.current;
  let current = smoothVolume.current;

  // 防止 NaN 传播
  if (typeof target !== 'number' || isNaN(target)) {
    target = 0;
  }
  if (typeof current !== 'number' || isNaN(current)) {
    current = 0;
  }

  if (target > current) {
    smoothVolume.current = current + (target - current) * SMOOTHING_UP;
  } else {
    smoothVolume.current = current + (target - current) * SMOOTHING_DOWN;
  }
};

const updateAnimation = () => {
  const now = Date.now();
  updateSmoothVolume(); // 这里调用平滑函数

  const volume = smoothVolume.current;
  const isSpeaking = volume > VOLUME_THRESHOLD;

  for (let i = 0; i < barCount; i++) {
    // now / 500 数值越小，波动越慢     i * 1000 增量越大，条纹间相位差越大
    const phase = now / 500 + i * 1050;

    if (isSpeaking) {
      const baseVolume = volume;
      const wave = Math.sin(now / 150 + i * 700) * 0.5 + 0.5;
      const noise = (Math.random() - 0.5) * 0.2;
      const val = baseVolume * 0.7 + wave * 0.3 + noise;

      const targetHeight =
        barMinHeight + (barMaxHeight - barMinHeight) * Math.min(Math.max(val, 0), 1);

      Animated.timing(animatedValues[i], {
        toValue: targetHeight,
        duration: UPDATE_INTERVAL,
        useNativeDriver: false,
      }).start();
    } else {
      const wave = 0.03 + 0.05 * Math.sin(phase);

      const targetHeight =
        barMinHeight + (barMaxHeight - barMinHeight) * wave;

      Animated.timing(animatedValues[i], {
        toValue: targetHeight,
        duration: UPDATE_INTERVAL,
        useNativeDriver: false,
      }).start();
    }
  }
};

  useEffect(() => {
    // 启动定时器每100ms更新动画目标高度
    updateTimer.current = setInterval(updateAnimation, UPDATE_INTERVAL);
    return () => {
      if (updateTimer.current) clearInterval(updateTimer.current);
    };
  }, []);

  useEffect(() => {
    const rawVolume = extractVolume(pcmData);
    volumeRef.current = rawVolume;
  }, [pcmData]);

  return (
    <View style={[styles.container, style]}>
      {animatedValues.map((val, idx) => (
        <Animated.View
          key={idx}
          style={{
            width: BAR_WIDTH,
            height: val,
            backgroundColor: barColor,
            borderRadius: BAR_WIDTH / 2,
            marginHorizontal: BAR_SPACING / 2,
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
});

export default VoiceWave;
