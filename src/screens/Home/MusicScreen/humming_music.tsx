import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;
const CARD_HEIGHT = 400;

const HummingMusicScreen: React.FC = () => {
  const [recording, setRecording] = useState(true);
  const [timer, setTimer] = useState(5); // Placeholder for 00:05
  const navigation = useNavigation();

  // Placeholder for animation/visualization
  // In a real app, replace with Lottie or Canvas animation

  return (
    <View style={styles.container}>
      {/* 顶部返回按钮 */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Image
          source={require('../../../../assets/images/music_back_btn.png')}
          style={styles.backBtnIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <View style={styles.card}>
        <Image
          source={require('../../../../assets/images/play_wave.png')}
          style={styles.visual}
          resizeMode="contain"
        />
        <View style={styles.timerRow}>
          <View style={styles.waveBar} />
          <Text style={styles.timerText}>
            00:0{timer}
          </Text>
          <View style={styles.waveBar} />
        </View>
        <TouchableOpacity
          style={styles.recordBtn}
          onPress={() => setRecording(!recording)}
          activeOpacity={0.7}
        >
          <View style={styles.recordCircle}>
            <View style={styles.recordDot} />
          </View>
        </TouchableOpacity>
        <Text style={styles.recordingText}>
          {recording ? 'Recording. Click to pause' : 'Paused. Click to record'}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.nextBtn}
        onPress={() => navigation.navigate('MusicEditHumming' as never)}
      >
        <Text style={styles.nextBtnText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingTop: 24,
    paddingBottom: 24,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#191919',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  visual: {
    width: CARD_WIDTH - 40,
    height: 200,
    marginBottom: 16,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  waveBar: {
    width: 60,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'transparent',
    marginHorizontal: 8,
  },
  timerText: {
    color: '#85F380',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  recordBtn: {
    marginTop: 8,
    marginBottom: 8,
  },
  recordCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#85F380',
  },
  recordDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ff3c3c',
    borderWidth: 2,
    borderColor: '#fff',
  },
  recordingText: {
    color: '#aaa',
    fontSize: 15,
    marginTop: 8,
  },
  backBtn: {
    position: 'absolute',
    top: 32,
    left: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnIcon: {
    width: 28,
    height: 28,
  },
  nextBtn: {
    width: '100%',
    backgroundColor: '#85F380',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'absolute',
    bottom: 24,
    left: 12,
    right: 12,
  },
  nextBtnText: {
    color: '#111',
    fontSize: 20,
    fontWeight: '600',
  },
});

export default HummingMusicScreen;
