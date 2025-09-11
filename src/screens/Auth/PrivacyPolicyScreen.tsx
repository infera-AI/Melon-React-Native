import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from './AuthNavigator';
import { normalize, normalizeFontSize } from '../../utils/stylesUtil';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type PrivacyPolicyScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'PrivacyPolicy'>;

const PrivacyPolicyScreen: React.FC = () => {
  const navigation = useNavigation<PrivacyPolicyScreenNavigationProp>();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#181819" />
      
      {/* 状态栏占位 */}
      <View style={styles.statusBarPlaceholder} />
      
      {/* 主要内容容器 */}
      <View style={styles.contentContainer}>
        {/* 头部 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <View style={styles.backIcon}>
              <Image source={require('../../assets/main/page_return_icon.png')} style={styles.backIcon} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        {/* 协议内容 */}
        <ScrollView style={styles.agreementContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.titleText}>
            Melon Privacy Policy
          </Text>
          <Text style={[styles.boldText]}>
            Effective Date: <Text style={styles.normalText}>September 6, 2025</Text>
          </Text>
          <Text style={[styles.boldText]}>
            Last Updated: <Text style={styles.normalText}>September 6, 2025</Text>
          </Text>
          <Text style={styles.title2Text}>
            1. Introduction
          </Text>
          <Text style={styles.normalText}>
            Welcome to Melon. Infera Inc. (“Melon,” “we,” “us,” or “our”) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, share, and protect your personal information when you use our Service, as defined in our Terms of Service.
          </Text>
          <Text style={styles.normalText}>
            This Policy is designed to be transparent and to help you understand your privacy rights. It applies to all services offered by Melon. The data controller responsible for your information is Infera Inc., with its registered address at 8th Floor, Block A, Huizhi Building, No. 28 Ningshuang Road, Tiexinqiao Street, Yuhua tai District, Nanjing, China.
          </Text>
          <Text style={styles.normalText}>
            By using our Service, you agree to the collection and use of information in accordance with this Policy.
          </Text>

          <Text style={styles.title2Text}>
            2. The Information We Collect
          </Text>
          <Text style={styles.normalText}>
            We collect information to provide and improve our Service. The types of information we collect are described below.
          </Text>
          <Text style={styles.title3Text}>
            2.1 Information You Provide Directly
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>Account Information: </Text>
            When you create a Melon account, we collect your mobile phone number or email address and your encrypted password.
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>User Input: </Text>
            We collect the content you provide to the Service. This includes text, documents, and images for translation; lyrics for music generation; and, critically, <Text style={styles.boldText}>voice and audio recordings</Text> for features like voice translation, AI covers, and voice cloning.This data is essential for the core functionality of the Service.
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>Communications: </Text>
            If you contact us for customer support or provide feedback, we will collect the information you include in your communications.
          </Text>
          <Text style={styles.title3Text}>
            2.2 Information We Collect Automatically
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>Usage Data: </Text>
            We automatically collect information about your interactions with the Service, such as the features you use, the actions you take, and the time, frequency, and duration of your activities.
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>Device and Log Information: </Text>
            We collect information from and about the device(s) you use to access our Service. This includes your IP address, device model, operating system version, unique device identifiers, and network information.
          </Text>
          <Text style={styles.title3Text}>
            2.3 Information from Third Parties
          </Text>
          <Text style={styles.normalText}>
            If you choose to register or log in to our Service using a third-party account (such as Google or Apple), we will receive certain profile information about you from that service, such as your name and email address, as permitted by you and the policies of that third-party service.
          </Text>
          <Text style={styles.title3Text}>
            2.3.1 Summary of Personal Data Processing Activities
          </Text>
          <Text style={styles.normalText}>
            To ensure transparency, particularly for our users in the European Economic Area (EEA), The following summarizes our data processing activities.
          </Text>
          <Text style={styles.normalText}>
            1) Account Credentials (Phone number or email, password): To create, manage, and secure your account; to verify your identity.
          </Text>
          <Text style={styles.normalText}>
            2) User Input (Text, documents, images, audio/voice recordings): To provide the core AI translation and music generation services you request.
          </Text>
          <Text style={styles.normalText}>
            3) User Input & Usage Data: To train, develop, and improve our AI models and the overall Service.
          </Text>
          <Text style={styles.normalText}>
            4) Payment Information (Processed by third parties): To process your purchases of virtual Credits.
          </Text>
          <Text style={styles.normalText}>
            5) Device & Log Information: To ensure the security and stability of the Service; to prevent fraud and abuse.
          </Text>
          <Text style={styles.normalText}>
            6) Communications Data: To respond to your support requests and feedback.
          </Text>

          <Text style={styles.title2Text}>
            3. How and Why We Use Your Information (Purposes of Processing)
          </Text>
          <Text style={styles.normalText}>
            We use the information we collect for the following purposes:
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>To Provide and Maintain the Service: </Text>
            We use your information to deliver the core functionalities of the Service, such as processing your Input to generate Output, managing your account, and processing payments. The legal basis for this processing is the <Text style={styles.boldText}>performance of our contract</Text> (our Terms of Service) with you.
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>To Improve and Develop the Service: </Text>
            We use your Input and Usage Data to train our AI models and improve the quality, accuracy, and features of our Service. This processing is based on our <Text style={styles.boldText}>legitimate interest</Text> in developing a state-of-the-art AI service. Providing an easy-to-use opt-out strengthens the justification for this legitimate interest and aligns with principles of user control central to modern privacy laws like GDPR and the California Privacy Rights Act (CPRA).
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>You are in control. You can opt out of having your data used for AI model improvement at any time in your account settings. Your choice will not affect your access to the core features of the Service. </Text>
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>To Communicate with You: </Text>
            We use your contact information to send you service-related announcements, security alerts, and support messages. This is based on our <Text style={styles.boldText}>legitimate interest</Text> in keeping you informed about your account and the Service.
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>For Safety and Security: </Text>
            We use devices and log information to protect the security and integrity of our Service, prevent fraud and abuse, and enforce our Terms. This processing is based on our <Text style={styles.boldText}>legitimate interest</Text> and, in some cases, our <Text style={styles.boldText}>legal obligations</Text>.
          </Text>

          <Text style={styles.title2Text}>
            4. How We Share and Disclose Information
          </Text>
          <Text style={styles.normalText}>
            We do not share your personal information with third parties except in the limited circumstances described below:
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>With Service Providers: </Text>
            We share information with third-party vendors and partners who work on our behalf, such as cloud hosting providers (e.g., AWS, Google Cloud), payment processors, and analytics services. These providers are contractually obligated to protect your information and are prohibited from using it for any other purpose.
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>For Legal Reasons: </Text>
            We may disclose your information if we believe it is reasonably necessary to comply with a law, regulation, legal process, or governmental request; to enforce our Terms; to protect the safety of any person; or to address fraud, security, or technical issues.
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>In Case of a Business Transfer: </Text>
            If we are involved in a merger, acquisition, bankruptcy, or sale of all or a portion of our assets, your information may be transferred as part of that transaction. We will notify you of any such change in control or use of your personal information.
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>With Your Consent: </Text>
            We may share your information with third parties when we have your explicit consent to do so.
          </Text>
          <Text style={styles.normalText}>
            <Text style={styles.boldText}>We do not sell your personal information.</Text> This is a key commitment and a requirement for compliance with laws like the CCPA/CPRA.
          </Text>

          <Text style={styles.title2Text}>
            5. International Data Transfers
          </Text>
          <Text style={styles.normalText}>
            Your personal information may be transferred to, and processed in, countries other than the country in which you are a resident. Our company is based in China, and we may use servers and service providers located in various countries, including the United States.
          </Text>
          <Text style={styles.normalText}>
            These countries may have data protection laws that are different from the laws of your country. Specifically, for users in the EEA, UK, or Switzerland, when we transfer your personal information to a country that has not been deemed to provide an adequate level of data protection by the European Commission (such as China or the United States prior to the EU-U.S. Data Privacy Framework), we do so on the basis of appropriate safeguards. The primary mechanism we rely on for such transfers is the <Text style={styles.boldText}>Standard Contractual Clauses (SCCs)</Text> approved by the European Commission. This is a legally mandated requirement under GDPR to ensure your data remains protected to EU standards when it leaves the EEA.
          </Text>

          <Text style={styles.title2Text}>
            6. Your Privacy Rights and Choices
          </Text>
          <Text style={styles.normalText}>
            You have rights and choices regarding your personal information. We have organized these rights by jurisdiction for your convenience.
          </Text>
          <Text style={styles.title3Text}>
            6.1 Your General Rights
          </Text>
          <Text style={styles.normalText}>
            Regardless of your location, you have the right to:
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>Access </Text>
            your personal information.
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>Correct or update </Text>
            inaccurate personal information.
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>Delete </Text>
            your personal information by deleting your account.
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>Control Data Use for AI Improvement: </Text>
            As stated above, you can opt out of your data being used for model training in your account settings.
          </Text>
          <Text style={styles.title3Text}>
            6.2 Your Rights as a Resident of the EEA, UK, or Switzerland (GDPR)
          </Text>
          <Text style={styles.normalText}>
            If you are a resident of the EEA, UK, or Switzerland, you have the following additional rights under the GDPR:
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>Right to Object: </Text>
            You have the right to object to our processing of your personal data when it is based on our legitimate interests.
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>Right to Restrict Processing: </Text>
            You can ask us to restrict the processing of your personal data in certain circumstances.
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>Right to Data Portability: </Text>
            You have the right to receive the personal data you have provided to us in a structured, commonly used, and machine-readable format.
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>Right to Lodge a Complaint: </Text>
            You have the right to lodge a complaint with a data protection supervisory authority in your country of residence.
          </Text>
          <Text style={styles.title3Text}>
            6.3 Your Rights as a Resident of California (CCPA/CPRA)
          </Text>
          <Text style={styles.normalText}>
            If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA):
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>Right to Know: </Text>
            You have the right to request information about the categories and specific pieces of personal information we have collected about you, the sources of that information, the purposes for which we use it, and the third parties with whom we share it.
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>Right to Delete: </Text>
            You have the right to request the deletion of your personal information that we have collected, subject to certain exceptions.
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>Right to Correct: </Text>
            You have the right to request the correction of inaccurate personal information we maintain about you.
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>Right to Opt-Out of Sale/Sharing: </Text>
            We do not “sell” or “share” (for cross-context behavioral advertising) your personal information as those terms are defined under the CCPA/CPRA.
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>Right to Limit Use and Disclosure of Sensitive Personal Information: </Text>
            You have the right to limit our use of your sensitive personal information (such as voice recordings) to that which is necessary to perform the services you requested. Our feature allowing you to opt out of AI model training is one way we honor this right.
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>● </Text>
            <Text style={styles.boldText}>Right to Non-Discrimination: </Text>
            We will not discriminate against you for exercising any of your CCPA/CPRA rights.
          </Text>
          <Text style={styles.normalText}>
            To exercise any of these rights, please contact us using the information provided in Section 9.
          </Text>

          <Text style={styles.title2Text}>
            7. Data Security and Retention
          </Text>
          <Text style={styles.normalText}>
            We implement commercially reasonable technical and organizational security measures designed to protect your personal information from unauthorized access, use, alteration, or disclosure. These measures include encryption of data in transit and at rest, and strict access controls.
          </Text>
          <Text style={styles.normalText}>
            We retain your personal information for as long as your account is active or as needed to provide you with the Service. We may also retain information for a longer period as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements. After this period, we will delete or anonymize your information.
          </Text>

          <Text style={styles.title2Text}>
            8. Children's Privacy
          </Text>
          <Text style={styles.normalText}>
            Our Service is not directed to individuals under the age of 13 (or 16 in the EEA, where applicable). We do not knowingly collect personal information from children. If we become aware that a child under the relevant age has provided us with personal information, we will take steps to delete such information immediately.If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
          </Text>

          <Text style={styles.title2Text}>
            9. Policy Updates and Contact Information
          </Text>
          <Text style={styles.normalText}>
            We may update this Privacy Policy from time to time. If we make material changes, we will notify you through the Service or by other means, such as email, to provide you with the opportunity to review the changes before they become effective.
          </Text>
          <Text style={styles.normalText}>
            If you have any questions, comments, or concerns about this Privacy Policy or our data practices, please contact our data protection team at: 
          </Text>
          <Text style={styles.normalText}>
            <Text style={styles.boldText}>Email: </Text>privacy@infera.im (or contact@infera.cn) 
          </Text>
          <Text style={styles.normalText}>
            <Text style={styles.boldText}>Address: </Text>Infera Inc., 8th Floor, Block A, Huizhi Building, No. 28 Ningshuang Road, Tiexinqiao Street, Yuhua tai District, Nanjing, China.
          </Text>

          <View style={styles.marginTop20} />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181819',
  },
  statusBarPlaceholder: {
    height: Platform.OS === 'ios' ? 44 : 24,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: normalize(24),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: normalize(12),
    marginBottom: normalize(18),
  },
  backButton: {
    width: normalize(40),
    height: normalize(40),
    backgroundColor: '#3E3E3E',
    borderRadius: normalize(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: normalize(16),
    height: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: normalizeFontSize(16),
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: normalizeFontSize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  headerSpacer: {
    width: normalize(40),
  },
  agreementContainer: {
    flex: 1,
    backgroundColor: '#262626',
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
  },
  agreementText: {
    fontSize: normalizeFontSize(15),
    fontWeight: '400',
    color: '#B0B0B0',
    lineHeight: normalize(20),
    letterSpacing: -0.4,
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: normalizeFontSize(18),
    color: '#ffffff',
    marginBottom: normalize(20),
    marginTop: normalize(20),
  },
  title2Text: {
    fontWeight: '600',
    fontSize: normalizeFontSize(16),
    color: '#ffffff',
    marginTop: normalize(20),
  },
  title3Text: {
    fontWeight: '600',
    fontSize: normalizeFontSize(16),
    color: '#ffffff',
    marginTop: normalize(8),
  },
  boldText: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
  normalText: {
    fontWeight: 'normal',
    color: '#ffffff',
    fontSize: normalizeFontSize(14),
    textAlign: 'justify',
    lineHeight: normalize(20),
    marginTop: normalize(8),
  },
  marginTop20: {
    marginTop: normalize(20),
  }
});

export default PrivacyPolicyScreen; 