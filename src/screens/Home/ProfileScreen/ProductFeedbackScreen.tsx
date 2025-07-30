import React, { useState, useEffect } from 'react';
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
import { submitFeedback, getFeedbackTypeChoices } from '../../../api/profile/profile';
import { launchImageLibrary } from 'react-native-image-picker';
import { useMessageModal } from '@/contexts/MessageModalContext';

const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const { width, height } = require('react-native').Dimensions.get('window');
  const scale = based === 'width' ? width / 375 : height / 812;
  return Math.round(size * scale);
};

const normalizeFontSize = (size: number) => {
  return normalize(size, 'width');
};

type ProductFeedbackScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'ProductFeedback'>;

interface ScreenshotItem {
  uri: string;
  name: string;
  type: string;
}

const ProductFeedbackScreen: React.FC = () => {
  const navigation = useNavigation<ProductFeedbackScreenNavigationProp>();
  const [feedbackType, setFeedbackType] = useState('Function suggestion');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [feedbackTypes, setFeedbackTypes] = useState<any[]>([]);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const { show } = useMessageModal();

  // 获取反馈类型列表
  const fetchFeedbackTypes = async () => {
    try {
      const response = await getFeedbackTypeChoices();
      console.log('获取反馈类型列表成功:', response);
      setFeedbackTypes(response);
      setFeedbackType(response[0][0]);
    } catch (error) {
      console.error('获取反馈类型列表失败:', error);
    }
  };

  useEffect(() => {
    fetchFeedbackTypes();
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleFeedbackTypeSelect = () => {
    setShowTypeSelector(true);
  };

  const handleTypeSelect = (type: string) => {
    setFeedbackType(type);
    setShowTypeSelector(false);
  };

  const handleCloseTypeSelector = () => {
    setShowTypeSelector(false);
  };

  // 获取可用的反馈类型选项
  const getTypeOptions = () => {
    if (feedbackTypes.length > 0) {
      return feedbackTypes.map(type => ({
        value: type[0],
        label: type[1]
      }));
    } else {
      // 默认选项
      return [
        { value: 'Function suggestion', label: '功能建议' },
        { value: 'Problem feedback', label: '问题反馈' },
        { value: 'Other', label: '其他' }
      ];
    }
  };

  const handleAddScreenshot = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 9, // 最多选择9张
        includeBase64: false,
      });

      if (result.didCancel) {
        console.log('用户取消选择图片');
        return;
      }

      if (result.errorCode) {
        console.error('选择图片失败:', result.errorMessage);
        Alert.alert('错误', '选择图片失败，请重试');
        return;
      }

      if (result.assets) {
        const newScreenshots = [...screenshots];
        result.assets.forEach((asset) => {
          if (newScreenshots.length < 9) {
            newScreenshots.push({
              uri: asset.uri || '',
              name: asset.fileName || 'screenshot',
              type: asset.type || 'image/jpeg',
            });
          }
        });
        console.log(newScreenshots,'newScreenshots')
        setScreenshots(newScreenshots);
      }
    } catch (error) {
      console.error('添加截图失败:', error);
      Alert.alert('错误', '添加截图失败，请重试');
    }
  };

  const handleRemoveScreenshot = (index: number) => {
    const newScreenshots = screenshots.filter((_, i) => i !== index);
    setScreenshots(newScreenshots);
  };

  const handleSubmit = async () => {
    if (!feedbackContent.trim()) {
      show({message: 'Please enter feedback content'});
      return;
    }
    if (feedbackContent.length < 10) {
      show({message: 'Feedback content cannot be less than 10 characters'});
      return;
    }

    if (!contactInfo.trim()) {
      show({message: 'Please enter contact information'});
      return;
    }
    
    try {
      // 准备提交数据
      const submitData: any = {
        type: feedbackType,
        content: feedbackContent,
        contact: contactInfo,
      };

      // 如果有截图，添加到提交数据中
      if (screenshots.length > 0) {
        submitData.related_shortcut_imgs = screenshots;
      }
      console.log(submitData,'submitData')
      
      // 提交反馈到服务器
      const response = await submitFeedback(submitData);
      console.log(response,'response')
      setShowSuccessModal(true);
    } catch (error) {
      console.error('提交反馈失败:', error);
      Alert.alert('提交失败', '反馈提交失败，请重试');
    }
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
              numberOfLines={8}
              scrollEnabled={false}
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
              numberOfLines={4}
              scrollEnabled={false}
            />
          </View>
        </View>

        {/* Related Screenshots */}
        <View style={styles.sectionContainer}>
          <View style={styles.screenshotHeader}>
            <Text style={styles.sectionTitle}>Related screenshots</Text>
            <Text style={styles.screenshotCount}>{screenshots.length-9 > 0 ? `${screenshots.length-9} more` : ''}</Text>
          </View>
          <View style={styles.screenshotContainer}>
          {screenshots.length < 9 && (
              <TouchableOpacity style={styles.screenshotItem} onPress={handleAddScreenshot}>
                <View style={styles.screenshotPlaceholder}>
                  <Image source={require('../../../assets/profile/profile_feedback_add.png')} style={styles.addIcon} />
                </View>
              </TouchableOpacity>
            )}
            {screenshots.map((item, index) => (
              <View key={index} style={styles.screenshotItem}>
                 <View style={styles.screenshotPlaceholder}>
                   <Image source={{ uri: item.uri }} style={styles.screenshotImage} />
                 </View>
                <TouchableOpacity
                  style={styles.screenshotDeleteButton}
                  onPress={() => handleRemoveScreenshot(index)}
                >
                  <Text style={styles.screenshotDeleteText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
       
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

      {/* Type Selector Modal */}
      <Modal
        visible={showTypeSelector}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseTypeSelector}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.typeSelectorContainer}>
            <View style={styles.typeSelectorHeader}>
              <Text style={styles.typeSelectorTitle}>选择反馈类型</Text>
              <TouchableOpacity onPress={handleCloseTypeSelector}>
                <Text style={styles.typeSelectorClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.typeSelectorContent}>
              {getTypeOptions().map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.typeOption,
                    feedbackType === option.value && styles.typeOptionSelected
                  ]}
                  onPress={() => handleTypeSelect(option.value)}
                >
                  <Text style={[
                    styles.typeOptionText,
                    feedbackType === option.value && styles.typeOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {feedbackType === option.value && (
                    <View style={styles.typeOptionCheck}>
                      <Text style={styles.typeOptionCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
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
    marginHorizontal: normalize(24),
    marginBottom: normalize(16),
    paddingVertical: normalize(16),
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
    marginBottom: normalize(12),
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
    minHeight: normalize(120),
    paddingTop: 0,
    paddingBottom: 0,
  },
  contactInfoContainer: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    padding: normalize(16),
    minHeight: normalize(100),
  },
  contactInfoInput: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: '#FFFFFF',
    lineHeight: normalizeFontSize(20),
    letterSpacing: -0.4,
    textAlignVertical: 'top',
    minHeight: normalize(80),
    paddingTop: 0,
    paddingBottom: 0,
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
    position: 'relative',
  },
  screenshotImage: {
    width: normalize(30),
    height: normalize(59),
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
  // Type Selector Modal styles
  typeSelectorContainer: {
    width: normalize(327),
    backgroundColor: '#333333',
    borderRadius: normalize(8),
    overflow: 'hidden',
  },
  typeSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingTop: normalize(12),
    paddingBottom: normalize(8),
  },
  typeSelectorTitle: {
    fontSize: normalizeFontSize(17),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  typeSelectorClose: {
    fontSize: normalizeFontSize(20),
    color: '#B0B0B0',
  },
  typeSelectorContent: {
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(16),
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: normalize(12),
    borderBottomWidth: 1,
    borderBottomColor: '#4F4F4F',
  },
  typeOptionSelected: {
    borderRadius: normalize(8),
  },
  typeOptionText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  typeOptionTextSelected: {
    fontWeight: '600',
    color: '#85F380',
  },
  typeOptionCheck: {
    width: normalize(20),
    height: normalize(20),
    backgroundColor: '#85F380',
    borderRadius: normalize(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeOptionCheckText: {
    fontSize: normalizeFontSize(14),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  screenshotDeleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    // backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: normalize(10),
    width: normalize(20),
    height: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  screenshotDeleteText: {
    fontSize: normalizeFontSize(12),
    color: '#FFFFFF',
    fontWeight: '400',
  },
});

export default ProductFeedbackScreen; 