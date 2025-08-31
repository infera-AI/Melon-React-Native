import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MusicScreen from './index';
import MyWorkScreen from './my_work';
import MusicPlayScreen from './music_play';
import HummingMusicScreen from './humming_music';
import MusicEditScreen from './music_edit';
import MusicEditHummingScreen from './music_edit_humming';
import MusicPreviewScreen from './music_preview';
import GeneratingMusicScreen from './GeneratingMusicScreen';
import MyWorkMusicPlay from './MyWorkMusicPlay';
import SingerSelectionScreen from './SingerSelectionScreen';
                                                    import CoverUploadScreen from './CoverUploadScreen';

export type MusicStackParamList = {
  MusicMain: undefined;
  MyWork: undefined;
  MusicPlay: {music: any,songs:any};
  HummingMusic: undefined;
  MusicEdit: undefined;
  MusicEditHumming: {uri: string};
  MusicPreview: {music: any};
  GeneratingMusic: { taskId: string; createTaskTime: number };
  MyWorkMusicPlay: {music: any,myWorkIds:number[]};
  SingerSelection: {type: 'upload' | 'generate'};
  CoverUpload: undefined;
};

const Stack = createNativeStackNavigator<MusicStackParamList>();

const MusicStackNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="MusicMain"
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="MusicMain" component={MusicScreen} />
    <Stack.Screen name="MyWork" component={MyWorkScreen} />
    <Stack.Screen name="MusicPlay" component={MusicPlayScreen} />
    <Stack.Screen name="HummingMusic" component={HummingMusicScreen} />
    <Stack.Screen name="MusicEdit" component={MusicEditScreen} />
    <Stack.Screen name="MusicEditHumming" component={MusicEditHummingScreen} />
    <Stack.Screen name="MusicPreview" component={MusicPreviewScreen} />
    <Stack.Screen name="GeneratingMusic" component={GeneratingMusicScreen} />
    <Stack.Screen name="MyWorkMusicPlay" component={MyWorkMusicPlay} />
    <Stack.Screen name="SingerSelection" component={SingerSelectionScreen} />
    <Stack.Screen name="CoverUpload" component={CoverUploadScreen} />
  </Stack.Navigator>
);

export default MusicStackNavigator;
