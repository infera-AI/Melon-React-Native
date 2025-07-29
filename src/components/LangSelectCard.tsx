// 语言选择组件
/**
 * 使用示例
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView
} from 'react-native';
import PublicModal from '@/components/PublicModal'
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { scaleSize, scaleFont } from '@/utils/scale';

type Props = {
  beforeLanguage?: string; // 主语言
  afterLanguage?: string; // 翻译成什么语言
  // backgroundColor?: string;
  // spinnerSize?: 'small' | 'large';
  // customIndicator?: React.ReactNode;
  // timeout?: number;
  // onTimeout?: () => void;
  // progress?: number;
};

const { width, height } = Dimensions.get('window');

const modalHeight = height * 0.4

const pageLR = 16;

const FullScreenLoader: React.FC<Props> = ({
  beforeLanguage = '',
  afterLanguage = '',
  // color = '#fff',
  // backgroundColor = 'rgba(0,0,0,0.5)',
  // spinnerSize = 'large',
  // customIndicator = null,
  // timeout = null, // ❗超时时间（单位 ms）
  // onTimeout = null, // ❗超时后回调
  // progress = null, // ❗0~1 显示进度条文本
}) => {
  const [langModalVisible, setLangModalVisible] = useState(false);

  const insets = useSafeAreaInsets(); // 获取安全区域距离

  const closeModalFun = () => {
    setLangModalVisible(false)
  }

  useEffect(() => {
    
  }, []);

  return (
    <>
      <View style={styles.langSelectCard}>
        <TouchableOpacity style={styles.langSelectItem} onPress={() => setLangModalVisible(true)}>
          <Text style={styles.langSelectText}>Chinese</Text>
          <Image source={require('../../assets/images/Home_Translate_arrow.png')} style={styles.langSelectArrow}/>
        </TouchableOpacity>
        <View style={styles.langSwitchIconBox}>
          <Image source={require('../../assets/images/Home_Translate_switch.png')} style={styles.langSwitchArrow} resizeMode='contain'/>
        </View>
        <TouchableOpacity style={styles.langSelectItem} onPress={() => setLangModalVisible(true)}>
          <Text style={styles.langSelectText}>English</Text>
          <Image source={require('../../assets/images/Home_Translate_arrow.png')} style={styles.langSelectArrow}/>
        </TouchableOpacity>
      </View>
      {/* 语言选择弹窗：底部弹出，高度400，方便后续自定义 */}
      <PublicModal
        visible={langModalVisible}
        onBackdropPress={() => closeModalFun()}
        renderContent={() => {
          return (
            <View
              style={[
                styles.modalContent,
                {paddingBottom: insets.bottom ? insets.bottom : 16}
              ]}
            >
              <View style={styles.modalTitle}>
                <View style={styles.textView}>
                  <Text
                    style={styles.titleText}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    Language Selection
                  </Text>
                </View>
                <TouchableOpacity onPress={() => closeModalFun()}>
                  <Text>
                    <Ionicons name='close-outline' size={scaleFont(24)} color={'#ffffff'}/>
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalContentView}>
                <ScrollView
                  style={styles.scroll}
                  contentContainerStyle={styles.contentContainer}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.itemView}>
                    
                  </View>
                </ScrollView>
              </View>
            </View>
          )
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  langSelectCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#232325',
    borderRadius: scaleSize(14),
    height: scaleSize(64),
    marginRight: scaleSize(20),
    // paddingVertical: 16,
    paddingHorizontal: scaleSize(16),
  },
  langSelectItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langSelectText: {
    color: '#fff',
    fontSize: scaleFont(15),
    marginRight: scaleSize(8),
  },
  langSelectArrow: {
    width: scaleSize(10),
    aspectRatio: 1.67,
  },
  langSwitchIconBox: {
    width: scaleSize(20),
    alignItems: 'center',
  },
  langSwitchArrow: {
    width: scaleSize(17),
  },
  modalContent: {
    backgroundColor: '#262626',
    borderTopLeftRadius: scaleSize(10),
    borderTopRightRadius: scaleSize(10),
    height: modalHeight,
  },
  modalTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleSize(16),
    paddingVertical: scaleSize(12),
  },
  textView: {
    flex: 1,
    marginRight: scaleSize(10),
  },
  titleText: {
    fontSize: scaleFont(15),
    color: '#ffffff',
  },
  modalContentView: {
    flex: 1,
    backgroundColor: '#ff00ff'
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingHorizontal: pageLR,
    flexGrow: 1,
  },
  itemView: {
    paddingVertical: scaleSize(8),
  },
});

export default FullScreenLoader;
