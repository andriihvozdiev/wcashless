import React, { useState, useEffect, useRef } from 'react';
import {
  View, StatusBar, Animated, StyleSheet, Dimensions, TouchableOpacity, Linking, Switch, Image, ImageBackground
} from 'react-native';
import { Text, Icon } from 'react-native-elements';
import { Dialog } from 'react-native-simple-dialogs';
import DeviceInfo from 'react-native-device-info';

import theme from '../constants/Theme';
import BasicScreen from '../components/BasicScreen';
import { commonStyles, fontStyles, textStyles } from '../styles/styles';
import { store } from '../redux/Store';
import { businessApiService } from '../service';
import LoadingIndicator from '../components/LoadingIndicator';
import { saveAccount } from '../redux/actions/UserActions';
import { FlatList } from 'react-native-gesture-handler';
import moment from 'moment';

const { width, height } = Dimensions.get('screen');

const face_id = require('../assets/images/face_id.png');
const my_profile = require('../assets/images/my_profile.png');
const my_cards = require('../assets/images/my_cards.png');
const email_icon = require('../assets/images/email.png');
const personalized_push = require('../assets/images/personalized_push.png');
const terms_privacy = require('../assets/images/privacy.png');
const reset_password = require('../assets/images/reset_password.png');
const star = require('../assets/images/star.png');
const promotions = require('../assets/images/promotions.png');


