import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Dimensions,
  Image
} from 'react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import LinearGradient from 'react-native-linear-gradient'; // 渐变色
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // 安全区
// import EStyleSheet from 'react-native-extended-stylesheet';
import Modal from 'react-native-modal';
import FullScreenLoader from '@/components/FullScreenLoader';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator'
import { useMessageModal } from '@/contexts/MessageModalContext';

const { width } = Dimensions.get('window');
const pageLRPadding = 16 // 页面左右间距
const numColumns = 2;
const gutter = 12; // 每行item 的间距
const itemWidth = (width - pageLRPadding * 2 - gutter) / numColumns;

const TranslateScreen: React.FC = () => {
  const { show } = useMessageModal();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useLanguage();
  const [langModalVisible, setLangModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(''); // 输入框state
  const insets = useSafeAreaInsets(); // 获取安全区高度

  // 占位点击事件
  const handlePress = (name: string) => () => {
    // TODO: 实现具体功能
    // console.log(`${name} pressed`);
    if (name === 'SpeakerMode') {
      navigation.navigate('Chat')
    } else if (name === 'HeadphoneMode') {
      navigation.navigate('HeadphoneMode')
    } else if (name === 'ListeningMode') {
      navigation.navigate('ListeningMode')
    } else if (name === 'DocumentTranslation') {
      navigation.navigate('DocumentTranslation')
    } else if (name === 'AudioTranslation') {
      navigation.navigate('AudioTranslation')
    } else if (name === 'ImageTranslation') {
      navigation.navigate('ImageTranslation')
    } else if (name === 'OralPractice') {
      navigation.navigate('OralPractice')
    }
    // setLoading(true)

    // show({
    //   message: '211212'
    // })
  };

  return (
    <View style={styles.root}>
      {/* 顶部安全区占位，防止内容被遮挡 */}
      <View style={{ height: insets.top }} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer} keyboardShouldPersistTaps="handled">
        {/* 头部卡片，优化渐变色 */}
        <TouchableOpacity
           onPress={handlePress('OralPractice')}
           activeOpacity={0.85}
        >
          <View style={styles.headerCard}>
            <LinearGradient
              colors={['#9CEB90', '#9CBEFD']}
              start={{ x: 0.145, y: 0.2 }}
              end={{ x: 0.18, y: 1 }}
              style={styles.linearGradientBg}
            ></LinearGradient>
            <View style={styles.headerCardContent}>
              {/* 头像 */}
              <View style={styles.avatarPlaceholder}>
                <Image
                  source={require('../../../../assets/images/Home_card_head.png')}
                  style={styles.headImg}
                  resizeMode='cover'
                />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>Melon</Text>
                <Text style={styles.headerDesc}>Supports multilingual AI conversations{"\n"}Oral Practice & Knowledge Q&A</Text>
              </View>
              {/* 聊天图标*/}
              <View
                style={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                }}
              >
                <Image source={require('../../../../assets/images/Home_Translate_Msg.png')} style={styles.chatBubbleIcon}/>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* 四个主菜单 */}
        <Text style={styles.sectionTitle}>Conversation Translation Modes</Text>
        <View style={styles.modeGridBox}>
          <TouchableOpacity style={styles.modeCard} onPress={handlePress('SpeakerMode')}>
            <View style={styles.modeIconBox}>
              <Image source={require('../../../../assets/images/Home_Translate_Voice.png')} style={styles.iconSpeaker}/>
            </View>
            <Text style={styles.modeCardText}>Speaker Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modeCard} onPress={handlePress('HeadphoneMode')}>
            <View style={styles.modeIconBox}>
              <Image source={require('../../../../assets/images/Home_Translate_erji.png')} style={styles.iconSpeaker}/>
            </View>
            <Text style={styles.modeCardText}>Headphone Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modeCard} onPress={handlePress('ListeningMode')}>
            <View style={styles.modeIconBox}>
              <Image source={require('../../../../assets/images/Home_Translate_lingdang.png')} style={styles.iconSpeaker}/>
            </View>
            <Text style={styles.modeCardText}>Listening Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modeCard} onPress={handlePress('OnlineCall')}>
            <View style={styles.modeIconBox}>
              <Image source={require('../../../../assets/images/Home_Translate_video.png')} style={styles.iconSpeaker}/>
            </View>
            <Text style={styles.modeCardText}>Online Call</Text>
          </TouchableOpacity>
        </View>

        {/* 翻译工具 */}
        <Text style={styles.sectionTitle}>Translation Tools</Text>
        <View style={styles.toolsRowNoBg}>
          <View style={styles.toolBtnNoBgFirst}>
            <TouchableOpacity activeOpacity={0.6} style={styles.toolBtnNoBgContent} onPress={handlePress('DocumentTranslation')}>
              <Image source={require('../../../../assets/images/Home_Teanslate_Document.png')} style={styles.iconDocNoBg}/>
              <Text style={styles.toolTextNoBg}>{`Document\nTranslation`}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity activeOpacity={0.6} style={styles.toolBtnNoBgCenter} onPress={handlePress('AudioTranslation')}>
            <Image source={require('../../../../assets/images/Home_Teanslate_MP3.png')} style={styles.iconDocNoBg}/>
            <Text style={styles.toolTextNoBg}>{`Audio\nTranslation`}</Text>
          </TouchableOpacity>
          <View style={styles.toolBtnNoBgLast}>
            <TouchableOpacity activeOpacity={0.6} style={styles.toolBtnNoBgContent} onPress={handlePress('ImageTranslation')}>
              <Image source={require('../../../../assets/images/Home_Teanslate_Image.png')} style={styles.iconDocNoBg}/>
              <Text style={styles.toolTextNoBg}>{`Image\nTranslation`}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 语言选择栏 */}
        <View style={styles.langSelectRow}>
          <View style={styles.langSelectCard}>
            <TouchableOpacity style={styles.langSelectItem} onPress={() => setLangModalVisible(true)}>
              <Text style={styles.langSelectText}>Chinese</Text>
              <Image source={require('../../../../assets/images/Home_Translate_arrow.png')} style={styles.langSelectArrow}/>
            </TouchableOpacity>
            <View style={styles.langSwitchIconBox}>
              <Image source={require('../../../../assets/images/Home_Translate_switch.png')} style={styles.langSwitchArrow} resizeMode='contain'/>
            </View>
            <TouchableOpacity style={styles.langSelectItem} onPress={() => setLangModalVisible(true)}>
              <Text style={styles.langSelectText}>English</Text>
              <Image source={require('../../../../assets/images/Home_Translate_arrow.png')} style={styles.langSelectArrow}/>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.langQuickBtnNew} onPress={handlePress('QuickLang')}>
            <Image source={require('../../../../assets/images/home_Tab_Translate_active.png')} style={styles.iconQuickLangNew}/>
          </TouchableOpacity>
        </View>

        {/* 输入框 */}
        <View style={styles.voiceInputBar}>
          <TextInput
            style={styles.voiceInputTextInput}
            placeholder="Press and hold the voice button to speak, release to send."
            placeholderTextColor="#B0B0B080"
            value={inputValue}
            onChangeText={setInputValue}
            multiline
            underlineColorAndroid="transparent"
          />
        </View>
      </ScrollView>
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
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    paddingHorizontal: pageLRPadding,
    paddingBottom: 32,
  },
  headerCard: {
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  linearGradientBg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  headerCardContent: {
    flex: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: '50%',
    backgroundColor: '#C1E3D6',
    marginRight: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headImg: {
    width: '100%',
    height: '100%',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#222',
  },
  headerDesc: {
    fontSize: 14,
    color: '#222',
    marginTop: 6,
  },
  chatBubbleIcon: {
    width: 22,
    height: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
    marginTop: 24,
  },
  // 主菜单左对齐
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 8,
  },
  modeBtnLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 16,
    marginRight: 24,
    paddingVertical: 10,
    paddingHorizontal: 0,
    minWidth: 140,
  },
  modeText: {
    color: '#B6F09C',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: 'bold',
  },
  iconSpeaker: {
    width: 50,
    height: 50,
  },
  toolsRowNoBg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  toolBtnNoBgFirst: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
    // backgroundColor: 'blue',
  },
  toolBtnNoBgCenter: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    // backgroundColor: 'blue',
  },
  toolBtnNoBgLast: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    flex: 1,
  },
  toolBtnNoBgContent: {
    flexDirection: 'column',
    alignItems: 'center',
    // backgroundColor: '#ff00ff',
  },
  toolTextNoBg: {
    color: '#999999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
  },
  iconDocNoBg: {
    width: 48,
    height: 48,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  langBtn: {
    flex: 1,
    backgroundColor: '#232325',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 10,
  },
  langText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  langSwitchIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#B6F09C',
    marginHorizontal: 8,
  },
  langQuickBtn: {
    marginLeft: 8,
    backgroundColor: '#B6F09C',
    borderRadius: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconQuickLang: {
    width: 20,
    height: 20,
    backgroundColor: '#232325',
    borderRadius: 4,
  },
  voiceInputBar: {
    backgroundColor: '#232325',
    borderRadius: 14,
    padding: 20,
    marginTop: 14,
    marginBottom: 16,
  },
  voiceInputTextInput: {
    color: '#ccc',
    height: 100,
    fontSize: 20,
    minHeight: 40,
    padding: 0,
    margin: 0,
    backgroundColor: 'transparent',
    textAlignVertical: 'top',
  },
  modeGridBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 18,
    gap: 12,
  },
  modeCard: {
    width: itemWidth,
    position: 'relative',
    overflow: 'hidden',
    // aspectRatio: 1.65,
    backgroundColor: '#262626',
    borderRadius: 12,
    // alignItems: 'center',
    // justifyContent: 'center',
    padding: 12,
  },
  modeIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modeCardText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    // textAlign: 'center',
    marginBottom: 2,
  },
  langSelectRow: {
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
    height: 64,
    marginRight: 20,
    // paddingVertical: 16,
    paddingHorizontal: 16,
  },
  langSelectItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langSelectText: {
    color: '#fff',
    fontSize: 18,
    marginRight: 14,
  },
  langSelectArrow: {
    width: 14,
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
    width: 64,
    height: 64,
    backgroundColor: '#333333',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconQuickLangNew: {
    width: 32,
    height: 32,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    height: 300,
  }
});

export default TranslateScreen;
