import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, ScrollView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { useLanguage } from '@/contexts/LanguageContext';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';

const CARD_RADIUS = normalize(18);
const CARD_PADDING = normalize(16);
const CARD_MARGIN_BOTTOM = normalize(18);
const BUTTONS = ['R&B', 'Classical', 'Vaporwave', 'Ancient'];

const MusicEditScreen: React.FC = () => {
  const [lyrics, setLyrics] = useState('');
  const [fromLang, _setFromLang] = useState('Chinese');
  const [toLang, _setToLang] = useState('English');
  const [selectedStyle, setSelectedStyle] = useState('R&B');
  const navigation = useNavigation();
  const { t } = useLanguage();

  const handleAiPolish = () => {
    // Placeholder for AI polishing logic
    console.log('AI Polishing clicked');
  };

  return (
    <View style={styles.container}>
      {/* Header Row (Back Button) */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
            source={require('../../../../assets/images/music_back_btn.png')}
            style={styles.backBtnIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={{ width: normalize(32) }} />
      </View>
      {/* 内容区 */}
      <View style={styles.flexContent}>
        {/* 歌词输入卡片 */}
        <View style={styles.lyricCard}>
          <View style={styles.lyricCardHeader}>
            <Text style={styles.lyricCardTitle}>{t('music.write_lyrics')}</Text>
            <TouchableOpacity style={styles.aiPolish} onPress={handleAiPolish}>
              <Image
                source={require('../../../../assets/images/ai_polishing_star.png')}
                style={styles.aiIcon}
                resizeMode="contain"
              />
              <MaskedView
                maskElement={
                  <Text style={styles.aiPolishText}>{t('music.ai_polishing')}</Text>
                }
              >
                <LinearGradient
                  colors={['#85F380', '#A099FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={[styles.aiPolishText, { opacity: 0 }]}>
                    {t('music.ai_polishing')}
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
              <Text style={styles.lyricCardTitle}>{t('music.select_music_style')}</Text>
              <View style={styles.aiPolish}>
                <Image
                  source={require('../../../../assets/images/ai_polishing_star.png')}
                  style={styles.aiIcon}
                  resizeMode="contain"
                />
                <MaskedView
                  maskElement={
                    <Text style={styles.aiPolishText}>{t('music.ai_polishing')}</Text>
                  }
                >
                  <LinearGradient
                    colors={['#85F380', '#A099FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={[styles.aiPolishText, { opacity: 0 }]}>
                      {t('music.ai_polishing')}
                    </Text>
                  </LinearGradient>
                </MaskedView>
              </View>
            </View>
            <Text style={styles.styleSubtitle}>
              {t('music.pre_filled_based_on_humming_tone')}
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
        <TouchableOpacity style={styles.nextBtn}>
          <Text style={styles.nextBtnText}>{t('music.next')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: normalize(24),
    paddingHorizontal: normalize(12),
    paddingBottom: normalize(24),
  },
  flexContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginTop: normalize(16), // leave space for back button
  },
  bottomBlock: {
    marginBottom: normalize(24),
  },
  lyricCard: {
    backgroundColor: '#191919',
    borderRadius: CARD_RADIUS,
    padding: CARD_PADDING,
    marginBottom: CARD_MARGIN_BOTTOM,
    minHeight: normalize(120),
    flex: 1,
  },
  lyricCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(8),
  },
  lyricCardTitle: {
    color: '#fff',
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
  },
  aiPolish: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    width: normalize(18),
    height: normalize(18),
    marginRight: normalize(4),
    tintColor: '#85F380',
  },
  aiPolishText: {
    fontWeight: 'bold',
    fontSize: normalizeFontSize(15),
    color: '#85F380',
  },
  lyricInput: {
    minHeight: normalize(60),
    color: '#fff',
    fontSize: normalizeFontSize(15),
    marginTop: normalize(2),
    textAlignVertical: 'top',
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: normalize(18),
  },
  langBtn: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: normalize(10),
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: normalize(10),
    paddingHorizontal: normalize(14),
    marginHorizontal: normalize(2),
    justifyContent: 'center',
  },
  langText: {
    color: '#fff',
    fontSize: normalizeFontSize(15),
    fontWeight: '500',
    marginRight: normalize(4),
  },
  langArrow: {
    color: '#888',
    fontSize: normalizeFontSize(13),
  },
  langSwitch: {
    color: '#fff',
    fontSize: normalizeFontSize(22),
    marginHorizontal: normalize(8),
  },
  musicTransBtn: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: '#222',
    borderRadius: normalize(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: normalize(6),
  },
  musicTransIcon: {
    width: normalize(32),
    height: normalize(32),
  },
  styleCard: {
    backgroundColor: '#191919',
    borderRadius: CARD_RADIUS,
    padding: CARD_PADDING,
    marginBottom: CARD_MARGIN_BOTTOM,
  },
  styleSubtitle: {
    color: '#aaa',
    fontSize: normalizeFontSize(14),
    marginBottom: normalize(12),
    marginTop: normalize(2),
  },
  styleBtnRowScroll: {
    marginBottom: 0,
  },
  styleBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(8),
    paddingRight: normalize(8),
  },
  styleBtn: {
    backgroundColor: '#222',
    borderRadius: normalize(8),
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(18),
    marginRight: normalize(8),
    marginBottom: normalize(8),
  },
  styleBtnSelected: {
    backgroundColor: '#85F380',
  },
  styleBtnText: {
    color: '#fff',
    fontSize: normalizeFontSize(15),
    fontWeight: '500',
  },
  styleBtnTextSelected: {
    color: '#111',
    fontWeight: '700',
  },
  nextBtn: {
    width: '100%',
    backgroundColor: '#85F380',
    borderRadius: normalize(12),
    paddingVertical: normalize(16),
    alignItems: 'center',
    marginBottom: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
    marginBottom: 0,
    marginTop: normalize(8),
  },
  backBtn: {
    width: normalize(32),
    height: normalize(32),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnIcon: {
    width: normalize(28),
    height: normalize(28),
  },
  nextBtnText: {
    color: '#111',
    fontSize: normalizeFontSize(20),
    fontWeight: '600',
  },
});

export default MusicEditScreen;
