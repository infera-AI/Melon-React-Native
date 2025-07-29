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

const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const { width, height } = require('react-native').Dimensions.get('window');
  const scale = based === 'width' ? width / 375 : height / 812;
  return Math.round(size * scale);
};

const normalizeFontSize = (size: number) => {
  return normalize(size, 'width');
};

type CopyrightStatementScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'CopyrightStatement'>;

const CopyrightStatementScreen: React.FC = () => {
  const navigation = useNavigation<CopyrightStatementScreenNavigationProp>();

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
          <Text style={styles.title}>Copyright Statement</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.contentText}>
            {`Melon Al Headphones Copyright Statement

Article 1 Ownership of Rights 
1.1 This Agreement is between you and Melon Al Headphones ("Melon", "we", "us", or "our") regarding your use of our mobile application and related services.

1.2 All content, features, and functionality of the Melon Al Headphones application, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, are the exclusive property of Melon or its content suppliers and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.

1.3 The compilation of all content in the application is the exclusive property of Melon and is protected by copyright laws.

Article 2 Authorized Use
2.1 You are granted a limited, non-exclusive, non-transferable, and revocable license to use the application for personal, non-commercial purposes only.

2.2 You may not:
- Copy, reproduce, distribute, transmit, broadcast, display, sell, license, or otherwise exploit any content for any commercial purposes
- Modify, adapt, translate, reverse engineer, decompile, disassemble, or create derivative works based on the application
- Remove any copyright, trademark, or other proprietary notices from the application
- Use the application in any manner that could damage, disable, overburden, or impair our servers or networks

Article 3 User Content
3.1 You retain ownership of any content you submit, post, or display on or through the application.

3.2 By submitting content, you grant Melon a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute such content in connection with the application and our business.

Article 4 Copyright Infringement
4.1 If you believe that your copyrighted work has been copied in a way that constitutes copyright infringement, please contact us with the following information:
- A description of the copyrighted work that you claim has been infringed
- A description of where the material is located in the application
- Your contact information
- A statement that you have a good faith belief that the use is not authorized
- A statement that the information is accurate and that you are the copyright owner

Article 5 Updates and Modifications
5.1 We reserve the right to modify this Copyright Statement at any time. Changes will be effective immediately upon posting.

5.2 Your continued use of the application after any changes constitutes acceptance of the new terms.

Article 6 Contact Information
6.1 For questions about this Copyright Statement, please contact us at:
Email: legal@melon.com
Address: [Company Address]

© 2025 Melon. All Rights Reserved.`}
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