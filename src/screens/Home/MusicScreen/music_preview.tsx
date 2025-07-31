import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

const covers = [
  { id: 1, time: '3:04' },
  { id: 2, time: '--' },
  { id: 3, time: '--' },
  { id: 4, time: '--' },
];

const MusicPreviewScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* 风格标签 */}
      <View style={styles.styleTag}>
        <Text style={styles.styleTagText}>Classical</Text>
      </View>
      {/* 歌词/文本卡片 */}
      <View style={styles.lyricCard}>
        <ScrollView>
          <Text style={styles.lyricText}>
            liability, and Party B agrees that Party A will directly seek compensation from Microsoft.
            Contract Changes and Termination
            Any changes or supplements to this contract must be agreed upon in writing by both parties and signed in a written agreement. 2 During the performance of the contract, if one party proposes to terminate the contract, it shall notify the other party in writing 30 days in advance: If the contract cannot be continued due to force majeure or other reasons stipulated by laws and regulations, this contract may be terminated in advance, and both parties shall not bear liability for breach of contract.
            Force majeure
            Force majeure refers to events that cannot be foreseen, avoided, or overcome. Due to force majeure
          </Text>
        </ScrollView>
      </View>
      {/* 封面卡片 */}
      <View style={styles.coversRow}>
        {covers.map((c, idx) => (
          <View style={styles.coverCard} key={c.id}>
            <Image
              source={require('../../../../assets/images/music_play.png')}
              style={styles.coverImg}
              resizeMode="contain"
            />
            <Text style={styles.coverLabel}>Cover</Text>
            <Text style={styles.coverTime}>{c.time}</Text>
          </View>
        ))}
      </View>
      {/* 波形和band文本 */}
      <View style={styles.bandRow}>
        <Image
          source={require('../../../../assets/images/long_wave.png')}
          style={styles.bandWave}
          resizeMode="contain"
        />
        <Text style={styles.bandText}>The band is playing</Text>
      </View>
      {/* 按钮区 */}
      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => navigation.navigate('MusicMain' as never)}
        activeOpacity={0.7}
      >
        <Text style={styles.homeBtnText}>Back to homepage</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.okBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Text style={styles.okBtnText}>OK</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    paddingTop: 32,
    paddingHorizontal: 12,
    paddingBottom: 24,
    marginTop: 24,
  },
  styleTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#262626',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
    marginLeft: 4,
    borderWidth: 1,
    borderColor: '#454545',
    marginStart: 12,
  },
  styleTagText: {
    color: '#85F380',
    fontSize: 18,
    // fontWeight: 'bold',
  },
  lyricCard: {
    width: CARD_WIDTH,
    backgroundColor: '#222',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    minHeight: 160,
    maxHeight: 220,
  },
  lyricText: {
    color: '#eee',
    fontSize: 16,
    lineHeight: 22,
  },
  coversRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: CARD_WIDTH,
    marginBottom: 18,
  },
  coverCard: {
    width: 68,
    alignItems: 'center',
    backgroundColor: '#191919',
    borderRadius: 12,
    paddingVertical: 6,
    marginHorizontal: 2,
    borderWidth: 1,
    borderColor: '#85F380',
  },
  coverImg: {
    width: 40,
    height: 40,
    marginBottom: 2,
  },
  coverLabel: {
    color: '#85F380',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  coverTime: {
    color: '#eee',
    fontSize: 12,
  },
  bandRow: {
    width: CARD_WIDTH,
    alignItems: 'center',
    marginBottom: 18,
    marginTop: 8,
  },
  bandWave: {
    width: '100%',
    height: 22,
    marginBottom: 4,
  },
  bandText: {
    color: '#85F380',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  homeBtn: {
    width: CARD_WIDTH,
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#85F380',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 14,
  },
  homeBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  okBtn: {
    width: CARD_WIDTH,
    backgroundColor: '#85F380',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  okBtnText: {
    color: '#0C0C0D',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default MusicPreviewScreen;
