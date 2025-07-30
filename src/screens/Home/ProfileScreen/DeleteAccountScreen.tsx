import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from './ProfileNavigator';
import { deleteAccount } from '../../../api/profile/profile';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const normalize = (size: number, based: 'width' | 'height' = 'width') => {
  const newSize = based === 'height' ? size * screenHeight / 812 : size * screenWidth / 375;
  return Math.round(newSize);
};

const normalizeFontSize = (size: number) => {
  const newSize = size * screenWidth / 375;
  return Math.min(Math.round(newSize), size);
};

type DeleteAccountScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'DeleteAccount'>;

const DeleteAccountScreen: React.FC = () => {
  const navigation = useNavigation<DeleteAccountScreenNavigationProp>();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleDeleteAccount = async () => {
    // 显示确认对话框
    Alert.alert(
      '确认注销账户',
      '注销账户后，您的所有数据将被永久删除且无法恢复。此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确认注销', 
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              
              // 这里需要从服务器获取 action_token
              // 通常需要先进行密码验证或其他身份验证
              const actionToken = 'your_action_token_here'; // 实际使用时需要从服务器获取
              
              const response = await deleteAccount({
                action_token: actionToken
              });

              console.log('账户注销成功:', response);
              Alert.alert(
                '注销成功', 
                '您的账户已成功注销。感谢您使用我们的服务。',
                [
                  { 
                    text: '确定', 
                    onPress: () => {
                      // 这里可以跳转到登录页面或退出应用
                      // navigation.reset({
                      //   index: 0,
                      //   routes: [{ name: 'Login' }],
                      // });
                    }
                  }
                ]
              );

            } catch (error) {
              console.error('账户注销失败:', error);
              Alert.alert('失败', '账户注销失败，请稍后重试');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image 
            source={require('../../../assets/main/page_return_icon.png')} 
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.title}>注销账户</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.warningContainer}>
          <Image 
            source={require('../../../assets/main/warning_icon.png')} 
            style={styles.warningIcon}
          />
          <Text style={styles.warningTitle}>⚠️ 重要提醒</Text>
          <Text style={styles.warningText}>
            注销账户是一个不可逆的操作，请仔细阅读以下内容：
          </Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>注销后会发生什么？</Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>您的账户将被永久删除</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>所有个人数据将被清除</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>声纹信息将被删除</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>历史记录将被清空</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={styles.infoText}>此操作无法撤销</Text>
          </View>
        </View>

        <View style={styles.considerContainer}>
          <Text style={styles.considerTitle}>在注销前，请考虑：</Text>
          <View style={styles.considerItem}>
            <Text style={styles.considerBullet}>•</Text>
            <Text style={styles.considerText}>是否已备份重要数据</Text>
          </View>
          <View style={styles.considerItem}>
            <Text style={styles.considerBullet}>•</Text>
            <Text style={styles.considerText}>是否已取消相关订阅</Text>
          </View>
          <View style={styles.considerItem}>
            <Text style={styles.considerBullet}>•</Text>
            <Text style={styles.considerText}>是否已通知相关联系人</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.deleteButton,
            isDeleting && styles.deleteButtonDisabled
          ]} 
          onPress={handleDeleteAccount}
          disabled={isDeleting}
        >
          <Text style={[
            styles.deleteButtonText,
            isDeleting && styles.deleteButtonTextDisabled
          ]}>
            {isDeleting ? '注销中...' : '确认注销账户'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={handleBack}
        >
          <Text style={styles.cancelButtonText}>取消</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginTop: normalize(10),
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
  headerSpacer: {
    width: normalize(40),
  },
  title: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  warningContainer: {
    backgroundColor: '#FF6B6B',
    borderRadius: normalize(12),
    padding: normalize(16),
    marginBottom: normalize(24),
    alignItems: 'center',
  },
  warningIcon: {
    width: normalize(24),
    height: normalize(24),
    marginBottom: normalize(8),
  },
  warningTitle: {
    fontSize: normalizeFontSize(16),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: normalize(8),
  },
  warningText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: normalize(20),
  },
  infoContainer: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    padding: normalize(16),
    marginBottom: normalize(16),
  },
  infoTitle: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: normalize(12),
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: normalize(8),
  },
  infoBullet: {
    fontSize: normalizeFontSize(14),
    color: '#FF6B6B',
    marginRight: normalize(8),
    marginTop: normalize(2),
  },
  infoText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: '#B0B0B0',
    flex: 1,
    lineHeight: normalize(20),
  },
  considerContainer: {
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    padding: normalize(16),
    marginBottom: normalize(32),
  },
  considerTitle: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: normalize(12),
  },
  considerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: normalize(8),
  },
  considerBullet: {
    fontSize: normalizeFontSize(14),
    color: '#85F380',
    marginRight: normalize(8),
    marginTop: normalize(2),
  },
  considerText: {
    fontSize: normalizeFontSize(14),
    fontWeight: '400',
    color: '#B0B0B0',
    flex: 1,
    lineHeight: normalize(20),
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: normalize(12),
    paddingVertical: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(16),
  },
  deleteButtonDisabled: {
    backgroundColor: '#3E3E3E',
    opacity: 0.5,
  },
  deleteButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  deleteButtonTextDisabled: {
    color: '#B0B0B0',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderRadius: normalize(12),
    paddingVertical: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3E3E3E',
  },
  cancelButtonText: {
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
    color: '#B0B0B0',
    letterSpacing: -0.4,
  },
});

export default DeleteAccountScreen;