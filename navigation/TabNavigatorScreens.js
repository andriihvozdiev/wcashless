import React, { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { businessApiService } from '../service';

import PairScreensStack from './stacks/PairScreensStack';
import PaymentScreensStack from './stacks/PaymentScreensStack';
import BusinessScreensStack from './stacks/BusinessScreensStack';
import SettingsScreenStack from './stacks/SettingsScreensStack';

const wpay_icon = require('../assets/logo/wpay_white_w.png');
const pair_icon = require('../assets/images/wpair_w.png');
const business_icon = require('../assets/images/business_w.png');
const settings_icon = require('../assets/images/settings_w.png');

const Tab = createBottomTabNavigator();

const TabNavigatorScreens = ({ navigation, route }) => {

  useEffect(() => {
    getDeviceInfo();
  }, []);

  const getDeviceInfo = async () => {
    const name = DeviceInfo.getModel();
    const type = `${DeviceInfo.getSystemName()} ${DeviceInfo.getSystemVersion()}`;
    const result = await businessApiService.setAccountDevice(name, type);
  }

  return (
    <Tab.Navigator
      initialRouteName="Home"
      presentation="card"
      screenOptions={({ route }) => ({
        tabBarShowLabel: false,
        tabBarActiveTintColor: 'white',
        tabBarStyle: {
          backgroundColor: '#000'
        },
      })}
    >
      <Tab.Screen
        name="WPAY"
        component={PaymentScreensStack}
        options={{
          header: ({ navigation, scene }) => <></>,
          headerTransparent: true,
          tabBarIcon: ({ color, size }) => <Image source={wpay_icon} style={{ width: size, height: size }} tintColor={color} />,
        }}
      />
      <Tab.Screen
        name="PAIR"
        component={PairScreensStack}
        options={{
          header: ({ navigation, scene }) => <></>,
          headerTransparent: true,
          tabBarIcon: ({ color, size }) => <Image source={pair_icon} style={{ width: size + 10, height: size + 10, resizeMode: 'contain' }} tintColor={color} />,
        }}
      />
      <Tab.Screen
        name="BUSINESS"
        component={BusinessScreensStack}
        options={{
          header: ({ navigation, scene }) => <></>,
          headerTransparent: true,
          tabBarIcon: ({ color, size }) => <Image source={business_icon} style={{ width: size, height: size }} tintColor={color} />,
        }}
      />
      <Tab.Screen
        name="SETTINGS"
        component={SettingsScreenStack}
        options={{
          header: ({ navigation, scene }) => <></>,
          headerTransparent: true,
          tabBarIcon: ({ color, size }) => <Image source={settings_icon} style={{ width: size, height: size }} tintColor={color} />,
        }}
      />
    </Tab.Navigator >

  )
}

export default TabNavigatorScreens;