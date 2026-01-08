import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

type Props = {
  progress: number; // 0 ~ 100
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  duration?: number;
};

const ProgressBar = ({
  progress,
  height = 10,
  backgroundColor = '#e0e0e0',
  progressColor = '#3b82f6',
  duration = 300,
}: Props) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration,
      useNativeDriver: false,
    }).start();
  }, [progress, animatedWidth, duration]);

  const widthInterpolate = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { height, backgroundColor }]}>
      <Animated.View
        style={[
          styles.progress,
          {
            height,
            backgroundColor: progressColor,
            width: widthInterpolate,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 5,
  },
});

export default ProgressBar;
