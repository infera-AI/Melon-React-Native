import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';
import { useLanguage } from '../../../contexts/LanguageContext';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';

type CopyrightStatementScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'CopyrightStatement'>;

const CopyrightStatementScreen: React.FC = () => {
  const navigation = useNavigation<CopyrightStatementScreenNavigationProp>();
  const { t } = useLanguage();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image 
              source={require('../../../assets/main/page_return_icon.png')} 
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.title}>{t('copyright_statement.copyright_statement')}</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>
            {t('copyright_statement.content')}
          </Text>
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
  scrollView: {
    flex: 1,
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
    marginHorizontal: normalize(24),
    marginBottom: normalize(24),
    padding: normalize(20),
  },
  contentText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#B0B0B0',
    lineHeight: normalizeFontSize(20),
    letterSpacing: -0.4,
  },
});

export default CopyrightStatementScreen; 