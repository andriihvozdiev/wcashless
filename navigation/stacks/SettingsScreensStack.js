import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Header from '../../components/Header';
import MyProfile from '../../screens/MyProfile';
import MySettings from '../../screens/MySettings';
import PrivacyPolicy from '../../screens/PrivacyPolicy';
import BusinessSettings from '../../screens/BusinessSettings';
import BusinessProfile from '../../screens/BusinessProfile';
import SettingsScreen from '../../screens/SettingsScreen';
import SecurityPrivacy from '../../screens/SecurityPrivacy';

const Stack = createStackNavigator();

const SettingsScreenStack = ({ navigation, route }) => {

  const mainHeader = (navigation, title, isBack = true, showProfile = true) => {
    return <Header navigation={navigation} title={title} showProfile={showProfile} back={isBack} />
  }

  return (
    <Stack.Navigator
      initialRouteName="SettingsScreen"
      presentation="card"
    >
      <Stack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{
          // header: ({ navigation, scene }) => mainHeader(navigation, "", false, true),
          // headerTransparent: true,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MyProfile"
        component={MyProfile}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", true, false),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="MySettings"
        component={MySettings}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", true, false),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="BusinessProfile"
        component={BusinessProfile}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", true, false),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="BusinessSettings"
        component={BusinessSettings}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", true, false),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicy}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "terms, conditions, privacy policy", true, false),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="SecurityPrivacy"
        component={SecurityPrivacy}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", true, false),
          headerTransparent: true
        }}
      />
    </Stack.Navigator>

  )
}

export default SettingsScreenStack;