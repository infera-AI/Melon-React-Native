import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Vibration,
  Animated,
  Dimensions,
  BackHandler,
} from 'react-native';
import { useNavigation, NavigatorScreenParams } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../Auth/AuthNavigator';

type RootStackParamList = {
  Language: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
};
import { useLanguage } from '../../contexts/LanguageContext';

const languages = [
  {
    key: 'zh',
    label: 'Chinese',
    nativeLabel: '中文',
    flag: require('../../../assets/images/flag_cn.png'),
    translation: '很高兴可以用你的声音和你交流',
  },
  {
    key: 'en',
    label: 'English',
    nativeLabel: 'English',
    flag: require('../../../assets/images/flag_usuk.png'),
    translation: 'Glad that I can communicate with you in your voice',
  },
  {
    key: 'jp',
    label: 'Japanese',
    nativeLabel: '日本語',
    flag: require('../../../assets/images/flag_jp.png'),
    translation: 'あなたの声でコミュニケーションできて嬉しいです',
  },
  {
    key: 'de',
    label: 'Deutsch',
    nativeLabel: 'Deutsch',
    flag: require('../../../assets/images/flag_de.png'),
    translation: 'Ich freue mich, mit dir in deiner Stimme zu kommunizieren',
  },
  {
    key: 'fr',
    label: 'Francasis',
    nativeLabel: 'Français',
    flag: require('../../../assets/images/flag_fr.png'),
    translation: 'Heureux de pouvoir communiquer avec toi avec ta voix',
  },
  {
    key: 'es',
    label: 'Espanol',
    nativeLabel: 'Español',
    flag: require('../../../assets/images/flag_es.png'),
    translation: 'Me alegra poder comunicarme contigo en tu voz',
  },
];

const LanguageScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [selected, setSelected] = useState('en');
  const [pressed, setPressed] = useState<string | null>(null);
  const { width } = Dimensions.get('window');
  const slideAnim = useRef(new Animated.Value(width)).current;
  const { language, setLanguage, t } = useLanguage();

  // 首次挂载时，若当前语言不是'en'，则设为'en'，并高亮英文卡片
  useEffect(() => {
    if (language !== 'en') {
      setLanguage('en');
    }
    setSelected('en');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  // 物理返回键：如可返回则 goBack，否则不拦截，会导致android中嵌套子页面不能互相回退
  // useEffect(() => {
  //   const onBackPress = () => {
  //     if (navigation.canGoBack && navigation.canGoBack()) {
  //       navigation.goBack();
  //       return true; // 已处理
  //     }
  //     return false; // 交由系统处理
  //   };
  //   const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
  //   return () => subscription.remove();
  // }, [navigation]);

  const vibrateSelect = () => {
    Vibration.vibrate(30);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor="#000000ff" barStyle="light-content" />
      <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
        <View style={styles.headerRow}>
          {/* <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>{'<'}</Text>
          </TouchableOpacity> */}
          {/* <View style={styles.progressBar}>
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
            <View style={styles.progressDot} />
          </View> */}
        </View>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t('select_language')}</Text>
        <Text style={styles.subtitle2}>
          {t('subtitle2_translation')}
        </Text>
        <View style={styles.grid}>
          {languages.map((lang) => {
            const isSelected = selected === lang.key;
            const isPressed = pressed === lang.key;
            return (
              <TouchableOpacity
                key={lang.key}
                style={[
                  styles.langCard,
                  isSelected && styles.langCardSelected,
                  isPressed && styles.langCardPressed,
                ]}
onPress={() => {
  setSelected(lang.key);
  setLanguage(lang.key as 'en' | 'zh');
  vibrateSelect();
}}
                activeOpacity={0.7}
                onPressIn={() => setPressed(lang.key)}
                onPressOut={() => setPressed(null)}
              >
                <Image source={lang.flag} style={styles.flag} />
                <Text style={styles.langLabel}>{lang.nativeLabel}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {/* <Text style={styles.testTip}>click to test on different language</Text> */}
        {/* <TouchableOpacity style={styles.recordBtn}>
          <Text style={styles.recordBtnText}>Record again</Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => {
            setLanguage(selected as 'en' | 'zh');
            navigation.navigate('Auth', { screen: 'Welcome' });
          }}
        >
          <Text style={styles.nextBtnText}>{t('next') || 'Next'}</Text>
        </TouchableOpacity>
      </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const CARD_SIZE = 100;
const FLAG_SIZE = 56;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#232425',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backIcon: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  progressDot: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333a34ff',
    marginHorizontal: 4,
  },
  progressDotActive: {
    backgroundColor: '#4ADE80',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 32,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 2,
    opacity: 0.8,
  },
  subtitle2: {
    marginLeft: 48,
    marginRight: 48,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    height: 48,
    marginTop: 8,
    marginBottom: 24,
    opacity: 0.7,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  langCard: {
    width: CARD_SIZE,
    height: 1.5 * CARD_SIZE,
    backgroundColor: '#232425',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  langCardSelected: {
    backgroundColor: '#535654ff',
    shadowColor: '#ffffffff',
    shadowOpacity: 0.18,
    elevation: 6,
  },
  langCardPressed: {
    backgroundColor: '#303133',
    shadowColor: '#ffffffff',
    shadowOpacity: 0.23,
    elevation: 8,
  },
  flag: {
    width: FLAG_SIZE,
    height: FLAG_SIZE,
    borderRadius: FLAG_SIZE / 2,
    marginBottom: 8,
    backgroundColor: '#232425',
    resizeMode: 'cover',
  },
  langLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  testTip: {
    color: '#A1A1AA',
    fontSize: 15,
    textAlign: 'center',
    marginVertical: 18,
  },
  recordBtn: {
    width: '90%',
    height: 48,
    backgroundColor: '#232425',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    alignSelf: 'center',
  },
  recordBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
  nextBtn: {
    width: '90%',
    height: 48,
    backgroundColor: '#4ADE80',
    marginTop:48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  nextBtnText: {
    color: '#181A1B',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LanguageScreen;
