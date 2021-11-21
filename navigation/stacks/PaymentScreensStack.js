import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Header from '../../components/Header';
import ReceivePayment from '../../screens/payments/ReceivePayment';
import MyProfile from '../../screens/MyProfile';
import MySettings from '../../screens/MySettings';
import OtherPayment from '../../screens/payments/OtherPayment';

const Stack = createStackNavigator();

const PaymentScreensStack = ({ navigation, route }) => {
  const mainHeader = (title, scene, isBack, showProfile = true) => {
    return <Header title={title} scene={scene} showProfile={showProfile} back={isBack} />
  }

  return (
    <Stack.Navigator
      initialRouteName="ReceivePayment"
      presentation="card"
    >
      <Stack.Screen
        name="ReceivePayment"
        component={ReceivePayment}
        options={{
          header: ({ navigation, scene }) => mainHeader("", scene, false),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="OtherPayment"
        component={OtherPayment}
        options={{
          header: ({ navigation, scene }) => mainHeader("", scene, true),
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

export default PaymentScreensStack;