import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, StatusBar, ImageBackground, Image, View, TouchableOpacity, Dimensions, Share, Linking } from 'react-native';
import { Text } from 'react-native-elements';
import DeviceInfo from 'react-native-device-info';

import EmptyGap from '../components/EmptyGap';
import BasicScreen from '../components/BasicScreen';
import { store } from '../redux/Store';
import { commonStyles, fontStyles } from '../styles/styles';
import BusinessHeader from '../components/BusinessHeader';
import theme from '../constants/Theme';

const { width, height } = Dimensions.get('screen');

const square_bg = require('../assets/images/sq_button.png');
const pair_icon = require('../assets/images/wpair_w.png');
const wpay_icon = require('../assets/logo/wpay_white_w.png');
const financial_icon = require('../assets/images/financial_icon.png');
const settigns_icon = require('../assets/images/settings_w.png');
const share = require('../assets/images/share.png');
const arrow_next = require('../assets/images/arrow_next.png');
const contact_us = require('../assets/images/email.png');

const ManageBusiness = ({
  navigation
}) => {

  const scrollViewRef = useRef();

  const [user, setUser] = useState(store.getState().user);
  const [business, setBusiness] = useState(store.getState().business);
  const [role, setRole] = useState(store.getState().role?.role);

  useEffect(() => {

  }, []);

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
      style={{ paddingTop: 50 }}
      statusBarBackground='#FFFFFF'
      header={<BusinessHeader title={business?.name} description={user?.account?.email} />}
    >
      <StatusBar barStyle='dark-content' backgroundColor='transparent' />

      <View style={styles.titleRow}>
        <ImageBackground source={square_bg} style={styles.titleBackground}>
          <Image source={wpay_icon} style={styles.titleIcon} />
          <Text style={styles.titleIconText}>WPAY</Text>
        </ImageBackground>
        <Text style={styles.titleText}>WPAY</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuRow} onPress={() => { navigation.navigate('WPAY') }}>
          <Text style={styles.menuLabel}>WPAY</Text>
        </TouchableOpacity>
        {(role === 'Manager' || role === 'Owner' || user?.role?.type == 'superadmin') &&
          <TouchableOpacity style={styles.menuRow} onPress={() => { navigation.navigate('RefundByNFC') }}>
            <Text style={styles.menuLabel}>Refund to wristband, wallet or card</Text>
          </TouchableOpacity>
        }
        {(user?.role?.type == 'superadmin') &&
          <>
            <TouchableOpacity style={styles.menuRow} onPress={() => { navigation.navigate('AddWandoos'); }}>
              <Text style={styles.menuLabel}>Add wandoOs</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuRow} onPress={() => { navigation.navigate('RemoveWandoos'); }}>
              <Text style={styles.menuLabel}>Remove wandoOs</Text>
            </TouchableOpacity>
          </>
        }
      </View>

      <View style={styles.titleRow}>
        <ImageBackground source={square_bg} style={styles.titleBackground}>
          <Image source={pair_icon} style={styles.titleIcon} />
          <Text style={styles.titleIconText}>PAIR</Text>
        </ImageBackground>
        <Text style={styles.titleText}>User management</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuRow} onPress={() => { navigation.navigate('PAIR') }}>
          <Text style={styles.menuLabel}>WPAIR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuRow} onPress={() => { navigation.navigate('PAIR', { screen: 'UnpairBracelet' }) }}>
          <Text style={styles.menuLabel}>Unlink wcashless wristband, wallet or card</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuRow} onPress={() => { navigation.navigate('CreateWcashlessAccount') }}>
          <Text style={styles.menuLabel}>Create new wcashless user</Text>
        </TouchableOpacity>
        {(user?.role?.type == 'superadmin' || role == 'Owner') &&
          <TouchableOpacity style={styles.menuRow} onPress={() => { navigation.navigate('BusinessUserSignup') }}>
            <Text style={styles.menuLabel}>Create new business user</Text>
          </TouchableOpacity>
        }
      </View>

      {role != 'Staff' && 
        <>
          <View style={styles.titleRow}>
            <ImageBackground source={square_bg} style={styles.titleBackground}>
              <Image source={financial_icon} style={styles.titleIcon} />
              <Text style={{ ...styles.titleIconText, fontSize: 6 }}>FINANCIAL</Text>
            </ImageBackground>
            <Text style={styles.titleText}>Financial</Text>
          </View>

          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuRow} onPress={() => { navigation.navigate('TransactionsHistory') }}>
              <Text style={styles.menuLabel}>Transactions and payment history</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuRow} onPress={() => { navigation.navigate('PayoutScreen') }}>
              <Text style={styles.menuLabel}>Payouts</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuRow} onPress={() => {
              if (user?.role?.type == 'superadmin') {
                navigation.navigate('AllBusinessBalances');
              } else {
                navigation.navigate('BusinessBalance');
              }
            }}>
              <Text style={styles.menuLabel}>Business balances</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuRow} onPress={() => { }}>
              <Text style={styles.menuLabel}>Add payout method</Text>
            </TouchableOpacity>

          </View>
        </>
      }
      

      <View style={styles.titleRow}>
        <ImageBackground source={square_bg} style={styles.titleBackground}>
          <Image source={settigns_icon} style={styles.titleIcon} />
          <Text style={{ ...styles.titleIconText, fontSize: 6 }}>MANAGE</Text>
        </ImageBackground>
        <Text style={styles.titleText}>Settings</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuRow} onPress={() => { navigation.navigate('MySettings') }}>
          <Text style={styles.menuLabel}>My settings</Text>
        </TouchableOpacity>
        {(role === 'Owner') &&
          <TouchableOpacity style={styles.menuRow} onPress={() => { navigation.navigate('BusinessSettings') }}>
            <Text style={styles.menuLabel}>Business settings</Text>
          </TouchableOpacity>
        }
        {(user?.role?.type == 'superadmin' || role === 'Owner') &&
          <>
            <TouchableOpacity style={styles.menuRow} onPress={() => {
              if (user?.role?.type == 'superadmin') navigation.navigate('AdminManageUsers');
              else navigation.navigate('ManageUsers');
            }}>
              <Text style={styles.menuLabel}>Business users</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuRow} onPress={() => {
              if (user?.role?.type == 'superadmin') navigation.navigate('AdminManageSites', { type: 'Venue' });
              else navigation.navigate('ManageVenues');
            }}>
              <Text style={styles.menuLabel}>Venues & settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuRow} onPress={() => {
              if (user?.role?.type == 'superadmin') navigation.navigate('AdminManageSites', { type: 'Event' });
              else navigation.navigate('ManageEvents');
            }}>
              <Text style={styles.menuLabel}>Events & settings</Text>
            </TouchableOpacity>
          </>
        }
      </View>

      <EmptyGap />
      <View style={styles.bottomContainer}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ ...fontStyles.regular, fontSize: 15 }}>wcashless App</Text>
          <Text style={{ ...fontStyles.regular, fontSize: 15, color: theme.COLORS.BLUE }}>
            Version: {`${DeviceInfo.getVersion()}(${DeviceInfo.getBuildNumber()})`}
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
          <TouchableOpacity style={{ paddingVertical: 6, paddingStart: 10 }} onPress={() => Linking.openURL('https://wcashless.com/support-ticket')}>
            <Image source={arrow_next} style={{ width: 12, height: 12 }}></Image>
          </TouchableOpacity>
        </View>
      </View>
    </BasicScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
  },
  titleRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginTop: 20
  },
  titleBackground: {
    width: 40,
    height: 40,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  titleIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain'
  },
  titleIconText: {
    ...fontStyles.regular,
    fontSize: 8,
    color: theme.COLORS.WHITE,
    marginTop: 1
  },
  titleText: {
    ...fontStyles.bold,
    fontSize: 20,
    marginLeft: 20
  },
  menuContainer: {
    width: '100%',
    marginTop: 12,
    backgroundColor: theme.COLORS.WHITE,
    borderWidth: 0.5,
    borderColor: theme.COLORS.BORDER_COLOR,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16
  },
  menuRow: {
    paddingHorizontal: 16,
    paddingVertical: 4
  },
  menuLabel: {
    ...fontStyles.semibold,
    fontSize: 17
  },
  bottomContainer: {
    marginTop: 30,
    width: '100%',
    backgroundColor: '#B4C9E8',
    borderColor: theme.COLORS.BORDER_COLOR,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8
  }
});


export default ManageBusiness;