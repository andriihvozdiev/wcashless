import React, { useState, useEffect, useRef } from 'react';
import {
  View, StatusBar, Animated, StyleSheet, Dimensions, TouchableOpacity, Linking, Share, Image
} from 'react-native';
import { Icon, Text } from 'react-native-elements';
import DeviceInfo from 'react-native-device-info';
import { Dialog } from 'react-native-simple-dialogs';

import theme from '../constants/Theme';
import BasicScreen from '../components/BasicScreen';
import { fontStyles, textStyles } from '../styles/styles';
import { store } from '../redux/Store';
import { logoutUser } from '../redux/actions/UserActions';
import CustomHeader from '../components/CustomHeader';

const { width, height } = Dimensions.get('screen');

const account_profile = require('../assets/images/account_profile.png');
const top_up = require('../assets/images/wpay_menu.png');
const wpair_icon = require('../assets/images/wpair_icon.png');
const transactions_payments = require('../assets/images/transactions_payments.png');
const analytics = require('../assets/images/analytics.png');
const w_exchange = require('../assets/images/w_exchange.png');
const my_profile = require('../assets/images/my_profile.png');
const my_cards = require('../assets/images/my_cards.png');
const my_settings = require('../assets/images/settings.png');
const business_settings = require('../assets/images/business_settings.png');
const contact_us = require('../assets/images/email.png');
const www_png = require('../assets/images/www.png');
const support_ticket = require('../assets/images/help_support.png');
const terms_privacy = require('../assets/images/privacy.png');
const reset_password = require('../assets/images/reset_password.png');
const close_account = require('../assets/images/close_account.png');
const log_out = require('../assets/images/log_out_w.png')
const share = require('../assets/images/share.png');
const arrow_next = require('../assets/images/arrow_next.png');

const IMAGE_HEIGHT_SMALL = 48;
const IMAGE_HEIGHT = 96;

