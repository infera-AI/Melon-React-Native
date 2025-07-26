// Speaker Mode Page
import React, { useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import EStyleSheet from 'react-native-extended-stylesheet';
import Modal from 'react-native-modal';
import FullScreenLoader from '@/components/FullScreenLoader';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator'
import CustomNavigation from '@/components/CustomNavigation';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const pageLR = 16;
const contentWidth = width - pageLR * 2



const ChatScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useLanguage();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(''); // 输入框state

  const insets = useSafeAreaInsets(); // 获取安全区域距离

  // 占位点击事件
  const handlePress = (name: string) => () => {
    // TODO: 实现具体功能
    // console.log(`${name} pressed`);
    setLoading(true)
  };

  return (
    <View style={[
      styles.root,
      {
        paddingBottom: insets.bottom > 0 ? insets.bottom : 16
      }
    ]}>
      <CustomNavigation
        text="Speaker Mode"
        backgroundColor="#181819"
        onBack={() => navigation.goBack()}
      />
      <View style={styles.content}>

      </View>
      {/* 语言选择栏 */}
      <View style={styles.langSelectRow}>
        <View style={styles.langSelectCard}>
            <TouchableOpacity style={styles.langSelectItem} onPress={() => setLangModalVisible(true)}>
            <Text style={styles.langSelectText}>Chinese</Text>
            <Image source={require('../../../assets/images/Home_Translate_arrow.png')} style={styles.langSelectArrow}/>
            </TouchableOpacity>
            <View style={styles.langSwitchIconBox}>
            <Image source={require('../../../assets/images/Home_Translate_switch.png')} style={styles.langSwitchArrow} resizeMode='contain'/>
            </View>
            <TouchableOpacity style={styles.langSelectItem} onPress={() => setLangModalVisible(true)}>
            <Text style={styles.langSelectText}>English</Text>
            <Image source={require('../../../assets/images/Home_Translate_arrow.png')} style={styles.langSelectArrow}/>
            </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.langQuickBtnNew} onPress={handlePress('QuickLang')}>
            <Image source={require('../../../assets/images/SpeakerMode_Write.png')} style={styles.iconQuickLangNew}/>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.langQuickBtnNew, {marginLeft: 10}]} onPress={handlePress('QuickLang')}>
            <Image source={require('../../../assets/images/SpeakerMode_Speak.png')} style={styles.iconQuickLangNew}/>
        </TouchableOpacity>
      </View>
      {/* 语言选择弹窗：底部弹出，高度400，方便后续自定义 */}
      <Modal
        isVisible={langModalVisible}
        onBackdropPress={() => setLangModalVisible(false)}  // 点击背景关闭
        animationIn="slideInUp"
        animationOut="slideOutDown"
        backdropOpacity={0.4}
        backdropTransitionOutTiming={0} // 避免关闭时mask闪
        style={{
          justifyContent: 'flex-end', // 让 modal 停在底部
          margin: 0, // 取消默认 margin，不然内容会上浮
        }}
      >
        <View style={styles.modalContent}>
          <Text>jshjhj</Text>
        </View>
      </Modal>
      <FullScreenLoader
        visible={loading}
        text="请稍后..."
        timeout={5000}
        onTimeout={() => setLoading(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#181819',
  },
  content: {
    flex: 1,
    width: contentWidth,
    marginLeft: pageLR,
    backgroundColor: '#262626',
    borderRadius: 10,
  },
  langSelectRow: {
    width: contentWidth,
    marginLeft: pageLR,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  langSelectCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232325',
    borderRadius: 14,
    height: 54,
    marginRight: 16,
    // paddingVertical: 16,
    paddingHorizontal: 0,
  },
  langSelectItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langSelectText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 14,
    fontWeight: '500',
  },
  langSelectArrow: {
    width: 12,
    aspectRatio: 1.67,
  },
  langSwitchIconBox: {
    width: 40,
    alignItems: 'center',
  },
  langSwitchArrow: {
    width: 22,
  },
  langQuickBtnNew: {
    width: 48,
    height: 48,
    backgroundColor: '#333333',
    borderRadius: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconQuickLangNew: {
    width: 46,
    height: 46,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 300,
  }
});

export default ChatScreen;
