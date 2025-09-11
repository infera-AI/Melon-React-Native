import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ProfileScreen from './index';
import EditProfileScreen from './EditProfileScreen';
import OfflineLanguageScreen from './OfflineLanguageScreen';
import {
  VoiceprintManagementScreen,
  CreateVoiceScreen,
  RecordingScreen,
  GeneratingVoiceScreen,
  VoiceprintManagementInitialScreen,
  VoiceprintManagementListScreen,
  VoiceprintMaterialCreateScreen,
  AudioMaterialLibraryScreen,
  VoiceprintTrainingSuccessScreen,
  VoiceprintRecordingScreen,
} from './VoicePrintManagement';
import LanguageVoiceScreen from './LanguageVoiceScreen';
import AccountSecurityScreen from './AccountSecurityScreen';
import DeregisterAccountScreen from './DeregisterAccountScreen';
import DeregisterVerificationScreen from './DeregisterVerificationScreen';
import DeregisterCodeVerificationScreen from './DeregisterCodeVerificationScreen';
import BindMailboxScreen from './BindMailboxScreen';
import GeneralSettingsScreen from './GeneralSettingsScreen';
import SystemLanguageScreen from './SystemLanguageScreen';
import HelpFeedbackScreen from './HelpFeedbackScreen';
import ProductFeedbackScreen from './ProductFeedbackScreen';
import AboutScreen from './AboutScreen';
import CopyrightStatementScreen from './CopyrightStatementScreen';
import ResetPasswordScreen from './ResetPasswordScreen';
import BindPhoneEmailScreen from './BindPhoneEmailScreen';
import BindPhoneEMailScreenNumber from './BindPhoneEMailScreenNumber';
import BindPhoneVerifyScreen from './BindPhoneVerifyScreen';
import LoginDeviceManagementScreen from './LoginDeviceManagementScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import MyPointsScreen from './MyPointsScreen';
import PointsDetailScreen from './PointsDetailScreen';
import PurchaseScreen from './PurchaseScreen';
import OfflineVoicePackageScreen from './OfflineVoicePackageScreen';
import UserServiceAgreementScreen from '@/screens/Auth/UserServiceAgreementScreen';
import PrivacyPolicyScreen from '@/screens/Auth/PrivacyPolicyScreen';

import BindSuccessScreen from './BindSuccessScreen';
// import ProfileResetPasswordScreen from './ProfileResetPasswordScreen';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  OfflineLanguage: undefined;
  VoiceprintManagement: undefined;
  CreateVoice: undefined;
  Recording: { locale: string };
  GeneratingVoice: undefined;
  LanguageVoice: undefined;
  AccountSecurity: undefined;
  DeregisterAccount: undefined;
  DeregisterVerification: undefined;
  DeregisterCodeVerification: { phoneNumber: string, countryCode: string };
  BindMailbox: { action_token: string };
  GeneralSettings: undefined;
  SystemLanguage: undefined;
  HelpFeedback: undefined;
  ProductFeedback: undefined;
  About: undefined;
  CopyrightStatement: undefined;
  OptimizVoice: undefined;
  ProfileResetPassword: undefined;
  ResetPassword: undefined;
  BindPhoneEmail: undefined;
  BindPhoneEMailNumber: {
    type: string;
  };
  BindPhoneVerify: {
    type: string;
    email: string;
    phoneNumber: string;
    countryCode: string;
    actionToken: string; // 添加action_token参数
  };
  LoginDeviceManagement: undefined;
  ForgotPassword: undefined;
  MyPoints: undefined;
  PointsDetail: undefined;
  Purchase: { points: string };
  OfflineVoicePackage: undefined;
  VoiceprintManagementInitial: undefined;
  VoiceprintManagementList: undefined;
  VoiceprintMaterialCreate: undefined;
  AudioMaterialLibrary: undefined;
  VoiceprintTrainingSuccess: undefined;
  VoiceprintRecording: { locale: string };
  BindSuccess: {
    bindType: 'phone' | 'email';
    bindValue: string;
  };
  UserServiceAgreement: undefined;
  PrivacyPolicy: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ProfileMain"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="OfflineLanguage" component={OfflineLanguageScreen} />
      <Stack.Screen name="VoiceprintManagement" component={VoiceprintManagementScreen} />
      <Stack.Screen name="CreateVoice" component={CreateVoiceScreen} />
      <Stack.Screen name="Recording" component={RecordingScreen} />
      <Stack.Screen name="GeneratingVoice" component={GeneratingVoiceScreen} />
      <Stack.Screen name="LanguageVoice" component={LanguageVoiceScreen} />
      <Stack.Screen name="AccountSecurity" component={AccountSecurityScreen} />
      <Stack.Screen name="DeregisterAccount" component={DeregisterAccountScreen} />
      <Stack.Screen name="DeregisterVerification" component={DeregisterVerificationScreen} />
      <Stack.Screen name="DeregisterCodeVerification" component={DeregisterCodeVerificationScreen} />
      <Stack.Screen name="BindMailbox" component={BindMailboxScreen} />
      <Stack.Screen name="GeneralSettings" component={GeneralSettingsScreen} />
      <Stack.Screen name="SystemLanguage" component={SystemLanguageScreen} />
      <Stack.Screen name="HelpFeedback" component={HelpFeedbackScreen} />
      <Stack.Screen name="ProductFeedback" component={ProductFeedbackScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="CopyrightStatement" component={CopyrightStatementScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="BindPhoneEmail" component={BindPhoneEmailScreen} />
      <Stack.Screen name="BindPhoneEMailNumber" component={BindPhoneEMailScreenNumber} />
      <Stack.Screen name="BindPhoneVerify" component={BindPhoneVerifyScreen} />
      <Stack.Screen name="LoginDeviceManagement" component={LoginDeviceManagementScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="MyPoints" component={MyPointsScreen} />
      <Stack.Screen name="PointsDetail" component={PointsDetailScreen} />
      <Stack.Screen name="Purchase" component={PurchaseScreen} />
      <Stack.Screen name="OfflineVoicePackage" component={OfflineVoicePackageScreen} />
      <Stack.Screen name="VoiceprintManagementInitial" component={VoiceprintManagementInitialScreen} />
      <Stack.Screen name="VoiceprintManagementList" component={VoiceprintManagementListScreen} />
      <Stack.Screen name="VoiceprintMaterialCreate" component={VoiceprintMaterialCreateScreen} />
      <Stack.Screen name="AudioMaterialLibrary" component={AudioMaterialLibraryScreen} />
      <Stack.Screen name="VoiceprintTrainingSuccess" component={VoiceprintTrainingSuccessScreen} />
      <Stack.Screen name="VoiceprintRecording" component={VoiceprintRecordingScreen} />
      <Stack.Screen name="BindSuccess" component={BindSuccessScreen} />
      <Stack.Screen name="UserServiceAgreement" component={UserServiceAgreementScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      {/* <Stack.Screen name="ProfileResetPassword" component={ProfileResetPasswordScreen} /> */}
    </Stack.Navigator>
  );
};

export default ProfileNavigator; 