const SettingsScreen = ({
  navigation
}) => {

  const scrollViewRef = useRef();

  const [account, setAccount] = useState(store.getState().user?.account);
  const [role, setRole] = useState(store.getState().role?.role);
  const [isHelpDialog, showHelpDialog] = useState(false);


  const imageHeight = useRef(new Animated.Value(IMAGE_HEIGHT)).current;
  const imagePadding = useRef(new Animated.Value(IMAGE_HEIGHT_SMALL)).current;

  useEffect(() => {
    
  }, [])

  const onShare = async () => {
    try {
      const result = await Share.share({
        message:
          'https://www.wcashless.com/',
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };


  return (
    <BasicScreen
      scrollViewRef={scrollViewRef}
      style={{ paddingTop: 30 }}
      header={<CustomHeader title={`${account?.firstName} ${account?.lastName}`} description={account?.email} />}
    >
      <StatusBar barStyle='dark-content' backgroundColor='transparent' />

      {/* <Text style={{ ...textStyles.subTitle, marginTop: 30 }}>wcashless account</Text>
      <View style={styles.boxContainer}>
        <TouchableOpacity style={styles.row} onPress={() => { }}>
          <Image source={account_profile} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => { }}>
          <Image source={top_up} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>Top-up wandoOs balance</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => { }}>
          <Image source={wpair_icon} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>My wristband, cards and digital wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => { }}>
          <Image source={my_cards} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>My cards</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => { }}>
          <Image source={transactions_payments} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>Transactions & payments history</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => { }}>
          <Image source={analytics} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>Analytics & Budget planner</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => { }}>
          <Image source={w_exchange} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>Exchange my wandoOs</Text>
        </TouchableOpacity>
      </View> */}

      <Text style={{ ...textStyles.subTitle, marginTop: 30 }}>Account Settings</Text>
      <View style={styles.boxContainer}>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('MyProfile')}>
          <Image source={my_profile} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>My profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('MySettings')}>
          <Image source={my_settings} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('ResetPassword')}>
          <Image source={reset_password} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>Reset password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => {showHelpDialog(true)}}>
          <Image source={support_ticket} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>Help & support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => Linking.openURL('https://www.wcashless.com')}>
          <Image source={www_png} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>www.wcashless.com</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => Linking.openURL('https://www.wcashless.com/accountclose')}>
          <Image source={close_account} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>Close account</Text>
        </TouchableOpacity>
      </View>

      {(role === 'Owner') &&
        <>
          <Text style={{ ...textStyles.subTitle, marginTop: 30 }}>Business & account settings</Text>
          <View style={{...styles.boxContainer, borderRadius: 12, paddingVertical: 8}}>

            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('BusinessProfile')}>
              <Image source={business_settings} style={styles.rowIcon}></Image>
              <Text style={styles.rowText}>Business profie</Text>
            </TouchableOpacity>
          
            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('BusinessSettings')}>
              <Image source={business_settings} style={styles.rowIcon}></Image>
              <Text style={styles.rowText}>Business settings</Text>
            </TouchableOpacity>
          
          </View>
        </>        
      }
      <Text style={{ ...textStyles.subTitle, marginTop: 30 }}>Security & Privacy</Text>
      <View style={{ ...styles.boxContainer, borderRadius: 12, paddingVertical: 8 }}>
        <TouchableOpacity style={styles.row} onPress={() => { navigation.navigate('SecurityPrivacy'); }}>
          <Image source={terms_privacy} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ ...fontStyles.regular, fontSize: 15 }}>wcashless App</Text>
          <Text style={{ ...fontStyles.regular, fontSize: 15, color: theme.COLORS.BLUE }}>
            Version {`${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`}
          </Text>
        </View>
        <TouchableOpacity style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', marginTop: 6 }} onPress={() => Linking.openURL('https://www.wcashless.com/contactus')}>
          <Image source={contact_us} style={{ width: 18, height: 13, marginEnd: 8, resizeMode: 'stretch' }}></Image>
          <Text style={{ ...fontStyles.regular, fontSize: 15, color: theme.COLORS.BLUE }}>Contact us</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', marginTop: 6 }} onPress={onShare}>
          <Image source={share} style={{ width: 18, height: 18, marginEnd: 8 }}></Image>
          <Text style={{ ...fontStyles.regular, fontSize: 15, color: theme.COLORS.BLUE }}>Share</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <Text style={{ ...fontStyles.regular, fontSize: 15 }}>Report an issue</Text>
          <TouchableOpacity style={{ paddingVertical: 6, paddingStart: 10 }} onPress={() => {showHelpDialog(true)}}>
            <Image source={arrow_next} style={{ width: 12, height: 12 }}></Image>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={{ ...styles.row, backgroundColor: '#444444', borderRadius: 12, height: 45, marginTop: 20, paddingHorizontal: 20 }} onPress={async () => {
        await logoutUser();
        navigation.replace('Login');
      }}>
        <Image source={log_out} style={{ ...styles.rowIcon, width: 16, height: 16 }}></Image>
        <Text style={{ ...styles.rowText, color: theme.COLORS.WHITE }}>Log Out</Text>
      </TouchableOpacity>

      {isHelpDialog &&
        <Dialog
          visible={true}
          overlayStyle={{ padding: 0, backgroundColor: '#00000055' }}
          onTouchOutside={() => {showHelpDialog(false)}}
          dialogStyle={{
            width: '90%',
            backgroundColor: theme.COLORS.WHITE,
            borderColor: theme.COLORS.SUCCESS,
            borderWidth: 2,
            borderRadius: 50,
            alignSelf: 'center',
            paddingVertical: 20
          }}>
          <TouchableOpacity onPress={() => {showHelpDialog(false)}} style={{alignSelf: 'flex-start'}}>
            <Icon name='close' size={30}/>
          </TouchableOpacity>
          <View style={{paddingHorizontal: 16}}>
            <Text style={{ ...fontStyles.bold, fontSize: 22 }}>
              wcashless Help & Support
            </Text>

            <Text style={{...fontStyles.semibold, fontSize: 16, marginTop: 20}}>You can use our Guides & FAQ on online.</Text>
            <Text style={{...fontStyles.semibold, fontSize: 16, marginTop: 12}}>Or Raise a Support ticket.</Text>
          </View>
                    
          <View style={{width: '100%', borderColor: theme.COLORS.GREY_COLOR, borderWidth: 1, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 16, marginTop: 16}}>
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} 
              onPress={() => {Linking.openURL('https://www.wcashless.com/faq') }}>
              <Image source={terms_privacy} style={{width: 20, height: 20, marginRight: 10}}></Image>
              <Text style={{...fontStyles.semibold, fontSize: 15}}>Help guides & FAQ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}} onPress={() => { Linking.openURL('https://wcashless.com/support-ticket') }}>
              <Image source={terms_privacy} style={{width: 20, height: 20, marginRight: 10}}></Image>
              <Text style={{...fontStyles.semibold, fontSize: 15}}>Contact support</Text>
            </TouchableOpacity>
          </View>
          
        </Dialog>
      }

    </BasicScreen >
  );
}

const styles = StyleSheet.create({
  boxContainer: {
    width: '100%',
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: theme.COLORS.BORDER_COLOR,
    borderRadius: 30,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  row: {
    width: '100%',
    marginTop: 6,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  rowIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain'
  },
  rowText: {
    flex: 1,
    ...fontStyles.semibold,
    fontSize: 16,
    color: 'black',
    marginLeft: 24,
  },
  bottomContainer: {
    width: '100%',
    marginTop: 30,
    backgroundColor: '#B4C9E8',
    borderColor: theme.COLORS.BORDER_COLOR,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});

export default SettingsScreen;