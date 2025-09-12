import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../ProfileNavigator';
import theme from '@/utils/theme';
import { normalize, normalizeFontSize } from '@/utils/stylesUtil';
import { SafeAreaView } from 'react-native-safe-area-context';
import CommonModal from '@/components/CommonModal';
import { getAllMaterials } from '@/api/profile/profile';
import { useVoiceStore } from '@/store/modules/voice.store';
import { deleteMaterials } from '@/api/profile/profile';
import FullScreenLoader from '@/components/FullScreenLoader';
import { useLanguage } from '@/contexts/LanguageContext';

type AudioMaterialLibraryScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'AudioMaterialLibrary'>;

const AudioMaterialLibraryScreen: React.FC = () => {
  const navigation = useNavigation<AudioMaterialLibraryScreenNavigationProp>();
  const { t } = useLanguage();
  const [showAddModal, setShowAddModal] = useState(false);
  const { materials, setMaterials, setMaterialsId, materialsName, setMaterialsName } = useVoiceStore();
  const [isLoading, setIsLoading] = useState(false);
  const handleBack = () => {
    navigation.reset({ index: 0, routes: [{ name: 'VoiceprintManagementList' }] });
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleMaterialPress = (fileList: any) => {
    const { file_list, name_list } = fileList;
    const files = file_list.map((file: string, index: number) => {
      return {
        uri: file,
        name: name_list[index],
      }
    });
    console.log('Select material:', fileList);
    setMaterials(files);
    setMaterialsId(fileList.id);
    setMaterialsName(fileList.name);
    navigation.navigate('VoiceprintMaterialCreate');
  };


  const [list, setList] = useState<any[]>([]);

  const handleDeleteMaterial = async (id: number) => {
    console.log('Delete material:', id);
    setIsLoading(true);
    const res = await deleteMaterials({
      id_list: [id],
    });
    getMaterialsRequest()
    setIsLoading(false);
  };


  const getMaterialsRequest = async () => {
    setIsLoading(true);
    const res = await getAllMaterials();
    console.log(res, 'res');
    setList(res.data_list || []);
    setIsLoading(false);
  };

  useEffect(() => {
    getMaterialsRequest();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* 导航栏 */}
      <View style={styles.navBar}>
        <Text style={styles.titleText}>{t('music.audio_materials')}</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image
            source={require('@/assets/main/page_return_icon.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
      </View>

      {/* 素材列表 */}
      {list.length > 0 && <View style={styles.materialListContainer}>
        <ScrollView style={styles.materialList} showsVerticalScrollIndicator={false}>
          <View style={styles.materialListContent}>

            {list.map((material) => (
              <TouchableOpacity
                key={material.id}
                style={styles.materialItem}
                onPress={() => handleMaterialPress(material)}
              >
                <View style={styles.materialContent}>
                  <View style={styles.materialInfo}>
                    <Image
                      source={require('@/assets/profile/voiceprint_dir_icon.png')}
                      style={styles.materialIcon}
                    />
                    <Text style={styles.materialName}>{material.name}</Text>
                  </View>
                  <TouchableOpacity style={styles.materialDelete} onPress={() => handleDeleteMaterial(material.id)}>
                    <Image
                      source={require('@/assets/music/music_delete_icon.png')}
                      style={styles.materialArrow}
                    />
                    tintColor={theme.textPrimary}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        {/* 添加按钮 */}
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>{t('music.add')}</Text>
        </TouchableOpacity>
      </View>}

      {list.length === 0 && <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('music.no_materials')}</Text>
      </View>}

      <CommonModal visible={showAddModal} onClose={() => { setShowAddModal(false) }} config={{
        title: t('music.add_materials'),
        content: t('music.supported_formats_description'),
        buttons: [
          {
            text: t('music.add_file'),
            onPress: () => { navigation.navigate('VoiceprintMaterialCreate') },
            type: 'border' as const,
          },
          {
            text: t('music.direct_recording'),
            onPress: () => { navigation.navigate('VoiceprintMaterialCreate') },
            type: 'primary',
          },
        ],
      }} />
      <FullScreenLoader
        visible={isLoading}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: normalize(24),
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(12),
    marginTop: normalize(17),
  },
  timeText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.4,
    lineHeight: normalize(20),
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(4),
  },
  signalIcon: {
    width: normalize(17),
    height: normalize(11),
    backgroundColor: '#FFFFFF',
  },
  wifiIcon: {
    width: normalize(16),
    height: normalize(11),
    backgroundColor: '#FFFFFF',
  },
  batteryIcon: {
    width: normalize(25),
    height: normalize(12),
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: normalize(40),
    marginTop: normalize(17),
  },
  titleText: {
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: normalize(21),
  },
  backButton: {
    position: 'absolute',
    left: 0,
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
  materialListContainer: {
    marginTop: normalize(18),
    justifyContent: 'space-between',
    flex: 1,
  },
  materialList: {
    width: "100%",
    marginBottom: normalize(16),
  },
  materialListContent: {
    paddingHorizontal: normalize(16),
    flex: 1,
    borderRadius: normalize(12),
    backgroundColor: 'rgba(38, 38, 38, 1)',
  },
  materialItem: {
    width: "100%",
    height: normalize(72),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.4)',
  },
  materialContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    justifyContent: 'space-between',
    paddingVertical: normalize(25),
  },
  materialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    width: normalize(134),
    height: normalize(22),
  },
  materialDelete: {
    width: normalize(30),
    height: "100%",
    justifyContent: 'center',
    alignItems: 'center',
  },
  materialIcon: {
    width: normalize(22),
    height: normalize(22),
  },
  materialName: {
    width: normalize(104),
    height: normalize(16),
    color: '#FFFFFF',
    fontSize: normalizeFontSize(14),
    letterSpacing: -0.4,
    fontFamily: 'SF Pro-Medium',
    fontWeight: '500',
    textAlign: 'left',
    lineHeight: normalize(16),
    marginTop: normalize(3),
    marginLeft: normalize(8),
  },
  materialArrow: {
    width: normalize(20),
    height: normalize(20),
  },
  addButton: {
    backgroundColor: 'rgba(133, 243, 128, 1)',
    borderRadius: normalize(12),
    height: normalize(48),
    width: "100%",
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    height: normalize(21),
    color: 'rgba(12, 12, 13, 0.7)',
    fontSize: normalizeFontSize(16),
    letterSpacing: -0.4,
    fontFamily: 'SF Pro-Medium',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: normalize(21),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: theme.textPrimary,
    letterSpacing: -0.4,
    lineHeight: normalize(20),
  },
});

export default AudioMaterialLibraryScreen;
