import React, { useRef } from 'react';
import { StyleSheet, Dimensions, View, ImageBackground } from 'react-native';
import { withTheme, Text } from 'react-native-elements';
import BasicScreen from '../components/BasicScreen';
import { commonStyles } from '../styles/styles';

const header_logo = require('../assets/logo/logo_bg.png');

const { width, height } = Dimensions.get('screen');

const PrivacyPolicy = ({ navigation }) => {
    const scrollViewRef = useRef();

    return (
        <View style={{ width: width, height: '100%', backgroundColor: '#fff' }}>
            <BasicScreen
                scrollContainerStyle={styles.scrollView}
                scrollViewRef={scrollViewRef}
            >

                <>
                    <Text h4 style={styles.subTitle}>1. Please read carefully</Text>
                    <Text style={styles.normalText}>wandoOra Services.com cares deeply about the privacy of its visitors and users. To that end, this Privacy Policy (“Privacy Policy”) describes how wandoO, Inc. and wandoOraServices.com, together with its affiliated companies worldwide (“wandoOra Services”, “we”, “our”, or “us”), collect, use, and share your Personal Information, as well as an explanation of the data rights you may have in that Personal Information. This Privacy Policy applies to all wandoOra Services users, including unregistered visitors, registered users, and premium users (collectively, “Users”, “you”, or “your”), and to all wandoOra Services, including our websites (including www.wandoOraServices.com and any of its subdomains, the “Website”), web applications (“wandoOra Services Apps”), mobile applications (“Mobile Apps”), and related services (collectively, the “Services”). This Privacy Policy is not intended to override the terms of any contract you have with us, nor any rights you may have under other applicable data privacy laws.</Text>
                    <Text style={styles.normalText}>Prior to accessing or using our Services, please read this policy and make sure you fully understand our practices in relation to your Personal Information.  If you read and fully understand this Privacy Policy, and remain opposed to our practices, you must immediately leave and discontinue all use of any of our Services.  If you have any questions or concerns regarding this policy, please contact us here.</Text>

                    <Text h4 style={styles.subTitle}>#wandoOra</Text>
                    <Text style={styles.normalText}>This policy describes our privacy practices – what Personal Information we collect about our Users, what we do with it, how we share it, and your rights regarding that Personal Information.</Text>
                    <Text style={styles.normalText}>By accessing or using any of our Services, you acknowledge that you have read this Privacy Policy.</Text>

                    <Text h4 style={styles.subTitle}>2. What ‘Personal Information’ do we collect?</Text>

                    <Text h4 style={{ ...styles.subTitle, marginTop: 10 }}>2.1. User information:</Text>
                    <Text style={styles.normalText}>To provide you the Services, we must collect Personal Information relating to an identified or identifiable natural person (“Personal Information”). We collect Personal Information you provide us, from your use of the Services, and from other sources. Here are the types of Personal Information we collect about you:</Text>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text style={styles.normalText}>1. </Text>
                        <Text style={styles.normalText}>Information you provide us. When you register for our Services, purchase and/or register domain names, use any of our Services; and/or when you contact us directly by any communication channel (e.g., wandoOra Services support tickets, emails), you may provide us Personal Information, such as name, email address, phone number, payment information (for Users with Paid Services), information you include in your communications with us and with other users on our platform, and Personal Information contained in scanned identification documents (such as an ID card, driver’s license, passport, or official company registration documents).</Text>
                    </View>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text style={styles.normalText}>2. </Text>
                        <Text style={styles.normalText}>Information we collect when you use the Services. When you visit, download, and/or use any of our Services, we may collect aggregated usage Personal Information, such as Visitors’ and Users’ browsing and ‘click-stream’ activity on the Services, session heatmaps and scrolls, non-identifying Personal Information regarding the Visitor’s or User’s device, operating system, internet browser, screen resolution, language and keyboard settings, internet service provider, referring/exit pages, date/time stamps, etc</Text>
                    </View>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text style={styles.normalText}>3. </Text>
                        <Text style={styles.normalText}>Information we collect from other sources. We may receive Personal Information about you from third-party sources, such as i) security providers , fraud detection and prevention providers for example to help us screen out users associated with fraud, ii) social media platforms, when you log-in or sign-up using your social media account, we may receive Personal Information from that service (e.g., your username, basic profile Personal Information) and in some cases, we may collect Personal Information from lead enhancement companies which help us to improve our service offering; iii) advertising and marketing partners in order to monitor, manage and measure our ad campaigns.</Text>
                    </View>

                    <Text h4 style={styles.subTitle}>2.2. Users of users 'Personal Information'</Text>
                    <Text style={styles.normalText}>We may also collect Personal Information pertaining to visitors and users of our User's websites or services (“Users-of-Users”), solely for and on our Users' behalf (as further described in Section 6 below).</Text>

                    <Text h4 style={styles.subTitle}>2.3. wandoOra Services jobs applicant information</Text>
                    <Text style={styles.normalText}>We also collect information that is provided to us by wandoOra Services jobs candidates (“Applicants”), when they apply to any of the open positions published at https://www.wandoOraservices.com/jobs, by e-mail or otherwise (as further described in Section 15 below).</Text>

                    <Text h4 style={styles.subTitle}>#wandoOra</Text>
                    <Text style={styles.normalText}>To provide our Services, we collect Personal Information about our Users.</Text>
                    <Text style={{ ...styles.normalText, marginTop: 0 }}>The Personal Information comes from you when you visit or use our services, Personal Information we collect automatically, and Personal Information we collect from other sources.</Text>

                    <Text h4 style={styles.subTitle}>3. Why do we collect such ‘Personal Information’</Text>
                    <Text style={styles.normalText}>We use your Personal Information for the following purposes:</Text>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text style={styles.normalTextWithoutSpace}>1. </Text>
                        <Text style={styles.normalTextWithoutSpace}>To provide and operate the Services;</Text>
                    </View>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text style={styles.normalTextWithoutSpace}>2. </Text>
                        <Text style={styles.normalTextWithoutSpace}>To further develop, customize, expand, and improve our Services, based on Users’ common or personal preferences, experiences and difficulties;</Text>
                    </View>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text style={styles.normalTextWithoutSpace}>3. </Text>
                        <Text style={styles.normalTextWithoutSpace}>To provide our Users with ongoing customer assistance and technical support;</Text>
                    </View>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text style={styles.normalTextWithoutSpace}>4. </Text>
                        <Text style={styles.normalTextWithoutSpace}>To be able to contact our Users with general or personalized service-related notices and promotional messages (as further detailed in Section 8 below);</Text>
                    </View>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text style={styles.normalTextWithoutSpace}>5. </Text>
                        <Text style={styles.normalTextWithoutSpace}>To help us to update, expand and analyze our records to identify new customers;</Text>
                    </View>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text style={styles.normalTextWithoutSpace}>6. </Text>
                        <Text style={styles.normalTextWithoutSpace}>To facilitate, sponsor, and offer certain contests, events, and promotions, determine participants’ eligibility, monitor performance, contact winners, and grant prizes and benefits;</Text>
                    </View>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text style={styles.normalTextWithoutSpace}>7. </Text>
                        <Text style={styles.normalTextWithoutSpace}>To analyze our performance and marketing activities;</Text>
                    </View>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text style={styles.normalTextWithoutSpace}>8. </Text>
                        <Text style={styles.normalTextWithoutSpace}>To create aggregated statistical data and other aggregated and/or inferred information, which we or our business partners may use to provide and improve our respective services;</Text>
                    </View>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text style={styles.normalTextWithoutSpace}>9. </Text>
                        <Text style={styles.normalTextWithoutSpace}>To provide you with professional assistance , only upon your request;</Text>
                    </View>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text style={styles.normalTextWithoutSpace}>10. </Text>
                        <Text style={styles.normalTextWithoutSpace}>To enhance our data security and fraud prevention capabilities; and</Text>
                    </View>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text style={styles.normalTextWithoutSpace}>11. </Text>
                        <Text style={styles.normalTextWithoutSpace}>To comply with any applicable laws and regulations.</Text>
                    </View>

                    <Text style={{ ...styles.normalText, marginTop: 20 }}>We use your Personal Information for the purposes set out in Section 3 where:</Text>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text style={styles.normalTextWithoutSpace}>1. </Text>
                        <Text style={styles.normalTextWithoutSpace}>Our use of your Personal Information is necessary to perform a contract or to take steps to enter into a contract with you (e.g. to provide you with a website builder, to provide you with our customer assistance and technical support);</Text>
                    </View>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text style={styles.normalTextWithoutSpace}>2. </Text>
                        <Text style={styles.normalTextWithoutSpace}>Our use of your Personal Information is necessary to comply with a relevant legal or regulatory obligation that we have; or</Text>
                    </View>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text style={styles.normalTextWithoutSpace}>3. </Text>
                        <Text style={styles.normalTextWithoutSpace}>Our use of your Personal Information is necessary to support legitimate interests and business purposes (for example, to maintain and improve our Services and the effectiveness of wandoOra Services by identifying technical issues), provided it is conducted in a way that is proportionate and that respects your privacy rights.</Text>
                    </View>

                    <Text h4 style={styles.subTitle}>#wandoOra</Text>
                    <Text style={styles.normalText}>We use the Personal Information we collect about you to provide our services and make them better and safer.</Text>
                    <Text style={styles.normalText}>We also collect and use Personal Information in order to contact Users and to comply with the laws applicable to us.</Text>


                    <Text h4 style={styles.subTitle}>4. How we share your ‘Personal Information’</Text>
                    <Text style={styles.normalText}>We may share your Personal Information with service providers and others (or otherwise allow them access to it) in the following manners and instances:</Text>

                    <Text h4 style={styles.subTitle}>4.1. Third Party Service Providers:</Text>
                    <Text style={styles.normalText}>wandoOra Services has partnered with a number of selected service providers, whose services and solutions complement, facilitate and enhance our own. These include hosting and server co-location services, communications and content delivery networks (CDNs), data and cyber security services, billing and payment processing services, domain name registrars, fraud detection and prevention services, web analytics, e-mail distribution and monitoring services, session recording and remote access services, performance measurement, data optimization and marketing services, content providers, and our legal and financial advisors (collectively, “Third Party Service Provider(s)”).</Text>

                    <Text style={styles.normalText}>wandoOra Services may share the following categories of Personal Information with Third Party Service Providers for a business purpose:</Text>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text style={styles.normalTextWithoutSpace}>{'\u2022'} </Text>
                        <Text style={styles.normalTextWithoutSpace}>identifiers, including name, alias, postal address, unique personal identifier, online identifier, internet protocol address, email address, account name, or other similar identifiers.</Text>
                    </View>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text style={styles.normalTextWithoutSpace}>{'\u2022'} </Text>
                        <Text style={styles.normalTextWithoutSpace}>commercial Personal Information, for example Personal Information regarding products or services purchased, obtained, or considered.</Text>
                    </View>

                    <Text h4 style={styles.subTitle}>4.2. Law Enforcement, Legal Requests and Duties:</Text>
                    <Text style={styles.normalTextWithoutSpace}>wandoOra Services may disclose or otherwise allow access to any categories of your Personal Information described in this Privacy Policy pursuant to a legal request, such as a subpoena, legal proceedings, search warrant or court order, or in compliance with applicable laws, if we have a good faith belief that the law requires us to do so, with or without notice to you.</Text>

                    <Text h4 style={styles.subTitle}>4.3. Protecting Rights and Safety:</Text>
                    <Text style={styles.normalTextWithoutSpace}>wandoOra Services may share any categories of your Personal Information described in this Privacy Policy if we believe in good faith that this will help protect the rights, property or personal safety of wandoOra Services, any of our Users, any Users-of-Users, or any member of the general public, with or without notice to you.</Text>

                    <Text h4 style={styles.subTitle}>4.4. wandoOra Services Subsidiaries and Affiliated Companies:</Text>
                    <Text style={styles.normalTextWithoutSpace}>We may share your Personal Information internally within our family of companies, for the purposes described in this Privacy Policy. For example, we may share your Personal Information with wandoOra Services.com Inc., our US-based subsidiary, in the course of facilitating and providing you (and your Users-of-Users) with our Services.</Text>
                    <Text style={styles.normalTextWithoutSpace}>Sharing Personal Information from wandoOra Services subsidiaries and affiliated companies in the European Union and Switzerland to wandoOra Services United States subsidiary will be only when the relevant Model Standard Contractual Clauses are in place.</Text>

                    <Text h4 style={styles.subTitle}>4.5. In connection with a change in corporate control:</Text>
                    <Text style={styles.normalTextWithoutSpace}>In addition, should wandoOra Services or any of its affiliates undergo any change in control, including by means of merger, acquisition or purchase of substantially all of its assets, your Personal Information may be shared with the parties involved in such event.</Text>

                    <Text h4 style={styles.subTitle}>4.6. Upon Your Further Direction:</Text>
                    <Text style={styles.normalTextWithoutSpace}>The wandoOra Services enable you, through different techniques, to engage and procure various third party services, products and tools for enhancing your web or mobile sites, including, without limitation, applications and widgets offered to you by third parties through the wandoOra Services Website (including the wandoOra Services App Market), eCommerce payment providers, third party designers who may assist you with your website, etc. (collectively, “Third Party Services”). If you choose to engage with such Third Party Services, they may have access to and process Personal Information of your Users-of-Users collected through your web or mobile sites. For example:</Text>

                    <Text style={styles.normalTextWithoutSpace}>a) Framed Pages: our Services may enable you to integrate Third Party Services directly into your web or mobile sites, such as via page framing techniques to serve content to or from Third Party Services  or other parties (“Frames”). In these circumstances, the Third Party Services may collect Personal Information from your Users-of-Users.</Text>
                    <Text style={styles.normalTextWithoutSpace}>b) App Market Developers: We allow third party developers (“Third Party Developer(s)”) to develop and offer their own applications via the wandoOra Services App Market (“Third Party App(s)”) to Users, which you may integrate into your web or mobile sites. Each Third Party Developer is bound by the wandoOra Services App Market Partner Agreement, which among other things, restricts the ways in which such developers may access, store, share, and use the Personal Information you and/or your Users-of-Users provide to them.</Text>
                    <Text style={styles.normalTextWithoutSpace}>c) Social Media Features: Our Services may enable you to integrate certain Social Media features, widgets, and single sign on features, such as “Facebook Connect,” or “Google Sign-in” (“Social Media Features”) into your web or mobile sites. These Social Media Features may collect certain Personal Information from your Users-of-Users such as identifiers, including name, alias, unique personal identifier, online identifier, internet protocol address, email address, or other similar identifiers. Social Media Features are hosted either by a third party or directly on our Services.</Text>

                    <Text style={styles.normalText}>Please note that in the examples listed above in this Section 4.6, wandoOra Services merely acts as an intermediary platform allowing you to procure the services of such Third Party Services (including, but not limited to, Third Party Developers, Third Party Apps and Social Media Features) with which you are interacting directly, and at your discretion. In this respect, wandoOra Services acts as a service provider to you, disclosing information to the Third Party Services on your behalf. wandoOra Services will share your Users-of-Users’ Personal Information with Third Parties Services only upon your direction or with your permission and is not, and shall not be, in any way responsible for such Third Party Services processing of such Personal Information, or liable with respect thereto.</Text>
                    <Text style={styles.normalText}>wandoOra Services does not control and is not responsible for the actions or policies of any Third Party Service, and your use of any Third Party Service is at your own risk. We encourage you to review any privacy policy accompanying a Third Party Service and ask such Third Party Service for any clarifications you may need before deciding to install and/or use their services.</Text>

                    <Text h4 style={styles.subTitle}>#wandoOra</Text>
                    <Text style={styles.normalText}>We may share the Personal Information of our Users and Users-of-Users with various third parties, including certain service providers and law enforcement officials.</Text>
                    <Text style={styles.normalText}>​The Personal Information may be shared solely in accordance with this policy.</Text>

                    <Text h4 style={styles.subTitle}>5. Where do we store your ‘Personal Information’?</Text>

                    <Text h4 style={styles.subTitle}>5.1. Users’ and Users-of-Users’</Text>
                    <Text style={styles.normalTextWithoutSpace}>Personal Information may be stored in data centers located in the United States of America, Ireland and Mexico. We may use other jurisdictions as necessary for the proper delivery of our Services and/or as may be required by law. </Text>
                    <Text style={styles.normalTextWithoutSpace}>wandoOra Services.com (which is owned by wandoO, Inc.). is based in the United States, which is considered by the European Commission to be offering an adequate level of protection for the Personal Information of EU Member State residents. </Text>
                    <Text style={styles.normalTextWithoutSpace}>wandoOra Services affiliates and Third-Party Service Providers that store or process your Personal Information on wandoOra Services behalf are contractually committed to keep it protected and secured, in accordance with industry standards and regardless of any lesser legal requirements which may apply in their jurisdiction.</Text>

                    <Text h4 style={styles.subTitle}>5.2. Transfer of EU Personal data:</Text>
                    <Text style={styles.normalTextWithoutSpace}>If you are located in Europe, when we will transfer your Personal Information to the United States or anywhere outside Europe, we will make sure that (i) there is a level of protection deemed adequate by the European Commission or (ii) that the relevant Model Standard Contractual Clauses are in place. </Text>

                    <Text h4 style={styles.subTitle}>#wandoOra</Text>
                    <Text style={styles.normalTextWithoutSpace}>We may store and process Personal Information in the USA, Mexico, Europe, Israel, or other jurisdictions, whether by ourselves or with the help of our affiliates and service providers.</Text>
                    <Text style={styles.normalTextWithoutSpace}>wandoOra Services data storage providers are contractually committed to protect and secure your data.</Text>
                    <Text style={styles.normalTextWithoutSpace}>Among other things, wandoOra Services will ensure that there is the adequate level of protection or that   relevant Model Standard Contractual Clauses are in place for the international transfer of our EU users’ data.</Text>

                    <Text h4 style={styles.subTitle}>5.3. Privacy Shield Certification:</Text>
                    <Text style={styles.normalTextWithoutSpace}>wandoOra Services and its affiliates, including DeviantArt Inc., participates in, and has certified its compliance with, the EU-U.S. Privacy Shield Framework and the Swiss-U.S. Privacy Shield Framework. To learn more about the Privacy Shield Framework, visit the U.S. Department of Commerce’s Privacy Shield List, here.</Text>
                    <Text style={styles.normalTextWithoutSpace}>In compliance with the Privacy Shield Principles, wandoOra Services.com commits to resolve complaints about our collection or use of your personal information.  EU and Swiss individuals with inquiries or complaints regarding our Privacy Shield policy should first contact us at: privacy@wandoOraServices.com. For the avoidance of doubt, wandoOra Services does not rely on the Privacy Shield as a mechanism for transferring GDPR protected personal data.</Text>
                    <Text style={styles.normalTextWithoutSpace}>wandoOra Services.com has further committed to refer unresolved Privacy Shield complaints to an alternative dispute resolution provider located in the United States. If you do not receive timely acknowledgment of your complaint from us, or if we have not addressed your complaint to your satisfaction, please visit If you have an unresolved privacy or data use concern that we have not addressed satisfactorily, please contact our U.S.-based third-party dispute resolution provider at https://feedback-form.truste.com/watchdog/request for more information or to file a complaint.  The services are provided at no cost to you.</Text>

                    <Text h4 style={styles.subTitle}>6. Users-of-users’ ‘Personal Information’ </Text>
                    <Text style={styles.normalTextWithoutSpace}>wandoOra Services may collect, store and process certain Personal Information of Users-of-Users (“Users-of-Users Information”), solely on our Users’ behalf and at their direction. For example, each of our Users is able to import their e-mail contacts from third-party services like Gmail, or otherwise collect and manage contacts via their User Website. Such contacts are then stored with wandoOra Services, on the User’s behalf.</Text>
                    <Text style={styles.normalTextWithoutSpace}>For such purposes, wandoOra Services serves and shall be considered as a “Processor” and not as the “Controller” (as both such capitalized terms are defined in the European Union General Data Protection Regulation (“GDPR”)) of such Users-of-Users Information. </Text>
                    <Text style={styles.normalTextWithoutSpace}>The Users controlling and operating such User Websites shall be considered as the “Controllers” of such Users-of-Users Information, and are responsible for complying with all laws and regulations that may apply to the collection and control of such Users-of-Users Information, including all privacy and data protection laws of all relevant jurisdictions.</Text>
                    <Text style={styles.normalTextWithoutSpace}>The Processing of the Users-of-users’ Personal Information shall take place within the territory of the European Union, Israel or a third country, territory or one or more specified sectors within that third country of which the European Commission has decided that it ensures an adequate level of protection and such processing and transfer will be in accordance to the Data Processing Agreement – Users (“DPA"). Any transfer to and Processing in a third country outside the European Union that does not ensure an adequate level of protection according to the European Commission, shall be undertaken in accordance with the the Standard Contractual Clauses (2010/87/EU) set out in Annex 1of the DPA. For the sake of clarity, “Processing” should be understood as per the definition provided in the DPA.</Text>
                    <Text style={styles.normalTextWithoutSpace}>You are responsible for the security, integrity and authorized usage of Personal Information about Users-of-Users’, and for obtaining consents, permissions and providing any required data subject rights and fair processing notices required for the collection and usage of such Personal Information. </Text>
                    <Text style={styles.normalTextWithoutSpace}>wandoOra Services cannot provide legal advice to Users or their Users-of-Users, however we do recommend that all Users publish and maintain clear and comprehensive privacy policies on their User Websites in accordance with any applicable laws and regulations, and that all Users-of-Users carefully read those policies and make sure that they understand and, to the extent required by applicable law, consent to them.</Text>
                    <Text style={styles.normalTextWithoutSpace}>For more information on how Users-of-Users Personal Information may be handled by wandoOra Services (which may be relevant for any specific notice you provide to and/or consent you obtain from your Users-of-Users), please see Sections 4, 12 and 13.</Text>
                    <Text style={styles.normalTextWithoutSpace}>If you are a visitor, user or customer of any of our Users, please read the following: wandoOra Services has no direct relationship with Users-of-Users whose Personal Information it processes. If you are a visitor, user or customer of any of our Users, and would like to make any requests or queries regarding your Personal Information, please contact such User(s) directly. For example, if you wish to request to access, correct, amend, or delete inaccurate Personal Information processed by wandoOra Services on behalf of its Users, please direct your query to the relevant User (who is the “Controller” of such data). If wandoOra Services is requested by our Users to remove any Users-of-Users’ Personal Information, we will respond to such requests in a timely manner upon verification and in accordance with applicable law (for example, thirty (30) days under the GDPR). Unless otherwise instructed by our User, we will retain their Users-of-Users’ Personal Information for the period set forth in Section 12 below.</Text>

                    <Text h4 style={styles.subTitle}>#wandoOra</Text>
                    <Text style={styles.normalTextWithoutSpace}>wandoOra Services may collect and process Personal Information regarding the users of our users.</Text>
                    <Text style={styles.normalTextWithoutSpace}>We do this solely on our users’ behalf, and at their direction.</Text>
                    <Text style={styles.normalTextWithoutSpace}>Our users are solely responsible for their users-of-users information, including for its legality, security and integrity.</Text>
                    <Text style={styles.normalTextWithoutSpace}>wandoOra Services has no direct relationship with any of its users’ users. If you are a user-of-user, please contact the wandoOra Services site owner directly.</Text>

                    <Text h4 style={styles.subTitle}>7. Use of cookies and other third-party technologies</Text>
                    <Text style={styles.normalTextWithoutSpace}>We and our Third Party Service Providers use cookies and other similar technologies (“Cookies”) in order for us to provide our Service and ensure that it performs properly, to analyze our performance and marketing activities, and to personalize your experience.</Text>
                    <Text style={styles.normalTextWithoutSpace}>You can learn more about how we use cookies and similar technologies and how you can exercise control over them in our Cookie Policy.</Text>
                    <Text style={styles.normalTextWithoutSpace}>Please note that we do not change our practices in response to a “Do Not Track” signal in the HTTP header from a browser or mobile application, however, most browsers allow you to control cookies, including whether or not to accept them and how to remove them. You may set most browsers to notify you if you receive a cookie, or you may choose to block cookies with your browser.</Text>

                    <Text h4 style={styles.subTitle}>#wandoOra</Text>
                    <Text style={styles.normalTextWithoutSpace}>We and certain third party services may use cookies and similar tracking technologies throughout our services.</Text>
                    <Text style={styles.normalTextWithoutSpace}>These technologies are used mostly for stability, security, functionality, performance and advertising purposes.</Text>

                    <Text h4 style={styles.subTitle}>8. Communications from wandoOra Services</Text>
                    <Text h4 style={styles.subTitle}>8.1. Promotional messages</Text>
                    <Text style={styles.normalTextWithoutSpace}>We may use your Personal Information to send you promotional content and messages by e-mail, text messages, notifications within our platform, marketing calls and similar forms of communication from wandoOra Services or our partners (acting on wandoOra Services behalf) through such means.</Text>
                    <Text style={styles.normalTextWithoutSpace}>If you do not wish to receive such promotional messages or calls, you may notify wandoOra Services at any time or follow the “unsubscribe” or STOP instructions contained in the promotional communications you receive.</Text>

                    <Text h4 style={styles.subTitle}>8.2. Service and billing messages</Text>
                    <Text style={styles.normalTextWithoutSpace}>wandoOra Services may also contact you with important information regarding our Services, or your use thereof. For example, we may send you a notice (through any of the means available to us) if a certain Service is temporarily suspended for maintenance; reply to your support ticket or e-mail; send you reminders or warnings regarding upcoming or late payments for your current or upcoming subscriptions; forward abuse complaints regarding your User Website; or notify you of material changes in our Services.</Text>
                    <Text style={styles.normalTextWithoutSpace}>It is important that you are always able to receive such messages. For this reason, you are not be able to opt-out of receiving such Service and Billing Messages unless you are no longer a wandoOra Services User (which can be done by deactivating your account).</Text>
                    <Text style={styles.normalTextWithoutSpace}>We may also contact you with service and billing-related messages and content. You will not be able to opt-out of receiving such messages.</Text>

                    <Text h4 style={styles.subTitle}>#wandoOra</Text>
                    <Text style={styles.normalTextWithoutSpace}>We may send you promotional messages and content.</Text>
                    <Text style={styles.normalTextWithoutSpace}>You can easily opt-out of receiving promotional messages by contacting us or unsubscribing.</Text>

                    <Text h4 style={styles.subTitle}>9. Your rights in relation to your ‘Personal Information’</Text>
                    <Text style={styles.normalTextWithoutSpace}>wandoOra Services agrees that it is imperative that you have control over your Personal Information. Pursuant to privacy regulations worldwide, wandoOra Services is taking steps to enable you to request access to, receive a copy of, update, amend, delete, or limit the use of your Personal Information.</Text>
                    <Text style={styles.normalTextWithoutSpace}>Before fulfilling your request, we may ask you for additional information in order to confirm your identity and for security purposes. We reserve the right to charge a fee where permitted by law (e.g. if your request is unfounded or excessive).</Text>
                    <Text style={styles.normalTextWithoutSpace}>You have the right to file a complaint with your local supervisory authority for data protection (but we still recommend that you contact us first).</Text>
                    <Text style={styles.normalTextWithoutSpace}>If you are a wandoOra Services User, and you wish to receive a copy, access and/or request us to make corrections to the Personal Information that you have stored with us (either yours or your Users-of-Users’), or wish to request a list of what Personal Information (if any) pertaining to you we disclosed to third parties for direct marketing purposes, please follow the instructions provided in these Help Center articles: “Retrieving Your wandoOra Services Account Data” or Permanently Deleting Your wandoOra Services Account”. You can also mail your request to wandoOra Services.com, wandoO, Inc. 3726 LAS VEGAS BLVD S Suite 1409, Las Vegas, NV 89158 U.S. We will make reasonable efforts to honor your request promptly (unless we require further information from you in order to fulfil your request), subject to legal and other permissible considerations.</Text>
                    <Text style={styles.normalTextWithoutSpace}>Please note that permanently deleting your wandoOra Services account erases all of your Personal Information from wandoOra Services databases. After completing this process, you can no longer use any of your wandoOra Services, your account and all its data will be removed permanently, and wandoOra Services will not be able to restore your account or retrieve your data in the future. If you contact our support channels in the future, the system will not recognize your account and support agents will not be able to locate the deleted account.</Text>

                    <Text h4 style={styles.subTitle}>#wandoOra</Text>
                    <Text style={styles.normalTextWithoutSpace}>You may request to access, receive a copy of, update, amend, delete, or limit the use of your Personal Information you have stored with us. Just send us an e-mail or fill out our dedicated GDPR form. You may also correct and/or update your Personal Information through your account or website settings.</Text>
                    <Text style={styles.normalTextWithoutSpace}>You can delete your Personal Information by deleting your entire account. We will respond to your requests within a reasonable timeframe.</Text>

                    <Text h4 style={styles.subTitle}>10.  Additional Information for California residents</Text>
                    <Text style={styles.normalTextWithoutSpace}>If you are a California resident using the Services, the California Consumer Privacy Act ("CCPA") grants you the right to request access to and deletion of the Personal Information wandoOra Services collects about you, as well as to request that we disclose how we collect, use, and share your Personal Information.</Text>
                    <Text style={styles.normalTextWithoutSpace}>California residents also have a right to opt-out of the sale of their Personal Information by a business and a right not to be discriminated against for exercising any of their rights under the CCPA.</Text>
                    <Text style={styles.normalTextWithoutSpace}>No sale of Personal Information. wandoOra Services does NOT sell (as such term is defined in the CCPA) your Personal Information or your customers’ (Users-of-Users) Personal Information to third parties, and wandoOra Services has not sold Personal Information in the twelve months prior to the effective date of this Privacy Policy.</Text>
                    <Text style={styles.normalTextWithoutSpace}>No Discrimination. wandoOra Services does not discriminate against any User for exercising their rights under the CCPA.</Text>
                    <Text style={styles.normalTextWithoutSpace}>California consumers can exercise their CCPA rights directly or through an authorized agent by signing in to their registered wandoOra Services account at wandoOra Services.com and following the instructions outlined below. Please note: in order to protect Users’ accounts and Personal Information and safeguard Users’ privacy rights, we verify Users’ deletion and access requests, and to that extent, we may ask you for additional information or documentation (depending on the case), such as account related information, and, in some cases, billing information used to purchase paid Services, and a copy of documents that can assist with verifying your identity.</Text>
                    <Text style={styles.normalTextWithoutSpace}>Such identification documentation (if requested) will be used only for verification purposes and we will delete it after your request is processed.</Text>
                    <Text style={styles.normalTextWithoutSpace}>The following instructions apply to Personal Information we may collect from California residents on or through our Services.</Text>
                    <Text style={styles.normalTextWithoutSpace}>Right to Know: If you want to exercise your right to know or receive a copy or access the Personal Information that you have stored with us, please follow the instructions provided in this Help Center article: {'<"'}Retrieving Your wandoOra Services Account Data{'">'}, which explains how you can retrieve your Personal Information directly from within your wandoOra Services account.  Alternatively, you can also submit a request to access your Personal Information through this web form, by submitting a request by email to privacy@wandoOra.com, or by mailing your request to wandoOra Services.com, wandoO, Inc. 3726 LAS VEGAS BLVD S Suite 1409, Las Vegas, NV 89158 U.S.</Text>
                    <Text style={styles.normalTextWithoutSpace}>Right to Deletion: If you want to exercise your right to request deletion of any of your Personal Information that you have stored with us, please follow the instructions provided in this Help Center article: {'<"'}Permanently Deleting Your wandoOra Services Account{'">'}, which explains how to delete your Personal Information that you can access directly through your User account. You can also choose to submit a request to delete all your Personal Information (including information accessible via your User account and any other Personal Information we hold about you) through this web form, by submitting a request by email to privacy@wandoOra.com, or by mailing your request to wandoOra Services.com, wandoO, Inc. 3726 LAS VEGAS BLVD S Suite 1409, Las Vegas, NV 89158 U.S. </Text>
                    <Text style={styles.normalTextWithoutSpace}>Once we receive and verify your consumer request, we will delete your personal information from our records unless an exception applies. We will make reasonable efforts to honor your request promptly and consistent with requirements under applicable law.</Text>
                    <Text style={styles.normalTextWithoutSpace}>Please note that permanently deleting your wandoOra Services account erases all of your Personal Information from wandoOra Services databases. After completing this process, you can no longer use any of your wandoOra Services, your account, and all its data will be removed permanently, and wandoOra Services will not be able to restore your account or retrieve your data in the future. Additionally, if you contact our support channels in the future, the system will not recognize your account, and support agents will not be able to locate the deleted account.</Text>
                    <Text style={styles.normalTextWithoutSpace}>If you cannot access your wandoOra Services account or if you wish to exercise your CCPA rights through an authorized agent operating on your behalf, you, or your authorized agent (as applicable) may send a request to privacy@wandoOra.com or reach out to our customer care department, including by requesting a callback from a customer care expert. To process your request, in order to protect Users’ accounts and Personal Information, we may ask you or your authorized agent for the verifying information detailed above, which may vary according to the circumstances of your request. Authorized agents will also need to provide wandoOra Services with a copy of the consumer’s signed authorization designating them as their agent.</Text>

                    <Text h4 style={styles.subTitle}>#wandoOra</Text>
                    <Text style={styles.normalTextWithoutSpace}>California residents have a few options to submit requests to exercise their rights. Please refer to this Section 10 for more detail on how you or your authorized agent may submit different types of requests.</Text>
                    <Text style={styles.normalTextWithoutSpace}>wandoOra Services does NOT sell (as such term is defined in the CCPA) your Personal Information or your customers’ Personal Information (Users-of-Users) to third parties.</Text>

                    <Text h4 style={styles.subTitle}>11. Questions and complaints</Text>
                    <Text style={styles.normalTextWithoutSpace}>If you have any questions or concerns about our collection, use or disclosure of Personal Information, or if you believe that we have not complied with this Privacy Policy or applicable data protection laws, please contact us – our details are set out at the end of this Privacy Policy.</Text>
                    <Text style={styles.normalTextWithoutSpace}>Our Data Protection Officer team will investigate the complaint and determine whether a breach has occurred and what action, if any, to take. We take every privacy complaint seriously and will make all reasonable efforts to resolve your complaint promptly and in accordance with applicable law.</Text>
                    <Text style={styles.normalTextWithoutSpace}>You can file a complaint with your local supervisory authority for data protection at any time, however we recommend that you contact us first so we can try to resolve it.</Text>

                    <Text h4 style={styles.subTitle}>#wandoOra</Text>
                    <Text style={styles.normalTextWithoutSpace}>You can file a complaint with your local supervisory authority for data protection at any time.  Please contact us first so we can try to resolve your concerns.</Text>

                    <Text h4 style={styles.subTitle}>12. Data retention</Text>
                    <Text style={styles.normalTextWithoutSpace}>We may retain your Personal Information (as well as your Users-of-Users’ Personal Information) for as long as your User Account is active, as indicated in this Privacy Policy, or as otherwise needed to provide you with our Services.</Text>
                    <Text style={styles.normalTextWithoutSpace}>We may continue to retain your Personal Information after you deactivate your User Account and/or cease to use any particular Services, as reasonably necessary to comply with our legal obligations, to resolve disputes regarding our Users or their Users-of-Users, prevent fraud and abuse, enforce our agreements and/or protect our legitimate interests.</Text>
                    <Text style={styles.normalTextWithoutSpace}>We maintain a data retention policy which we apply to Personal Information in our care.</Text>

                    <Text h4 style={styles.subTitle}>#wandoOra</Text>
                    <Text style={styles.normalTextWithoutSpace}>We may keep your Personal Information for as long as your account is active, and longer as needed (for example, if we are legally obligated to keep it longer, or need it to protect our interests).</Text>

                    <Text h4 style={styles.subTitle}>13. Security</Text>
                    <Text style={styles.normalTextWithoutSpace}>wandoOra Services has implemented security measures designed to protect the Personal Information you share with us, including physical, electronic and procedural measures. Among other things, we offer HTTPS secure access to most areas on our Services; the transmission of sensitive payment information (such as a credit card number) through our designated purchase forms is protected by an industry standard SSL/TLS encrypted connection; and we regularly maintain a PCI DSS (Payment Card Industry Data Security Standards) certification. We also regularly monitor our systems for possible vulnerabilities and attacks, and regularly seek new ways and Third Party Services for further enhancing the security of our Services and protection of our Visitors’ and Users’ privacy.</Text>
                    <Text style={styles.normalTextWithoutSpace}>Regardless of the measures and efforts taken by wandoOra Services, we cannot and do not guarantee the absolute protection and security of your Personal Information, your Users-of-Users’ Personal Information or any other information you upload, publish or otherwise share with wandoOra Services or anyone else. We encourage you to set strong passwords for your User Account and User Website, and avoid providing us or anyone with any sensitive Personal Information of which you believe its disclosure could cause you substantial or irreparable harm.</Text>
                    <Text style={styles.normalTextWithoutSpace}>Furthermore, because certain areas on our Services are less secure than others (for example, if you set your Support forum ticket to be “Public” instead of “Private”, or if you browse to a non-SSL page), and since e-mail and instant messaging are not recognized as secure forms of communications, we request and encourage you not to share any Personal Information on any of these areas or via any of these methods.</Text>
                    <Text style={styles.normalTextWithoutSpace}>If you have any questions regarding the security of our Services, you are welcome to contact us here.</Text>

                    <Text h4 style={styles.subTitle}>#wandoOra</Text>
                    <Text style={styles.normalTextWithoutSpace}>wandoOra Services values the security of our customers' Personal Information and we do everything in our power to protect it.</Text>
                    <Text style={styles.normalTextWithoutSpace}>However, as we can’t guarantee absolute protection – we encourage you to be careful, set a strong password for your account, and avoid submitting any sensitive information which, if exposed, could cause you major harm.</Text>

                    <Text h4 style={styles.subTitle}>14. Third-party websites</Text>
                    <Text style={styles.normalTextWithoutSpace}>Our Services may contain links to other websites or services. We are not responsible for such websites’ or services’ privacy practices. We encourage you to be aware when you leave our Services and to read the privacy statements of each and every website and service you visit before providing your Personal Information. This Privacy Policy does not apply to such linked third party websites and services.</Text>

                    <Text h4 style={styles.subTitle}>#wandoOra</Text>
                    <Text style={styles.normalTextWithoutSpace}>Our Services may contain links to other websites or services.</Text>

                    <Text h4 style={styles.subTitle}>15. wandoOra Services jobs applications</Text>
                    <Text style={styles.normalTextWithoutSpace}>wandoOra Services welcomes all qualified Applicants to apply to any of the open positions published at https://www.wandoOraServices.com/jobs, by sending us their contact details and CV (“Applicants Information”) via the relevant Position Application Form on our Website, or through any other means provided by us.</Text>
                    <Text style={styles.normalTextWithoutSpace}>We understand that privacy and discreetness are crucial to our Applicants, and are committed to keep Applicants Personal Information  private and use it solely for wandoOra Services internal recruitment purposes (including for identifying Applicants, evaluating their applications, making hiring and employment decisions, and contacting Applicants by phone or in writing).</Text>
                    <Text style={styles.normalTextWithoutSpace}>If you previously submitted your Applicants Personal Information to wandoOra Services, and now wish to access it, update it or have it deleted from wandoOra Services systems, please contact us at jobs@wandoOraServices.com.</Text>

                    <Text h4 style={styles.subTitle}>#wandoOra</Text>
                    <Text style={styles.normalTextWithoutSpace}>We welcome all qualified job seekers to apply to any of our open positions, by sending us their contact details and CV/Resume.</Text>
                    <Text style={styles.normalTextWithoutSpace}>We will use such Personal Information solely for our internal recruitment, employment and business purposes.</Text>

                    <Text h4 style={styles.subTitle}>16. Public forums and user content</Text>
                    <Text style={styles.normalTextWithoutSpace}>Our Services offer publicly accessible blogs, communities and support forums. Please be aware that any Personal Information you provide in any such areas may be read, collected, and used by others who access them. To request removal of your Personal Information from our blogs, communities or forums, feel free to contact us here. In some cases, we may not be able to remove your Personal Information from such areas. For example, if you use a third party application to post a comment (e.g., the Facebook social plugin application) while logged in to your related profile with such third party, you must login into such application or contact its provider if you want to remove the Personal Information you posted on that platform.</Text>
                    <Text style={styles.normalTextWithoutSpace}>In any event, we advise against posting any Personal Information (via any means) you don’t wish to publicize.</Text>
                    <Text style={styles.normalTextWithoutSpace}>If you upload any user content to your User Account or post it on your User Website and provide it in any other way as part of the use of any Service, you do so at your own risk.</Text>
                    <Text style={styles.normalTextWithoutSpace}>We have put adequate security measures in place to protect your Personal Information.  However, we cannot control the actions of other Users or members of the public who may access your User Content, and are not responsible for the circumvention of any privacy settings or security measures you or we may have placed on your User Website (including, for instance, password-protected areas on your User Website). You understand and acknowledge that, even after its removal by you or us, copies of User Content may remain viewable in cached and archived pages or if any third parties (including any of your Users-of-Users) have copied or stored such User Content. To clarify, we advise against uploading or posting any information you do not wish to be public.</Text>

                    <Text h4 style={styles.subTitle}>#wandoOra</Text>
                    <Text style={styles.normalTextWithoutSpace}>Avoid posting any Personal Information to any of the public areas on our Services, or to your own website, if you don’t want it to become publicly available.</Text>

                    <Text h4 style={styles.subTitle}>17. Updates and interpretation</Text>
                    <Text style={styles.normalTextWithoutSpace}>We may update this Privacy Policy as required by applicable law, and to reflect changes to our Personal Information collection, usage and storage practices. If we make any changes that we deem as “material” (in our sole good faith discretion), we will notify you (using one of the notification methods set forth in Section 15.3 of the Terms of Use) prior to the change becoming effective. In relation to any updated Privacy Policy, we will, as required by applicable law, notify you, seek your consent and/or take any other measures. We encourage you to periodically review this page for the latest Information on our privacy practices. Unless stated otherwise, our most current Privacy Policy applies to all information that we have about you and your Users-of-Users, with respect to our Website, wandoOra Services Apps, Mobile Apps and other Services.</Text>
                    <Text style={styles.normalTextWithoutSpace}>Any heading, caption or section title contained herein, and any explanation or summary under the right “#wandoOra” column, is provided only for convenience, and in no way defines or explains any section or provision hereof, or legally binds any of us in any way.</Text>
                    <Text style={styles.normalTextWithoutSpace}>This Privacy Policy was written in English, and may be translated into other languages for your convenience. You may access and view other language versions by changing your wandoOra Services Website language settings. If a translated (non-English) version of this Privacy Policy conflicts in any way with its English version, the provisions of the English version shall prevail.</Text>

                    <Text h4 style={styles.subTitle}>#wandoOra</Text>
                    <Text style={styles.normalTextWithoutSpace}>We may change this policy at any time. We will notify you of changes as required by applicable law.</Text>
                    <Text style={styles.normalTextWithoutSpace}>Translated (non-English) versions of these terms are provided for convenience only.</Text>

                    <Text h4 style={styles.subTitle}>18. Contacting us</Text>
                    <Text style={styles.normalTextWithoutSpace}>If you have any questions about this Privacy Policy or wish to exercise any of your rights as described in Sections 9 or 10 please refer to those sections or contact the Data Protection Officer team here. We will attempt to resolve any complaints regarding the use of your Personal Information in accordance with this Privacy Policy.</Text>

                    <Text style={{ ...styles.normalText }}>You may also contact us by mail at: </Text>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text h4 style={{ ...styles.normalTextWithoutSpace }}> {'\u2022'} </Text>
                        <Text style={styles.normalTextWithoutSpace}>wandoO, Inc. 3726 LAS VEGAS BLVD S Suite 1409, Las Vegas, NV 89158 U.S</Text>
                    </View>

                    <Text style={{ ...styles.normalText }}>For the purposes of GDPR (Article 27), you may contact our EU representative at:</Text>
                    <View style={{ alignSelf: 'flex-start', flexDirection: 'row' }}>
                        <Text h4 style={{ ...styles.normalTextWithoutSpace }}> {'\u2022'} </Text>
                        <Text style={styles.normalTextWithoutSpace}>wandoO, Inc. 3726 LAS VEGAS BLVD S Suite 1409, Las Vegas, NV 89158 U.S</Text>
                    </View>

                    <Text h4 style={styles.subTitle}>#wandoOra</Text>
                    <Text style={styles.normalText}>We may change this policy at any time. We will notify you of changes as required by applicable law.​</Text>
                    <Text style={styles.normalText}>Translated (non-English) versions of these terms are provided for convenience only.</Text>
                    <Text style={styles.normalText}>Effective from August 1, 2021</Text>
                    <Text style={{ ...styles.normalText, marginBottom: 50 }}>Welcome to wandoOraServices.com Privacy Policy</Text>
                </>

            </BasicScreen>
        </View>
    );
}

const styles = StyleSheet.create({
    subTitle: {
        alignSelf: 'flex-start',
        marginTop: 20,
        marginBottom: 10
    },
    normalText: {
        marginTop: 10,
        marginBottom: 10,
        textAlign: 'left',
        alignSelf: 'flex-start'
    },
    normalTextWithoutSpace: {
        marginTop: 0,
        marginBottom: 5
    },
    scrollView: {
        paddingTop: 30
    }
});

export default withTheme(PrivacyPolicy, '');