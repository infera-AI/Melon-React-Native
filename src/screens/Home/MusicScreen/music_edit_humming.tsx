import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Dimensions, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const CARD_RADIUS = 18;
const CARD_PADDING = 16;
const CARD_MARGIN_BOTTOM = 18;
const BUTTONS = ['R&B', 'Classical', 'Vaporwave', 'Ancient'];

const MusicEditHummingScreen: React.FC = () => {
  const [lyrics, setLyrics] = useState('');
  const [fromLang, setFromLang] = useState('Chinese');
  const [toLang, setToLang] = useState('English');
  const [selectedStyle, setSelectedStyle] = useState('R&B');
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header Row (Back Button) */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
            source={require('../../../../assets/images/music_back_btn.png')}
            style={styles.backBtnIcon}
            // resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={{ width: 32 }} />
      </View>
      {/* 内容区 */}
      <View style={styles.flexContent}>
        {/* 音频波形条 */}
        <View style={styles.audioBarContainer}>
          <Text style={styles.audioTime}>0:25</Text>
          <View style={styles.audioWaveform}>
            <Image
              source={require('../../../../assets/images/long_wave.png')}
              style={styles.longWaveImg}
              resizeMode="contain"
            />
          </View>
          <TouchableOpacity style={styles.audioPlayBtn} activeOpacity={0.7}>
            <View style={styles.audioPlayCircle}>
              <Image
                source={require('../../../../assets/images/music_play.png')}
                style={styles.audioPlayIcon}
                // resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>
        {/* 歌词输入卡片 */}
        <View style={styles.lyricCard}>
          <View style={styles.lyricCardHeader}>
            <Text style={styles.lyricCardTitle}>Write Lyrics</Text>
            <View style={styles.aiPolish}>
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
            </View>
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

        {/* 下方区块 */}
        <View style={styles.bottomBlock}>
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
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* 音乐风格选择卡片 */}
          <View style={styles.styleCard}>
            <View style={styles.lyricCardHeader}>
              <Text style={styles.lyricCardTitle}>Select Music Style</Text>
              <View style={styles.aiPolish}>
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
              </View>
            </View>
            <Text style={styles.styleSubtitle}>
              Pre-filled based on user's humming tone
            </Text>
            <ScrollView
              style={styles.styleBtnRowScroll}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.styleBtnRow}
            >
              {BUTTONS.map((btn) => (
                <TouchableOpacity
                  key={btn}
                  style={[
                    styles.styleBtn,
                    selectedStyle === btn && styles.styleBtnSelected,
                  ]}
                  onPress={() => setSelectedStyle(btn)}
                >
                  <Text
                    style={[
                      styles.styleBtnText,
                      selectedStyle === btn && styles.styleBtnTextSelected,
                    ]}
                  >
                    {btn}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
        {/* Next 按钮 */}
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => navigation.navigate('MusicPreview' as never)}
        >
          <Text style={styles.nextBtnText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: 24,
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  flexContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginTop: 16, // leave space for back button
  },
  bottomBlock: {
    marginBottom: 24,
  },
  lyricCard: {
    backgroundColor: '#191919',
    borderRadius: CARD_RADIUS,
    padding: CARD_PADDING,
    marginBottom: CARD_MARGIN_BOTTOM,
    minHeight: 120,
    flex: 1,
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
    color: '#85F380',
  },
  lyricInput: {
    minHeight: 60,
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
  },
  styleCard: {
    backgroundColor: '#191919',
    borderRadius: CARD_RADIUS,
    padding: CARD_PADDING,
    marginBottom: CARD_MARGIN_BOTTOM,
  },
  styleSubtitle: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 12,
    marginTop: 2,
  },
  styleBtnRowScroll: {
    marginBottom: 0,
  },
  styleBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingRight: 8,
  },
  styleBtn: {
    backgroundColor: '#222',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginRight: 8,
    marginBottom: 8,
  },
  styleBtnSelected: {
    backgroundColor: '#85F380',
  },
  styleBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  styleBtnTextSelected: {
    color: '#111',
    fontWeight: '700',
  },
  audioBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginBottom: 18,
    marginTop: 0,
  },
  audioTime: {
    color: '#85F380',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 12,
    width: 44,
    textAlign: 'left',
  },
  audioWaveform: {
    flex: 1,
    height: 28,
    marginRight: 16,
    marginLeft: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  longWaveImg: {
    width: '100%',
    height: 28,
  },
  waveBar: {
    width: 3,
    backgroundColor: '#85F380',
    marginHorizontal: 1,
    borderRadius: 2,
  },
  audioPlayBtn: {
    marginLeft: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioPlayCircle: {
    width: 32,
    height: 32,
    // borderRadius: 16,
    // backgroundColor: '#85F380',
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioPlayIcon: {
 width: 32,
    height: 32,
    // tintColor: '#111',
    marginLeft: 2,
  },
  nextBtn: {
    width: '100%',
    backgroundColor: '#85F380',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    marginBottom: 0,
    marginTop: 8,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnIcon: {
    width: 28,
    height: 28,
  },
  nextBtnText: {
    color: '#111',
    fontSize: 20,
    fontWeight: '600',
  },
});

export default MusicEditHummingScreen;
