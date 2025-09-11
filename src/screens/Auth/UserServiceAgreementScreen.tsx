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

type UserServiceAgreementScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'UserServiceAgreement'>;

const UserServiceAgreementScreen: React.FC = () => {
  const navigation = useNavigation<UserServiceAgreementScreenNavigationProp>();

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
              {/* <Text style={styles.backArrow}>←</Text> */}
              <Image source={require('../../assets/main/page_return_icon.png')} style={styles.backIcon} />
            </View>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Service Agreement</Text>
          <View style={styles.headerSpacer} />
        </View>
        
        {/* 协议内容 */}
        <ScrollView style={styles.agreementContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.titleText}>
            Melon Terms of Service
          </Text>
          <Text style={[styles.boldText]}>
            Effective Date: <Text style={styles.normalText}>September 6, 2025</Text>
          </Text>
          <Text style={[styles.boldText]}>
            Last Updated: <Text style={styles.normalText}>September 6, 2025</Text>
          </Text>
          
          <Text style={styles.title2Text}>
            1. Acceptance of These Terms of Service
          </Text>
          <Text style={styles.title3Text}>
            1.1 Parties and Service Description
          </Text>
          <Text style={styles.normalText}>
            Welcome to Melon. These Terms of Service (the “Terms”) constitute a legally binding agreement between you (“User,” “you,” or “your”) and Infera Inc. (“Melon,” “we,” “us,” or “our”), a service operated by Infera Inc., with a registered address at 8th Floor, Block A, Huizhi Building, No. 28 Ningshuang Road, Tiexinqiao Street, Yuhua tai District, Nanjing, China.
          </Text>
          <Text style={styles.normalText}>
            These Terms govern your registration for, access to, and use of the Melon mobile application, our official website located at infera.im, and all related content, software, features, and technologies (collectively, the “Service”). The Service is designed to provide innovative cross-language communication and music creation experiences through advanced artificial intelligence, including AI Translation Services (text, voice, document, and image translation) and AI Music Generation Services (original music generation, AI song covers, and voice model cloning).
          </Text>
          <Text style={styles.normalText}>
            By checking the box to indicate your agreement during registration, or by accessing or using the Service in any manner, you acknowledge that you have read, understood, and agree to be bound by the entirety of these Terms and our accompanying <Text style={styles.boldText}>Melon Privacy Policy</Text>, which is incorporated herein by reference. If you do not agree to any part of these Terms, you must immediately cease all access to and use of the Service.
          </Text>
          <Text style={[styles.title3Text, styles.marginTop20]}>
            1.2 Changes to Terms
          </Text>
          <Text style={styles.normalText}>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time to reflect changes in the law, our business, or the features of the Service. If we make changes that are material, we will provide you with reasonable notice of such changes, such as by posting a notice within the Service user interface, sending a pop-up notification, or sending an email to the address associated with your account. The “Last Updated” date at the top of this page will indicate when the latest modifications were made. Your continued use of the Service after any such changes become effective constitutes your binding acceptance of the new Terms. If you do not agree to the revised Terms, you must stop using the Service.
          </Text>
          <Text style={[styles.title3Text, styles.marginTop20]}>
            1.3 ARBITRATION NOTICE AND CLASS ACTION WAIVER
          </Text>
          <Text style={styles.normalText}>
            <Text style={styles.boldText}>
              PLEASE READ THIS SECTION CAREFULLY. THESE TERMS CONTAIN A MANDATORY INDIVIDUAL ARBITRATION PROVISION AND A CLASS ACTION/JURY TRIAL WAIVER. WITH LIMITED EXCEPTIONS, THIS REQUIRES YOU TO SUBMIT ANY DISPUTES YOU HAVE WITH US TO BINDING AND FINAL ARBITRATION ON AN INDIVIDUAL BASIS. THIS MEANS YOU WAIVE YOUR RIGHT TO SEEK RELIEF IN A COURT OF LAW (INCLUDING THE RIGHT TO A JURY TRIAL) AND TO PARTICIPATE IN ANY CLASS ACTION, REPRESENTATIVE ACTION, OR SIMILAR PROCEEDING AGAINST US.
            </Text>
            A detailed explanation of this provision is located in Section 9 of these Terms.  
          </Text>

          <Text style={styles.title2Text}>
            2. Your Melon Account
          </Text>
          <Text style={styles.title3Text}>
            2.1 Eligibility
          </Text>
          <Text style={styles.normalText}>
            The Service is intended for a general audience and is not directed to children. To create an account and use the Service, you must be at least 13 years of age. If you are between the ages of 13 and 18 (or the age of legal majority in your jurisdiction), you may only use the Service under supervision and with the express consent of a parent or legal guardian who agrees to be bound by these Terms on your behalf. By using the Service, you represent and warrant that you meet these eligibility requirements.
          </Text>
          <Text style={styles.title3Text}>
            2.2 Registration and Account Information
          </Text>
          <Text style={styles.normalText}>
            You may be required to register for an account to access certain features of the Service, using either a mobile phone number or an email address. You agree to provide and maintain true, accurate, current, and complete information about yourself as prompted by the registration form. You may not create more than one account for the purpose of abusing any free tier, promotional offers, or other features of the Service. If we believe, in our sole discretion, that you are not using any free tier in good faith, we reserve the right to suspend or terminate your access to the Service.
          </Text>
          <Text style={styles.title3Text}>
            2.3 Account Security
          </Text>
          <Text style={styles.normalText}>
            You are solely responsible for maintaining the confidentiality of your account password and for all activities that occur under your account, including but not limited to information publishing, feature usage, and Credit purchases or consumption. You agree to immediately notify Melon of any unauthorized use of your password or account or any other breach of security. Melon will not be liable for any loss or damage arising from your failure to comply with this section.
          </Text>
          <Text style={styles.title3Text}>
            2.4 Account Termination and Deletion
          </Text>
          <Text style={styles.normalText}>
            You may request to delete your account at any time through the “Account and Security” section within the application. Upon confirmation, your account will be permanently deleted, and all associated data, content, and any remaining virtual “Credits” will be irretrievably erased. We will cease providing the Service to you upon account deletion. 
          </Text>
          <Text style={styles.normalText}>
            We reserve the right to suspend or terminate your account and your access to the Service, at our sole discretion and without notice, for any reason, including but not limited to: (a) a breach of these Terms; (b) engaging in fraudulent, abusive, or illegal activity; or (c) prolonged periods of inactivity.
          </Text>

          <Text style={styles.title2Text}>
            3. Virtual Credits, Fees, and Payments
          </Text>
          <Text style={styles.title3Text}>
            3.1 Virtual "Credits"
          </Text>
          <Text style={styles.normalText}>
            The Service may offer certain premium features that can be accessed by using a virtual item referred to as “Credits”. These Credits are not currency or property of any kind; they are a limited, non-transferable, non-sublicensable, revocable license to use designated features of the Service. Credits have no monetary value and cannot be redeemed for cash or used for any purpose outside of the Service.
          </Text>
          <Text style={[styles.normalText, styles.boldText]}>
            You are strictly prohibited from selling, trading, gifting, or otherwise transferring credits to other users. Any attempt to do so is a violation of these Terms and may result in the immediate termination of your account and the forfeiture of all remaining Credits.
          </Text>
          <Text style={styles.title3Text}>
            3.2 Payment and Billing
          </Text>
          <Text style={styles.normalText}>
            To the extent any portion of the Service is made available for a fee, you will be required to provide payment information. All financial transactions are processed through third-party payment processors, such as Apple’s or Google’s in-app payment systems or other providers like Stripe. We do not collect or store your full payment card details. You represent and warrant that you are authorized to use the payment instrument you provide and that all information you submit is true and accurate. You agree to pay all fees and applicable taxes incurred by you or anyone using an account registered to you.
          </Text>
          <Text style={styles.title3Text}>
            3.3 NO REFUNDS
          </Text>
          <Text style={styles.normalText}>
            <Text style={styles.boldText}>You understand and agree that all payments made for Credits or other aspects of the Service are final and non-refundable, unless otherwise required by applicable law.</Text> If you reside in a jurisdiction that provides a statutory right of withdrawal or refund, your rights will be governed by that jurisdiction's laws. In the event of a system malfunction or billing error, we reserve the right to correct such an error. If the error results in you receiving fewer credits than you were entitled to, we will credit your account for the difference. If the error results in you receiving more Credits than you were entitled to, we reserve the right to debit the excess Credits from your account.
          </Text>

          <Text style={styles.title2Text}>
            4. Intellectual Property Rights
          </Text>
          <Text style={styles.title3Text}>
            4.1 Our Rights in the Service
          </Text>
          <Text style={styles.normalText}>
            You acknowledge and agree that the Service and all of its underlying technology, software, user interfaces, branding, trademarks, and content (excluding your Content, as defined below) are the exclusive property of Infera Inc. and its licensors. These are protected by copyright, trademark, and other intellectual property laws. Except as expressly authorized by these Terms, you agree not to copy, modify, rent, sell, distribute, or create derivative works based on the Service, in whole or in part.
          </Text>
          <Text style={styles.title3Text}>
            4.2 Your Content: Inputs and the License You Grant Us
          </Text>
          <Text style={styles.normalText}>
            The Service allows you to provide various forms of data, including text for translation, lyrics for music generation, audio files for voice cloning or AI covers, images, and documents (collectively, your “Input”). You retain any ownership rights you have in your Input.
          </Text>
          <Text style={styles.normalText}>
            However, to operate and improve the service, we need certain permissions from you. You represent and warrant that you own your input or have obtained all necessary rights, licenses, consents, and permissions to submit it to the Service and to grant us the license described below. You further warrant that your Input, and our use of it as permitted by these Terms, will not infringe, misappropriate, or violate any third party’s rights, including intellectual property rights, privacy rights, or rights of publicity.
          </Text>
          <Text style={styles.normalText}>
            By submitting Input to the Service, you grant Melon a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, host, store, reproduce, modify, create derivative works of, distribute, and otherwise process your Input for the limited purposes of operating, providing, securing, and improving the Service. This includes using your Input to train and enhance our artificial intelligence models that power the Service. For more information on how we use your data and how you can control its use for model improvement, please see our <Text style={styles.boldText}>Privacy Policy</Text>.
          </Text>
          <Text style={styles.title3Text}>
            4.3 AI-Generated Content ("Output")
          </Text>
          <Text style={styles.normalText}>
            The Service generates content such as translated text, musical compositions, and AI-generated song covers based on your Input (collectively, “Output”). The intellectual property rights in this Output are determined by the type of Credits used to generate it, as detailed below.
          </Text>
          <Text style={styles.title3Text}>
            4.3.1 Output Generated with Paid Credits
          </Text>
          <Text style={styles.normalText}>
            Subject to your full compliance with these Terms, for any Output you generate through the consumption of Credits that you have purchased with real money, we hereby assign to you all of our right, title, and interest, if any, in and to that specific Output. You are free to use such Output for any lawful purpose, including for commercial use, at your own risk.
          </Text>
          <Text style={styles.title3Text}>
            4.3.2 Output Generated with Free or Promotional Credits
          </Text>
          <Text style={styles.normalText}>
            For any Output you generate through the consumption of Credits obtained for free (including but not limited to registration bonuses, referral rewards, or rewards for watching advertisements), we grant you a limited, personal, non-exclusive, non-transferable, and non-sublicensable license to use, reproduce, and display the Output solely for your own personal, non-commercial purposes. If you share or display such Output publicly, you must provide attribution in a reasonable manner, such as by stating “Generated with Melon”.
          </Text>
          <Text style={styles.title3Text}>
            4.3.3 IMPORTANT DISCLAIMER ON AI OUTPUT
          </Text>
          <Text style={[styles.normalText, styles.boldText]}>
            THE ASSIGNMENT OF RIGHTS IN SECTION 4.3.1 APPLIES ONLY TO THE RIGHTS, IF ANY, THAT MELON HOLDS IN THE OUTPUT. DUE TO THE NATURE OF ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING, OUTPUT MAY NOT BE UNIQUE, AND THE SERVICE MAY GENERATE IDENTICAL OR SUBSTANTIALLY SIMILAR OUTPUT FOR OTHER USERS FROM DIFFERENT INPUT. ACCORDINGLY, WE MAKE NO REPRESENTATIONS OR WARRANTIES OF ANY KIND REGARDING THE COPYRIGHTABILITY, UNIQUENESS, ORIGINALITY, OR NON-INFRINGEMENT OF ANY OUTPUT. YOU ARE SOLELY RESPONSIBLE FOR DETERMINING WHETHER ANY OUTPUT IS SUITABLE FOR YOUR INTENDED USE AND DOES NOT INFRINGE ON THE RIGHTS OF ANY THIRD PARTY.
          </Text>

          <Text style={styles.title2Text}>
            5. Special Terms for Voice Cloning and AI Covers
          </Text>
          <Text style={styles.normalText}>
            The voice cloning and AI cover features of the Service present unique legal risks related to intellectual property and the rights of individuals. Your use of these features is subject to the following strict conditions.
          </Text>
          <Text style={styles.title3Text}>
            5.1 Strict Prohibition
          </Text>
          <Text style={[styles.normalText, styles.boldText]}>
            YOU ARE STRICTLY PROHIBITED FROM UPLOADING ANY AUDIO, CREATING A VOICE MODEL, OR GENERATING AN AI COVER USING THE VOICE OF ANY THIRD PARTY (INCLUDING, BUT NOT LIMITED TO, PUBLIC FIGURES, RECORDING ARTISTS, ACTORS, FRIENDS, OR FAMILY MEMBERS) UNLESS YOU HAVE OBTAINED THAT INDIVIDUAL’S PRIOR, EXPLICIT, AND VERIFIABLE WRITTEN CONSENT TO USE THEIR VOICE FOR THIS SPECIFIC PURPOSE.
          </Text>
          <Text style={styles.title3Text}>
            5.2 Your Warranty and Responsibility
          </Text>
          <Text style={styles.normalText}>
            By using these features, you expressly represent and warrant that you have secured all necessary rights, licenses, and permissions for any voice you clone or use. You are solely and exclusively responsible and liable for all voice models you create and all Output generated using them.
          </Text>
          <Text style={styles.title3Text}>
            5.3 Our Right to Monitor and Remove
          </Text>
          <Text style={styles.normalText}>
            We reserve the right, but do not have the obligation, to review, screen, or remove any voice models or Output that we believe, in our sole discretion, may violate these Terms, infringe on the rights of a third party, or otherwise be objectionable. We may also suspend or terminate the accounts of users who engage in such activities.
          </Text>
          <Text style={styles.title3Text}>
            5.4 Your Obligation to Indemnify Us
          </Text>
          <Text style={styles.normalText}>
            In addition to the general indemnification clause in Section 8, you specifically agree to defend, indemnify, and hold harmless Infera Inc. and its affiliates, officers, and employees from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or related to your use of the voice cloning or AI cover features in violation of these Terms or any applicable law, including claims for copyright infringement, violation of the right of publicity, or defamation.
          </Text>

          <Text style={styles.title2Text}>
            6. User Conduct and Restrictions
          </Text>
          <Text style={styles.normalText}>
            You agree not to use the Service to create, upload, or distribute any Input or Output that:
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>●</Text> Is unlawful, defamatory, obscene, abusive, invasive of privacy, or otherwise objectionable;
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>●</Text> Infringes upon the intellectual property or other proprietary rights of any party;
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>●</Text> Contains software viruses or any other computer code, files, or programs designed to interrupt, destroy, or limit the functionality of any computer software or hardware;
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>●</Text> Constitutes unsolicited or unauthorized advertising or promotional materials.
          </Text>
          <Text style={styles.normalText}>
            Furthermore, you agree not to:
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>●</Text> Reverse engineer, decompile, disassemble, or otherwise attempt to discover the source code of the Service;
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>●</Text> Use any robot, spider, scraper, or other automated means to access the Service for any purpose without our express written permission;
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>●</Text> Interfere with or disrupt the Service or servers or networks connected to the Service;
          </Text>
          <Text style={styles.normalText}>
            <Text style={{fontSize: normalizeFontSize(10)}}>●</Text> Use the Service or any Output to create, train, or improve (directly or indirectly) any other artificial intelligence, machine learning models, or any service that competes with Melon.
          </Text>

          <Text style={styles.title2Text}>
            7. Disclaimers and Limitation of Liability
          </Text>
          <Text style={styles.title3Text}>
            7.1 Disclaimer of Warranties
          </Text>
          <Text style={styles.normalText}>
            YOUR USE OF THE SERVICE AND ANY OUTPUT IS AT YOUR SOLE RISK. THE SERVICE AND ALL OUTPUT ARE PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS. INFERA INC. AND ITS AFFILIATES EXPRESSLY DISCLAIM ALL WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
          </Text>
          <Text style={styles.normalText}>
            WE DO NOT WARRANT THAT (A) THE SERVICE WILL MEET YOUR REQUIREMENTS; (B) THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE; OR (C) THE RESULTS OR OUTPUT OBTAINED FROM THE USE OF THE SERVICE WILL BE ACCURATE, RELIABLE, OR LAWFUL. YOU ACKNOWLEDGE THAT THE SERVICE USES EXPERIMENTAL TECHNOLOGY AND MAY SOMETIMES PROVIDE INACCURATE, OFFENSIVE, OR MISLEADING CONTENT THAT DOES NOT REPRESENT THE VIEWS OF INFERA INC.
          </Text>
          <Text style={styles.title3Text}>
            7.2 Limitation of Liability
          </Text>
          <Text style={styles.normalText}>
            YOU EXPRESSLY UNDERSTAND AND AGREE THAT INFERA INC. AND ITS AFFILIATES WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY DAMAGES, OR DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES (EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES), WHETHER BASED ON CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR OTHERWISE, RESULTING FROM YOUR USE OF OR INABILITY TO USE THE SERVICE OR ANY OUTPUT.
          </Text>
          <Text style={styles.normalText}>
            IN NO EVENT WILL THE TOTAL LIABILITY OF INFERA INC. AND ITS AFFILIATES TO YOU FOR ALL DAMAGES, LOSSES, OR CAUSES OF ACTION EXCEED THE AMOUNT YOU HAVE PAID US IN THE LAST SIX (6) MONTHS, OR, IF GREATER, ONE HUNDRED U.S. DOLLARS ($100).
          </Text>
          <Text style={styles.normalText}>
            SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR THE LIMITATION OR EXCLUSION OF LIABILITY FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES. ACCORDINGLY, SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.
          </Text>

          <Text style={styles.title2Text}>
            8. Indemnification
          </Text>
          <Text style={styles.normalText}>
            To the fullest extent permitted by law, you agree to defend, indemnify, and hold harmless Infera Inc., its affiliates, and their respective officers, directors, employees, and agents from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees) arising from: (a) your use of and access to the Service; (b) your violation of any term of these Terms; (c) your violation of any third-party right, including without limitation any copyright, property, or privacy right; or (d) any claim that your Input or Output caused damage to a third party.
          </Text>

          <Text style={styles.title2Text}>
            9. Dispute Resolution by Binding Arbitration and Class Action Waiver
          </Text>
          <Text style={styles.title3Text}>
            9.1 Agreement to Arbitrate
          </Text>
          <Text style={styles.normalText}>
            This section is referred to as the “Arbitration Agreement.” You and Infera Inc. agree that any and all disputes or claims that have arisen or may arise between you and us, whether arising out of or relating to these Terms, the Service, or any aspect of the relationship between us, shall be resolved exclusively through final and binding arbitration, rather than in court. The Federal Arbitration Act governs the interpretation and enforcement of this Arbitration Agreement.
          </Text>
          <Text style={styles.title3Text}>
            9.2 Governing Body and Rules
          </Text>
          <Text style={styles.normalText}>
            The arbitration will be conducted by the American Arbitration Association (“AAA”) under its rules, including the AAA’s Commercial Arbitration Rules. If you are an individual using the Service for personal, non-commercial purposes, the AAA’s Consumer Arbitration Rules will apply. If a dispute involves a party located outside of the United States, the arbitration shall be administered by the AAA’s International Centre for Dispute Resolution (“ICDR”) in accordance with its International Dispute Resolution Procedures. The AAA's rules are available at www.adr.org.
          </Text>
          <Text style={styles.title3Text}>
            9.3 Prohibition of Class and Representative Actions and Non-Individualized Relief
          </Text>
          <Text style={styles.normalText}>
            <Text style={styles.boldText}>YOU AND INFERA INC. AGREE THAT EACH OF US MAY BRING CLAIMS AGAINST THE OTHER ONLY ON AN INDIVIDUAL BASIS AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE ACTION OR PROCEEDING.</Text>
            UNLESS BOTH YOU AND INFERA INC. AGREE OTHERWISE, THE ARBITRATOR MAY NOT CONSOLIDATE OR JOIN MORE THAN ONE PERSON'S OR PARTY'S CLAIMS AND MAY NOT OTHERWISE PRESIDE OVER ANY FORM OF A CONSOLIDATED, REPRESENTATIVE, OR CLASS PROCEEDING. THE ARBITRATOR MAY AWARD RELIEF (INCLUDING MONETARY, INJUNCTIVE, AND DECLARATORY RELIEF) ONLY IN FAVOR OF THE INDIVIDUAL PARTY SEEKING RELIEF AND ONLY TO THE EXTENT NECESSARY TO PROVIDE RELIEF NECESSITATED BY THAT PARTY'S INDIVIDUAL CLAIM(S).
          </Text>
          <Text style={styles.title3Text}>
            9.4 Pre-Arbitration Dispute Resolution
          </Text>
          <Text style={styles.normalText}>
            We are always interested in resolving disputes amicably and efficiently. Before you commence arbitration, you agree to first send a written Notice of Dispute to our contact address. The Notice must describe the nature and basis of the claim and the specific relief sought. If we do not resolve the claim within sixty (60) calendar days after the Notice is received, you or we may commence an arbitration proceeding.
          </Text>
          <Text style={styles.title3Text}>
            9.5 Arbitration Procedures
          </Text>
          <Text style={styles.normalText}>
            The arbitration will be conducted by a neutral arbitrator. The hearing, if any, will take place in a mutually agreed upon location or, if no agreement can be reached, may be conducted by telephone or video conference. Payment of all filing, administration, and arbitrator fees will be governed by the applicable AAA Rules. The arbitrator’s decision will be final and binding, and judgment on the award rendered by the arbitrator may be entered in any court having jurisdiction thereof.
          </Text>

          <Text style={styles.title2Text}>
            10. General Terms
          </Text>
          <Text style={styles.title3Text}>
            10.1 Governing Law
          </Text>
          <Text style={styles.normalText}>
            These Terms and any action related thereto will be governed by the laws of the State of Delaware, United States, without regard to its conflict of laws provisions.
          </Text>
          <Text style={styles.title3Text}>
            10.2 Venue
          </Text>
          <Text style={styles.normalText}>
            Subject to the Arbitration Agreement in Section 9, the exclusive jurisdiction for all disputes that you and Infera Inc. are not required to arbitrate will be the state and federal courts located in the State of Delaware, and you and Infera Inc. each waive any objection to jurisdiction and venue in such courts.
          </Text>
          <Text style={styles.title3Text}>
            10.3 Severability, No Waiver, and Assignment
          </Text>
          <Text style={styles.normalText}>
            If any provision of these Terms is held to be invalid or unenforceable, that provision will be struck and the remaining provisions will be enforced to the fullest extent under law. Our failure to enforce any right or provision of these Terms will not be considered a waiver of such right or provision. You may not assign or transfer these Terms, by operation of law or otherwise, without our prior written consent. We may freely assign or transfer these Terms without restriction.
          </Text>
          <Text style={styles.title3Text}>
            10.4 Contact Information
          </Text>
          <Text style={styles.normalText}>
            If you have any questions about these Terms, please contact us at: Infera Inc. 8th Floor, Block A, Huizhi Building, No. 28 Ningshuang Road, Tiexinqiao Street, Yuhua tai District, Nanjing, China Email: contact@infera.cn
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
    // paddingVertical: normalize(20),
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

export default UserServiceAgreementScreen; 