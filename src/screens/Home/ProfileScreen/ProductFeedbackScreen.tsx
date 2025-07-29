import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';
import theme from '../../../utils/theme';

const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const { width, height } = require('react-native').Dimensions.get('window');
  const scale = based === 'width' ? width / 375 : height / 812;
  return Math.round(size * scale);
};

const normalizeFontSize = (size: number) => {
  return normalize(size, 'width');
};

type ProductFeedbackScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProductFeedback'>;

const ProductFeedbackScreen: React.FC = () => {
  const navigation = useNavigation<ProductFeedbackScreenNavigationProp>();
  const [feedbackType, setFeedbackType] = useState('Function suggestion');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [_screenshots, _setScreenshots] = useState<string[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleFeedbackTypeSelect = () => {
    // 这里可以打开反馈类型选择弹窗
    Alert.alert(
      '选择反馈类型',
      '请选择反馈类型',
      [
        { text: '功能建议', onPress: () => setFeedbackType('Function suggestion') },
        { text: '问题反馈', onPress: () => setFeedbackType('Problem feedback') },
        { text: '其他', onPress: () => setFeedbackType('Other') },
        { text: '取消', style: 'cancel' },
      ]
    );
  };

  const handleAddScreenshot = () => {
    // 这里可以添加截图功能
    Alert.alert('添加截图', '截图功能待实现');
  };

  const handleSubmit = () => {
    if (!feedbackContent.trim()) {
      Alert.alert('提示', '请输入反馈内容');
      return;
    }
    if (feedbackContent.length < 10) {
      Alert.alert('提示', '反馈内容不能少于10个字');
      return;
    }
    
    // 这里可以提交反馈到服务器
    setShowSuccessModal(true);
  };

  const handleFinish = () => {
    setShowSuccessModal(false);
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
          <Text style={styles.title}>Product Feedback</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Feedback Type */}
        <TouchableOpacity style={styles.feedbackTypeCard} onPress={handleFeedbackTypeSelect}>
          <View style={styles.feedbackTypeContent}>
            <View style={styles.feedbackTypeLeft}>
              <Text style={styles.feedbackTypeTitle}>Feedback type</Text>
            </View>
            <View style={styles.feedbackTypeRight}>
              <Text style={styles.feedbackTypeValue}>{feedbackType}</Text>
              <Image 
                source={require('../../../assets/main/right_arrow_icon.png')} 
                style={styles.arrowIcon}
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Feedback Content */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Feedback content</Text>
          <View style={styles.feedbackContentContainer}>
            <TextInput
              style={styles.feedbackContentInput}
              placeholder="Please describe the problem or suggestion you encountered, no less than 10 words."
              placeholderTextColor="rgba(176, 176, 176, 0.5)"
              value={feedbackContent}
              onChangeText={setFeedbackContent}
              multiline
              textAlignVertical="top"
              numberOfLines={6}
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Contact information</Text>
          <View style={styles.contactInfoContainer}>
            <TextInput
              style={styles.contactInfoInput}
              placeholder="Please enter your mobile phone number or email address so that we can contact you"
              placeholderTextColor="rgba(176, 176, 176, 0.5)"
              value={contactInfo}
              onChangeText={setContactInfo}
              multiline
              textAlignVertical="top"
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Related Screenshots */}
        <View style={styles.sectionContainer}>
          <View style={styles.screenshotHeader}>
            <Text style={styles.sectionTitle}>Related screenshots</Text>
            <Text style={styles.screenshotCount}>9 more</Text>
          </View>
          <View style={styles.screenshotContainer}>
            {/* Screenshot Placeholders */}
            <TouchableOpacity style={styles.screenshotItem} onPress={handleAddScreenshot}>
              <View style={styles.screenshotPlaceholder}>
                <Image source={require('../../../assets/profile/profile_feedback_add.png')} style={styles.addIcon} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.successIconContainer}>
                <View style={styles.successIcon}>
                  <Text style={styles.successIconText}>✓</Text>
                </View>
              </View>
              <Text style={styles.modalTitle}>
                Feedback has been submitted, thank you for your support!
              </Text>
            </View>
            <View style={styles.modalButtons}>
              <View style={styles.modalSeparator} />
              <TouchableOpacity style={styles.modalButton} onPress={handleFinish}>
                <Text style={styles.modalButtonText}>Finish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  feedbackTypeCard: {
    borderRadius: normalize(12),
    marginHorizontal: normalize(24),
    marginBottom: normalize(16),
    padding: normalize(16),
    borderBottomColor: '#3E3E3E',
    borderBottomWidth: 1,
  },
  feedbackTypeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feedbackTypeLeft: {
    flex: 1,
  },
  feedbackTypeTitle: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  feedbackTypeRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedbackTypeValue: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: '#B0B0B0',
    marginRight: normalize(8),
  },
  arrowIcon: {
    width: normalize(20),
    height: normalize(20),
  },
  sectionContainer: {
    marginHorizontal: normalize(24),
    marginBottom: normalize(24),
  },
  sectionTitle: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  feedbackContentContainer: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    padding: normalize(16),
    minHeight: normalize(149),
  },
  feedbackContentInput: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: normalizeFontSize(20),
    letterSpacing: -0.4,
    textAlignVertical: 'top',
  },
  contactInfoContainer: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    padding: normalize(16),
    minHeight: normalize(72),
  },
  contactInfoInput: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: normalizeFontSize(20),
    letterSpacing: -0.4,
    textAlignVertical: 'top',
  },
  screenshotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  screenshotCount: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#B0B0B0',
    letterSpacing: -0.4,
    marginLeft: normalize(8),
  },
  screenshotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(10),
  },
  screenshotItem: {
    width: normalize(75),
    height: normalize(75),
  },
  screenshotPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIcon: {
    width: normalize(27),
    height: normalize(27),
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconLine: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  addIconLineHorizontal: {
    width: normalize(27),
    height: 1,
    backgroundColor: '#FFFFFF',
  },
  addIconLineVertical: {
    width: 1,
    height: normalize(27),
    backgroundColor: '#FFFFFF',
  },
  submitButton: {
    backgroundColor: '#85F380',
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    marginHorizontal: normalize(24),
    marginBottom: normalize(24),
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: 'rgba(12, 12, 13, 0.7)',
    letterSpacing: -0.4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: normalize(327),
    backgroundColor: '#333333',
    borderRadius: normalize(8),
    overflow: 'hidden',
  },
  modalContent: {
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingTop: normalize(12),
    paddingBottom: normalize(16),
  },
  successIconContainer: {
    alignItems: 'center',
    paddingVertical: normalize(4),
    paddingBottom: normalize(8),
  },
  successIcon: {
    width: normalize(48),
    height: normalize(48),
    backgroundColor: theme.primary,
    borderRadius: normalize(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconText: {
    fontSize: normalizeFontSize(24),
    color: theme.background,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: normalizeFontSize(17),
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: normalizeFontSize(22),
    letterSpacing: -0.4,
  },
  modalButtons: {
    flexDirection: 'row',
    height: normalize(44),
  },
  modalSeparator: {
    width: 0.33,
    backgroundColor: '#4F4F4F',
  },
  modalButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 0.33,
    borderTopColor: '#4F4F4F',
  },
  modalButtonText: {
    fontSize: normalizeFontSize(17),
    fontWeight: '600',
    color: '#85F380',
    letterSpacing: -0.4,
  },
});

export default ProductFeedbackScreen; 