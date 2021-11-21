import React, { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

import { store } from '../redux/Store';
import { logoutUser, saveUser } from '../redux/actions/UserActions';
import { businessApiService } from '../service';

import Header from '../components/Header';
import Login from '../screens/auth/Login';
import Signup from '../screens/auth/Signup';
import ResetPassword from '../screens/auth/ResetPassword';
import TabNavigatorScreens from './TabNavigatorScreens';

const { width } = Dimensions.get('screen');
const Stack = createStackNavigator();

const Screens = ({
  navigation
}) => {

  const [route, setRoute] = React.useState(
    store.getState().jwt ? 'Root' : 'Login',
  );

  // on mount subscribe to store event
  React.useEffect(() => {
    store.subscribe(() => {
      setRoute(store.getState().jwt ? 'Root' : 'Login');
    });

    if (store.getState().jwt) {
      getUserProfile();
    }
  }, []);

  const getUserProfile = async () => {

    const result = await businessApiService.getUser();

    if (result.error || result.data === null) {
      logoutUser();
      setRoute('Login');
    } else {
      saveUser(result.data);
    }
  }

  return (
    <Stack.Navigator
      presentation="card"
      initialRouteName={route}
      screenOptions={{
        headerMode: 'screen',
      }}
    >
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              scene={scene}
              navigation={navigation}
            />
          ),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="Signup"
        component={Signup}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              scene={scene}
              navigation={navigation}
            />
          ),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPassword}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              scene={scene}
              navigation={navigation}
            />
          ),
          headerTransparent: true
        }}
      />

      <Stack.Screen
        name="Root"
        component={TabNavigatorScreens}
        options={{
          header: ({ navigation, scene }) => (
            <></>
          ),
          headerTransparent: true
        }}
      />

    </Stack.Navigator>
  )
}


export default (Screens);