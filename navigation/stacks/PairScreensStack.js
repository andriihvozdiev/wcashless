import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Header from '../../components/Header';

import PairBracelet from '../../screens/pair/PairBracelet';
import CreateWcashlessAccount from '../../screens/wcashlessUser/CreateWcashlessAccount';
import UnpairBracelet from '../../screens/pair/UnpairBracelet';
import MyProfile from '../../screens/MyProfile';
import MySettings from '../../screens/MySettings';
import PairedDevices from '../../screens/pair/PairedDevices';

const Stack = createStackNavigator();

const PairScreensStack = ({ navigation, route }) => {
  const mainHeader = (title, scene, isBack = true, showProfile = true) => {
    return <Header title={title} scene={scene} showProfile={showProfile} back={isBack} />
  }

  return (
    <Stack.Navigator
      initialRouteName="PairBracelet"
      presentation="card"
    >
      <Stack.Screen
        name="PairBracelet"
        component={PairBracelet}
        options={{
          header: ({ navigation, scene }) => mainHeader("", scene, false),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="CreateWcashlessAccount"
        component={CreateWcashlessAccount}
        options={{
          header: ({ navigation, scene }) => mainHeader("new wcashless user", scene),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="UnpairBracelet"
        component={UnpairBracelet}
        options={{
          header: ({ navigation, scene }) => mainHeader("", scene),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="PairedDevices"
        component={PairedDevices}
        options={{
          header: ({ navigation, scene }) => mainHeader("Paired devices", scene),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="MyProfile"
        component={MyProfile}
        options={{
          header: ({ navigation, scene }) => mainHeader("", scene, true, false),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="MySettings"
        component={MySettings}
        options={{
          header: ({ navigation, scene }) => mainHeader("", scene, true, false),
          headerTransparent: true
        }}
      />
    </Stack.Navigator>

  )
}

export default PairScreensStack;