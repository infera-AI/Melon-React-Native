import React, { useState, useEffect } from 'react';
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
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { polishLyrics, recommendGenres } from '@/api/music/music';
import { useMessageModal } from '@/contexts/MessageModalContext';
import FullScreenLoader from '@/components/FullScreenLoader';
import { MusicStackParamList } from './navigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMusicStore } from '@/store/modules/music.store';
import { supportedLanguages } from '@/i18n/languages';
import { useLanguage } from '@/contexts/LanguageContext';
import { translateText } from '@/api/profile/profile';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';

type MusicScreenNavigationProp = NativeStackNavigationProp<MusicStackParamList, 'MusicMain'>;

const MusicScreen: React.FC = () => {
  const navigation = useNavigation<MusicScreenNavigationProp>();
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [musicStyles, setMusicStyles] = useState<string[]>([]);
  const {show} = useMessageModal()
  const [isLoading, setIsLoading] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [leftLanguage, setLeftLanguage] = useState<string>("zh");
  const [rightLanguage, setRightLanguage] = useState<string>("zh");
  const [type,setType] = useState<string>("");
  const {t} = useLanguage();

  // 歌词润饰
  const handleAiPolish = async () => {
    try {
      setIsLoading(true);
      const res = await polishLyrics({
        work_lyrics: lyrics,
      });
      setLyrics(res.work_lyrics)
      setTitle(res.work_title)
    } catch (error: any) {
      console.log(error);
      show({
        message: t('music.polish_lyrics_failed') + (error.message || t('common.unknown_error')),
      });
    }
    setIsLoading(false);
  };

  // 获取推荐曲风
  const getRecommendStylesRequest = async () => {
    try {
      const res = await recommendGenres({
        work_lyrics: lyrics,
      });
      console.log(res);
      setMusicStyles(res.work_genres)
    } catch (error: any) {
      show({
        message: t('music.get_recommend_styles_failed') + (error.message || t('common.unknown_error')),
      });
    }
  };

  // 选择曲风
  const handleStyleSelect = (style: string) => {
    setSelectedStyles(prev => {
      if (prev.includes(style)) {
        return prev.filter(item => item !== style);
      } else {
        return [...prev, style];
      }
    });
  };

  const handleLanguageSelect = (language: string) => {
    if(type==="left"){
      setLeftLanguage(language);
    }else{
      setRightLanguage(language);
    }
    setShowLanguageModal(false);
  };

  const handleNext = () => {
    if(lyrics.trim() === ""){
      show({message:t('music.lyrics_empty')});
      return;
    }
    if(selectedStyles.length === 0){
      show({message:t('music.select_music_style')});
      return;
    }
    useMusicStore.getState().setMusicGenerateInfo({
      title: title,
      lyrics: lyrics,
      musicStyles: selectedStyles,
    });
    navigation.navigate('GeneratingMusic' as never);
  }

  const handleLanguageSwitch = (type:string) => {
    setType(type);
    setShowLanguageModal(true);
  }

  // 翻译歌词
  const handleTranslateLyrics = async () => {

    setIsLoading(true);
    try {
      const res = await translateText({
        source_text: lyrics,
        source_language: leftLanguage,
        target_language: rightLanguage,
        format_type: "text",
      });
      console.log(res);
      setLyrics(res.Translated);
    } catch (error:any) {
      show({
        message: t('music.translate_lyrics_failed') + (error.message || 'Unknown error'),
      });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    if (lyrics) {
      getRecommendStylesRequest();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lyrics]);

  return (
    <SafeAreaView edges={['top','bottom']} style={styles.container}>
    <ScrollView>
      {/* 顶部卡片区 */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.topCard} onPress={() => navigation.navigate('MyWork')}>
          <Image
            source={require('../../../../assets/images/my_works.png')}
            style={styles.topCardIcon}
            resizeMode="contain"
          />
          <Text style={styles.topCardText}>{t('music.my_works')}</Text>
          <Image source={require('@/assets/main/right_arrow_icon.png')} style={styles.topCardArrow} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topCard} onPress={() => navigation.navigate('HummingMusic' as never)}>
          <Image
            source={require('../../../../assets/images/humming_music.png')}
            style={styles.topCardIcon}
            resizeMode="contain"
          />
          <Text style={styles.topCardText}>{t('music.humming_music')}</Text>
          <Image source={require('@/assets/main/right_arrow_icon.png')} style={styles.topCardArrow} />
        </TouchableOpacity>
      </View>

      {/* 分组标题 */}
      <Text style={styles.sectionTitle}>{t('music.lyric_writing_composition')}</Text>

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
          placeholder={t('music.enter_lyrics_placeholder')}
          placeholderTextColor="#666"
          value={lyrics}
          onChangeText={setLyrics}
          numberOfLines={10}
          multiline
        />
      </View>
      
      {/* 底部操作区 */}
      <View style={{ justifyContent: 'flex-end' }}>
        {/* 语言选择与功能按钮 */}
        <View style={styles.langRow}>
          <TouchableOpacity style={styles.langBtn} onPress={()=>handleLanguageSwitch("left")}>
            <Text style={styles.langText}>{leftLanguage}</Text>
            <Text style={styles.langArrow}>▼</Text>
          </TouchableOpacity>
          <Text style={styles.langSwitch}>⇄</Text>
          <TouchableOpacity style={styles.langBtn} onPress={()=>handleLanguageSwitch("right")}>
            <Text style={styles.langText}>{rightLanguage}</Text>
            <Text style={styles.langArrow}>▼</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.musicTransBtn} onPress={handleTranslateLyrics}>
            <Image
              source={require('../../../../assets/images/music_trans.png')}
              style={styles.musicTransIcon}
              // resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

         {/* 曲风选择卡片 */}
      {lyrics&&<View style={styles.musicStyleCard}>
        <View style={styles.musicStyleHeader}>
          <Text style={styles.musicStyleTitle}>{t('music.select_music_style')}</Text>
          <TouchableOpacity style={styles.aiPolish} onPress={getRecommendStylesRequest}>
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

        {/* 音频可视化 */}
        <View style={styles.audioVisualization}>
          <Text style={styles.audioDescription}>
            {t('music.pre_filled_description')}
          </Text>
        </View>

        {/* 曲风选择芯片 */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.styleChipsContainer}
          contentContainerStyle={styles.styleChipsContent}
        >
          {musicStyles.map((style) => (
            <TouchableOpacity
              key={style}
              style={[
                styles.styleChip,
                selectedStyles.includes(style) && styles.styleChipSelected
              ]}
              onPress={() => handleStyleSelect(style)}
            >
              <Text style={[
                styles.styleChipText,
                selectedStyles.includes(style) && styles.styleChipTextSelected
              ]}>
                {style}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        </View>}

        {/* Next 按钮 */}
        <TouchableOpacity
          style={[
            styles.nextBtn,
            !lyrics && styles.nextBtnDisabled
          ]}
          disabled={!lyrics}
          onPress={handleNext}
        >
          <Text
            style={[
              styles.nextBtnText,
              !lyrics && styles.nextBtnTextDisabled
            ]}
          >
            {t('music.next')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
       {/* 语言选择弹窗 */}
       <Modal
          visible={showLanguageModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t('voiceprint_management.select_language')}</Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.languageList}>
                {supportedLanguages?.map((language: any, index: number) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.languageOption} 
                    onPress={() => handleLanguageSelect(language.code)}
                  >
                    <Text style={styles.languageOptionText}>{language.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
      </View>
        </Modal>
    <FullScreenLoader visible={isLoading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    paddingTop: normalize(32),
    paddingHorizontal: normalize(24),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalize(18),
    gap: normalize(12),
  },
  topCard: {
    flex:1,
    marginTop: normalize(8),
    width: normalize(157.5),
    height: normalize(100),
    backgroundColor: '#191919',
    borderRadius: normalize(12),
    padding: normalize(14),
    justifyContent: 'center',
    alignItems: 'flex-start',
    position: 'relative',
  },
  topCardIcon: {
    width: normalize(32),
    height: normalize(32),
    marginBottom: normalize(6),
  },
  topCardText: {
    width: normalize(157.5),
    marginTop: normalize(12),
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start',
    color: '#fff',
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    marginBottom: normalize(2),
  },
  topCardArrow: {
    position: 'absolute',
    right: normalize(14),
    top: normalize(26),
    color: '#888',
    fontSize: normalizeFontSize(22),
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: normalizeFontSize(16),
    fontWeight: '700',
    marginBottom: normalize(10),
    marginTop: normalize(2),
  },
  lyricCard: {
    height: normalize(260),
    backgroundColor: '#191919',
    borderRadius: normalize(12),
    padding: normalize(16),
    marginBottom: normalize(18),
    flex: 1,
    minHeight: 0,
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
    color: '#85F380', // fallback color
    textAlign:'center',
  },
  lyricInput: {
    minHeight: normalize(90),
    color: '#fff',
    fontSize: normalizeFontSize(15),
    marginTop: normalize(2),
    textAlignVertical: 'top',
  },
  // 曲风选择卡片样式
  musicStyleCard: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    padding: normalize(16),
    marginBottom: normalize(18),
    minHeight: normalize(181),
  },
  musicStyleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(8),
  },
  musicStyleTitle: {
    color: '#FFFFFF',
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  // 音频可视化样式
  audioVisualization: {
    marginBottom: normalize(16),
  },
  audioDescription: {
    color: '#B0B0B0',
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    lineHeight: normalize(20),
    letterSpacing: -0.4,
    marginBottom: normalize(8),
  },
  // 曲风选择芯片样式
  styleChipsContainer: {
    marginTop: normalize(8),
    height: normalize(20),
  },
  styleChipsContent: {
    position: 'absolute',
    paddingHorizontal: 0,
    height: normalize(36),
    bottom: normalize(10),
  },
  styleChip: {
    backgroundColor: '#262626',
    borderRadius: normalize(8),
    paddingVertical: normalize(8),
    paddingHorizontal: normalize(12),
    marginRight: normalize(8),
    borderWidth: 1,
    borderColor: '#454545',
  },
  styleChipSelected: {
    backgroundColor: '#85F380',
    borderColor: '#85F380',
  },
  styleChipText: {
    color: '#FFFFFF',
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    textAlign: 'center',
  },
  styleChipTextSelected: {
    color: '#333333',
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
    width: normalize(32),
    height: normalize(32),
    backgroundColor: '#222',
    borderRadius: normalize(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: normalize(6),
  },
  musicTransIcon: {
    width: normalize(32),
    height: normalize(32),
    // tintColor: '#3cff8f',
  },
  nextBtn: {
    backgroundColor: '#85F380',
    borderRadius: normalize(12),
    paddingVertical: normalize(14),
    alignItems: 'center',
    marginTop: normalize(2),
  },
  nextBtnDisabled: {
    backgroundColor: '#444',
  },
  nextBtnText: {
    color: '#111',
    fontSize: normalizeFontSize(18),
    fontWeight: '600',
  },
  nextBtnTextDisabled: {
    color: '#888',
  },
  // 弹窗样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    width: normalize(300),
    maxHeight: normalize(400),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalClose: {
    fontSize: normalizeFontSize(18),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  languageList: {
    maxHeight: normalize(300),
  },
  languageOption: {
    padding: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  languageOptionText: {
    fontSize: normalizeFontSize(14),
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default MusicScreen;
