import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { polishLyrics } from '@/api/music/music';

const { width } = Dimensions.get('window');

const CARD_SIZE = (width - 48) / 2; // 两个卡片并排，左右各12，卡片间距24

const MusicScreen: React.FC = () => {
  const navigation = useNavigation();
  const [lyrics, setLyrics] = useState('');
  const [fromLang, setFromLang] = useState('Chinese');
  const [toLang, setToLang] = useState('English');


  // 歌词润饰
  const handleAiPolish = async () => {
    const res = await polishLyrics({
      work_lyrics: lyrics,
    });
    console.log(res);
  }

  return (
    <View style={styles.container}>
      {/* 顶部卡片区 */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.topCard}
          onPress={() => navigation.navigate('MyWork' as never)}
        >
          <Image
            source={require('../../../../assets/images/my_works.png')}
            style={styles.topCardIcon}
            resizeMode="contain"
          />
          <Text style={styles.topCardText}>My Works</Text>
          <Text style={styles.topCardArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.topCard}
          onPress={() => navigation.navigate('HummingMusic' as never)}
        >
          <Image
            source={require('../../../../assets/images/humming_music.png')}
            style={styles.topCardIcon}
            resizeMode="contain"
          />
          <Text style={styles.topCardText}>Humming Music</Text>
          <Text style={styles.topCardArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 分组标题 */}
      <Text style={styles.sectionTitle}>Lyric Writing & Composition</Text>

      {/* 歌词输入卡片 */}
      <View style={styles.lyricCard}>
        <View style={styles.lyricCardHeader}>
          <Text style={styles.lyricCardTitle}>Write Lyrics</Text>
          <TouchableOpacity style={styles.aiPolish} onPress={handleAiPolish}>
            <Image
              source={require('../../../../assets/images/ai_polishing_star.png')}
              style={styles.aiIcon}
              resizeMode="contain"
            />
            <MaskedView
              maskElement={
                <Text style={styles.aiPolishText}>AI Polishing</Text>
              }
            >
              <LinearGradient
                colors={['#85F380', '#A099FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={[styles.aiPolishText, { opacity: 0 }]}>
                  AI Polishing
                </Text>
              </LinearGradient>
            </MaskedView>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.lyricInput}
          placeholder="Enter the lyrics in your mind."
          placeholderTextColor="#666"
          value={lyrics}
          onChangeText={setLyrics}
          multiline
        />
      </View>

      {/* 底部操作区 */}
      <View style={{ justifyContent: 'flex-end' }}>
        {/* 语言选择与功能按钮 */}
        <View style={styles.langRow}>
          <TouchableOpacity style={styles.langBtn}>
            <Text style={styles.langText}>{fromLang}</Text>
            <Text style={styles.langArrow}>▼</Text>
          </TouchableOpacity>
          <Text style={styles.langSwitch}>⇄</Text>
          <TouchableOpacity style={styles.langBtn}>
            <Text style={styles.langText}>{toLang}</Text>
            <Text style={styles.langArrow}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.musicTransBtn}>
            <Image
              source={require('../../../../assets/images/music_trans.png')}
              style={styles.musicTransIcon}
              // resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Next 按钮 */}
        <TouchableOpacity
          style={[
            styles.nextBtn,
            !lyrics && styles.nextBtnDisabled
          ]}
          disabled={!lyrics}
          onPress={() => navigation.navigate('MusicEdit' as never)}
        >
          <Text
            style={[
              styles.nextBtnText,
              !lyrics && styles.nextBtnTextDisabled
            ]}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: 32,
    paddingHorizontal: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  topCard: {
    marginTop: 8,
    width: CARD_SIZE,
    height: 100,
    backgroundColor: '#191919',
    borderRadius: 16,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'flex-start',
    position: 'relative',
  },
  topCardIcon: {
    width: 32,
    height: 32,
    marginBottom: 6,
  },
  topCardText: {
    width: 157.5,
    padding: 12,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  topCardArrow: {
    position: 'absolute',
    right: 14,
    top: 32,
    color: '#888',
    fontSize: 22,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 2,
  },
  lyricCard: {
    backgroundColor: '#191919',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    flex: 1,
    minHeight: 0,
  },
  lyricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lyricCardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  aiPolish: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    width: 18,
    height: 18,
    marginRight: 4,
    tintColor: '#85F380',
  },
  aiPolishText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#85F380', // fallback color
  },
  lyricInput: {
    minHeight: 90,
    color: '#fff',
    fontSize: 15,
    marginTop: 2,
    textAlignVertical: 'top',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 18,
  },
  langBtn: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginHorizontal: 2,
    justifyContent: 'center',
  },
  langText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
    marginRight: 4,
  },
  langArrow: {
    color: '#888',
    fontSize: 13,
  },
  langSwitch: {
    color: '#fff',
    fontSize: 22,
    marginHorizontal: 8,
  },
  musicTransBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#222',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  musicTransIcon: {
    width: 32,
    height: 32,
    // tintColor: '#3cff8f',
  },
  nextBtn: {
    backgroundColor: '#85F380',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 2,
  },
  nextBtnDisabled: {
    backgroundColor: '#444',
  },
  nextBtnText: {
    color: '#111',
    fontSize: 18,
    fontWeight: '600',
  },
  nextBtnTextDisabled: {
    color: '#888',
  },
});

export default MusicScreen;
