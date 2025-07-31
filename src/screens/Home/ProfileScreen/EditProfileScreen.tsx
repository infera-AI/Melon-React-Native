import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  TextInput,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../store';
import theme from '../../../utils/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary, launchCamera, ImagePickerResponse, ImageLibraryOptions } from 'react-native-image-picker';
import { updateProfile } from '../../../api/profile/profile';
import { AvatarFile } from '../../../api/profile/types';
import { useMessageModal } from '../../../contexts/MessageModalContext';
import { useLanguage } from '../../../contexts/LanguageContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const newSize = based === 'height' ? size * screenHeight / 812 : size * screenWidth / 375;
  return Math.round(newSize);
};

const normalizeFontSize = (size: number) => {
  const newSize = size * screenWidth / 375;
  return Math.min(Math.round(newSize), size);
};


const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const userInfo = useUserStore((state) => state.userInfo);
  const updateUserInfo = useUserStore((state) => state.updateUserInfo);
  const { t } = useLanguage();
  
  const [name, setName] = useState(userInfo?.username || '');
  const [avatar, setAvatar] = useState(userInfo?.avatar_url || '');
  const [avatarFile, setAvatarFile] = useState<AvatarFile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { show } = useMessageModal ();

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera access to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true;
    }
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs storage access to select photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true;
    }
  };

  const handleImagePicker = (type: 'camera' | 'library') => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
      includeBase64: false,
    };

    const handleResponse = (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        show({message: t('edit_profile.failed_to_pick_image')});
      } else if (response.assets && response.assets[0]) {
        const selectedImage = response.assets[0];
        if (selectedImage.uri) {
          uploadAvatar(selectedImage.uri);
          setAvatarFile({
            uri: selectedImage.uri,
            name: selectedImage.fileName || 'avatar.jpg',
            type: selectedImage.type || 'image/jpeg',
          });
        }
      }
    };

    if (type === 'camera') {
      requestCameraPermission().then((hasPermission) => {
        if (hasPermission) {
          launchCamera(options, handleResponse);
        } else {
          show({message: t('edit_profile.camera_permission_required')});
        }
      });
    } else {
      requestStoragePermission().then((hasPermission) => {
        if (hasPermission) {
          launchImageLibrary(options, handleResponse);
        } else {
          show({message: t('edit_profile.storage_permission_required')});
        }
      });
    }
  };

  const uploadAvatar = async (imageUri: string) => {
    setIsUploading(true);
    try {
      // 这里应该调用实际的图片上传API
      // 目前先模拟上传过程
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 模拟上传成功，返回新的头像URL
      const newAvatarUrl = imageUri; // 实际应该是服务器返回的URL
      setAvatar(newAvatarUrl);
      
      show({message: t('edit_profile.avatar_updated_successfully')});
    } catch (error) {
      console.error('Upload failed:', error);
      show({message: t('edit_profile.failed_to_upload_avatar')});
    } finally {
      setIsUploading(false);
    }
  };

  const handleChangeAvatar = () => {
    handleImagePicker('library')
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 调用更新个人信息API
      await updateProfile({
        username: name,
        avatar_file: avatarFile as AvatarFile, // 这里应该是文件路径或文件对象
      });
      
      // 更新本地状态
      updateUserInfo({ 
        username: name, 
        avatar_url: avatar 
      });
      navigation.goBack();
    } catch (error) {
      console.error('保存失败:', error);
      show({message: t('edit_profile.failed_to_save_profile')});
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top' ,'bottom']}>      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image 
            source={require('../../../assets/main/page_return_icon.png')} 
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('edit_profile.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* 头像区域 */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Image 
              source={
                avatar 
                  ? { uri: avatar } 
                  : require('../../../assets/profile/profile_default_avatar.png')
              } 
              style={styles.avatarImage}
            />
            <TouchableOpacity 
              style={[styles.cameraButton, isUploading && styles.cameraButtonDisabled]} 
              onPress={handleChangeAvatar}
              disabled={isUploading}
            >
              <View style={styles.cameraIcon}>
                <Image 
                  source={require('../../../assets/profile/profile_camera_icon.png')} 
                  style={styles.cameraIcon}
                />
              </View>
            </TouchableOpacity>
            {isUploading && (
              <View style={styles.uploadingOverlay}>
                <Text style={styles.uploadingText}>{t('edit_profile.uploading')}</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.changeAvatarText}>{t('edit_profile.change_profile_picture')}</Text>
      </View>

      {/* 姓名输入区域 */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>{t('edit_profile.name')}</Text>
        <View style={styles.inputCard}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder={t('edit_profile.enter_your_name')}
              placeholderTextColor="#B3B3B3"
              autoFocus={false}
            />
          </View>
        </View>
      </View>

      {/* 保存按钮 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.saveButton, (!name.trim() || isSaving) && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={!name.trim() || isSaving}
        >
          <Text style={[styles.saveButtonText, (!name.trim() || isSaving) && styles.saveButtonTextDisabled]}>
            {isSaving ? t('edit_profile.saving') : t('edit_profile.save')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
    paddingHorizontal: normalize(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(20),
    marginBottom: normalize(32),
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
  headerTitle: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSpacer: {
    width: normalize(40),
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: normalize(32),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: normalize(16),
    alignItems: 'center',
  },
  avatarPlaceholder: {
    position: 'relative',
    width: normalize(120),
    height: normalize(120),
    borderRadius: normalize(60),
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: normalize(120),
    height: normalize(120),
    borderRadius: normalize(60),
  },
  avatarText: {
    fontSize: normalizeFontSize(48),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cameraButton: {
    position: 'absolute',
    bottom: normalize(0),
    right: normalize(0),
    width: normalize(40),
    height: normalize(40),
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: normalize(1),
    borderColor: theme.primary,
    zIndex: 10,
  },
  cameraButtonDisabled: {
    opacity: 0.5,
  },
  cameraIcon: {
    width: normalize(24),
    height: normalize(24),
  },
  cameraText: {
    fontSize: normalizeFontSize(16),
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(60),
  },
  uploadingText: {
    color: '#FFFFFF',
    fontSize: normalizeFontSize(12),
    fontWeight: '500',
  },
  changeAvatarText: {
    fontSize: normalizeFontSize(12),
    color: '#B3B3B3',
    textAlign: 'center',
  },
  inputSection: {
    marginBottom: normalize(32),
  },
  inputLabel: {
    fontSize: normalizeFontSize(15),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: normalize(10),
    left: normalize(4),
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
  },
  inputContainer: {
    flex: 1,
  },
  textInput: {
    fontSize: normalizeFontSize(15),
    color: '#FFFFFF',
    fontWeight: '500',
    height: normalize(56, 'height'),
  },
  arrowContainer: {
    width: normalize(24),
    height: normalize(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcon: {
    width: normalize(20),
    height: normalize(20),
  },
  buttonContainer: {
    position: 'absolute',
    bottom: normalize(0),
    left: normalize(24),
    right: normalize(24),
  },
  saveButton: {
    backgroundColor: '#85F380',
    borderRadius: normalize(12),
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#3E3E3E',
  },
  saveButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '500',
    color: 'rgba(12, 12, 13, 0.7)',
  },
  saveButtonTextDisabled: {
    color: '#B3B3B3',
  },
});

export default EditProfileScreen; 