import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginEmailScreen from './LoginEmailScreen';
import LoginPhoneScreen from './LoginPhoneScreen';
import RegisterEmailScreen from './RegisterEmailScreen';
import RegisterPhoneScreen from './RegisterPhoneScreen';
import ForgotPasswordScreen from './ForgotPasswordScreen';
import VerifyCodeScreen from './VerifyCodeScreen';
import ResetPasswordScreen from './ResetPasswordScreen';

import InitialScreen from './InitialScreen';

export type AuthStackParamList = {
  Initial: undefined;
  LoginEmail: undefined;
  LoginPhone: undefined;
  RegisterEmail: undefined;
  RegisterPhone: undefined;
  ForgotPassword: undefined;
  VerifyCode: undefined;
  ResetPassword: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="Initial" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Initial" component={InitialScreen} />
    <Stack.Screen name="LoginEmail" component={LoginEmailScreen} />
    <Stack.Screen name="LoginPhone" component={LoginPhoneScreen} />
    <Stack.Screen name="RegisterEmail" component={RegisterEmailScreen} />
    <Stack.Screen name="RegisterPhone" component={RegisterPhoneScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
  </Stack.Navigator>
);

export default AuthNavigator;