const SecurityPrivacy = ({
  navigation
}) => {

  const scrollViewRef = useRef();

  const [isLoading, setLoading] = useState(false);
  const [account, setAccount] = useState(store.getState().user?.account);
  const [accountSetting, setAccountSetting] = useState(store.getState().user?.account?.setting);

  const [devices, setDevices] = useState([]);
  const [isDeviceDialog, showDeviceDialog] = useState(false);

  useEffect(() => {
    getConnectedDevices();
  }, []);

  const getConnectedDevices = async () => {
    const result = await businessApiService.getAccountDevices();

    if (!result.error && result.data?.data) {
      const devices = result.data.data;
      setDevices(devices)
    }
  }

  const updateAccountSettings = async (key, value) => {
    const newSetting = { ...accountSetting, [key]: value };
    setAccountSetting(newSetting);

    const params = {
      data: {
        setting: newSetting
      }
    }

    setLoading(true);
    const response = await businessApiService.updateAccount(account?.id, params);
    setLoading(false);

    if (!response.error) {

      saveAccount({ ...account, setting: newSetting });
    }
  }

  const buildHeader = () => {
    return (
      <View style={{ width: '95%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'column', marginTop: 24 }}>
          <Text style={{ ...commonStyles.headerTitle, alignSelf: 'flex-start', marginStart: 12 }}>
            Security & Privacy
          </Text>
          <Text style={{ ...fontStyles.semibold, fontSize: 15, alignSelf: 'flex-start', marginStart: 12, color: theme.COLORS.BLUE }}>
            {account?.email}
          </Text>
        </View>
      </View>
    )
  }

  const renderDeviceItem = ({ item }) => {
    const device = item;
    const name = DeviceInfo.getModel();
    const type = `${DeviceInfo.getSystemName()} ${DeviceInfo.getSystemVersion()}`;

    return (
      <View key={device.id} style={{ marginBottom: 8 }}>
        <View style={styles.row}>
          <Image source={personalized_push} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>{device.name}, {device.type}</Text>
        </View>
        {(device?.name == name && device?.type == type) ?
          <Text style={{ ...fontStyles.regular, fontSize: 13, marginLeft: 36 }}>This device, Connected</Text>
          :
          <Text style={{ ...fontStyles.regular, fontSize: 13, marginLeft: 36 }}>This device, Last connected: {moment(device.lastConnectedAt).format('MM/DD/yy HH:mm')}</Text>
        }
      </View>
    );
  }

  return (
    <BasicScreen
      scrollViewRef={scrollViewRef}
      style={{ paddingTop: 50 }}
      header={buildHeader()}
    >
      <StatusBar barStyle='dark-content' backgroundColor='transparent' />
      {isLoading && <LoadingIndicator />}

      <Text style={{ ...textStyles.subTitle, marginTop: 30 }}>Security</Text>
      <View style={styles.boxContainer}>
        <TouchableOpacity style={styles.row} onPress={() => { navigation.navigate('PrivacyPolicy'); }}>
          <Image source={terms_privacy} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>Terms, conditions & privacy policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => { navigation.navigate('ResetPassword') }}>
          <Image source={reset_password} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>Reset password</Text>
        </TouchableOpacity>
        <View style={styles.row}>
          <Image source={face_id} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>Sign in with Face ID</Text>
          <Switch
            trackColor={{ true: 'black', false: 'grey' }}
            thumbColor='white'
            value={accountSetting?.isAllowedFaceID}
            onValueChange={(value) => {
              updateAccountSettings('isAllowedFaceID', value);
            }}
          />
        </View>
        <TouchableOpacity style={styles.row} onPress={() => { showDeviceDialog(true) }}>
          <Image source={my_cards} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>Devices</Text>
        </TouchableOpacity>
      </View>


      <Text style={{ ...textStyles.subTitle, marginTop: 30 }}>Marketing</Text>
      <View style={styles.boxContainer}>

        <View style={{ ...styles.row, alignItems: 'flex-start' }}>
          <Image source={email_icon} style={{ ...styles.rowIcon, height: 15, marginTop: 2 }}></Image>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowText}>Personalized emails</Text>
            <View style={styles.row}>
              <Text style={styles.descriptionText}>I am happy to receive emails about wandoOra products, services and offers that may interest me</Text>
              <Switch
                trackColor={{ true: 'black', false: 'grey' }}
                thumbColor='white'
                value={accountSetting?.isSubscribedEmail}
                onValueChange={(value) => {
                  updateAccountSettings('isSubscribedEmail', value);
                }}
                style={{ marginLeft: 10 }}
              />
            </View>
          </View>
        </View>

        <View style={{ ...styles.row, alignItems: 'flex-start' }}>
          <Image source={personalized_push} style={{ ...styles.rowIcon }}></Image>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowText}>Personalized pushes</Text>
            <View style={styles.row}>
              <Text style={styles.descriptionText}>I am happy to receive push notifications about wandoOra products, services and offers that may interest me</Text>
              <Switch
                trackColor={{ true: 'black', false: 'grey' }}
                thumbColor='white'
                value={accountSetting?.isAllowedPushNotification}
                onValueChange={(value) => {
                  updateAccountSettings('isAllowedPushNotification', value);
                }}
                style={{ marginLeft: 10 }}
              />
            </View>
          </View>
        </View>

        <View style={{ ...styles.row, alignItems: 'flex-start' }}>
          <Image source={star} style={{ ...styles.rowIcon }}></Image>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowText}>Personalized in-app recommendations</Text>
            <View style={styles.row}>
              <Text style={styles.descriptionText}>I am happy to see recommendations about wandoOra products, services and offers that may interest me</Text>
              <Switch
                trackColor={{ true: 'black', false: 'grey' }}
                thumbColor='white'
                value={accountSetting?.isAllowedAppRecommend}
                onValueChange={(value) => {
                  updateAccountSettings('isAllowedAppRecommend', value);
                }}
                style={{ marginLeft: 10 }}
              />
            </View>
          </View>
        </View>

        <View style={{ ...styles.row, alignItems: 'flex-start' }}>
          <Image source={my_profile} style={{ ...styles.rowIcon }}></Image>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowText}>Social media & advertising platforms</Text>
            <View style={styles.row}>
              <Text style={styles.descriptionText}>I am happy for wandoOra to share my name, email address and app events with social media platforms, to allow wandoOra to advertise to me and others like me</Text>
              <Switch
                trackColor={{ true: 'black', false: 'grey' }}
                thumbColor='white'
                value={accountSetting?.isAllowedAdvertising}
                onValueChange={(value) => {
                  updateAccountSettings('isAllowedAdvertising', value);
                }}
                style={{ marginLeft: 10 }}
              />
            </View>
          </View>
        </View>

      </View>


      <Text style={{ ...textStyles.subTitle, marginTop: 30 }}>Promotions</Text>
      <View style={styles.boxContainer}>

        <View style={styles.row}>
          <Image source={promotions} style={styles.rowIcon}></Image>
          <Text style={styles.rowText}>Third party promotions</Text>
        </View>
        <View style={{ ...styles.row, alignItems: 'flex-start' }}>
          <View style={styles.rowIcon}></View>
          <Text style={styles.descriptionText}>I want to receive email and push notifications from wandoOra about third-party promotions for travel, health, entertainment, food and drink, and other relevant areas. wandoOra does not share any personal information with our promotion providers.</Text>
          <Switch
            trackColor={{ true: 'black', false: 'grey' }}
            thumbColor='white'
            value={accountSetting?.isAllowedPromotion}
            onValueChange={(value) => {
              updateAccountSettings('isAllowedPromotion', value);
            }}
            style={{ marginLeft: 10 }}
          />
        </View>

      </View>

      {isDeviceDialog &&
        <Dialog
          visible={true}
          overlayStyle={{ padding: 0, backgroundColor: '#00000055' }}
          onTouchOutside={() => { showDeviceDialog(false) }}
          dialogStyle={{
            width: '90%',
            backgroundColor: theme.COLORS.WHITE,
            borderColor: theme.COLORS.SUCCESS,
            borderWidth: 2,
            borderRadius: 50,
            alignSelf: 'center',
            paddingVertical: 20
          }}>
          <TouchableOpacity onPress={() => { showDeviceDialog(false) }} style={{ alignSelf: 'flex-start' }}>
            <Icon name='close' size={30} />
          </TouchableOpacity>
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ ...fontStyles.bold, fontSize: 22 }}>
              My connected devices
            </Text>

            <Text style={{ ...fontStyles.semibold, fontSize: 16, marginTop: 20 }}>Please find list on connected devices to your account.</Text>
          </View>

          <FlatList
            data={devices}
            renderItem={renderDeviceItem}
            keyExtractor={(item) => item.id}
            style={{
              height: 160,
              marginHorizontal: 10,
              borderWidth: 1,
              borderRadius: 16,
              borderColor: theme.COLORS.GREY_COLOR,
              marginTop: 20,
            }}
            contentContainerStyle={{
              paddingVertical: 10,
              paddingHorizontal: 12,
            }}
          />

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
    resizeMode: 'contain',
    marginRight: 16
  },
  rowText: {
    flex: 1,
    ...fontStyles.semibold,
    fontSize: 16,
    color: 'black',
  },
  descriptionText: {
    flex: 1,
    ...fontStyles.regular,
    fontSize: 14,
    textAlign: 'justify'
  },
});

export default SecurityPrivacy;