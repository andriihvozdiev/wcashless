import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, StatusBar, Alert, View, ImageBackground } from 'react-native';
import { Text } from 'react-native-elements';

import { businessApiService } from '../service';
import EmptyGap from '../components/EmptyGap';
import BasicScreen from '../components/BasicScreen';
import CustomButton from '../components/CustomButton';
import LoadingIndicator from '../components/LoadingIndicator';

import { store } from '../redux/Store';
import { saveBusiness, saveRole, logoutUser, saveBusinessMember } from '../redux/actions/UserActions';
import { commonStyles } from '../styles/styles';
import { color } from 'react-native-reanimated';

const { width, height } = Dimensions.get('screen');

const header_logo = require('../assets/logo/logo_bg.png');

const ManageCreates = ({
  navigation
}) => {

  const scrollViewRef = useRef();
  const [isLoading, setLoading] = useState(false);

  const [user, setUser] = useState(store.getState().user);
  const [role, setRole] = useState(store.getState().role?.role);

  useEffect(() => {
    if (store.getState().business == null || store.getState().role == null) {
      loadBusinessInfo();
    }
  }, [])

  const loadBusinessInfo = async () => {
    setLoading(true);
    const businessResult = await businessApiService.getBusinessInfo();
    if (businessResult.error) {
      if (businessResult.data?.error?.status == 401) {
        showAuthErrorAlert();
      }
    } else if (businessResult.data) {
      const businessData = businessResult.data.data[0];
      if (businessData) {
        saveBusiness(businessData.business);
        saveBusinessMember(businessData);
        saveRole(businessData.role, businessData.position);
        setRole(businessData.role);
      }
    }
    setLoading(false);
  }

  const showAuthErrorAlert = () => {
    Alert.alert(
      'Invalid User',
      'You account session has been expired. Please login again',
      [
        {
          text: "ok",
          onPress: () => {
            logoutUser();
            navigation.replace('Login');
          }
        }
      ],
      { cancelable: true }
    );
  }

  return (
    <BasicScreen
      scrollContainerStyle={styles.scrollView}
      scrollViewRef={scrollViewRef}
      statusBarBackground='#FFFFFF'
    >
      <StatusBar barStyle='dark-content' backgroundColor='transparent' />

      {isLoading &&
        <LoadingIndicator />
      }

      <Text style={commonStyles.headerTitle}>CREATE NEW</Text>

      <EmptyGap />

      {(user?.role?.type == 'superadmin' || role === 'Staff' || role == 'Owner') &&
        <>
          <CustomButton
            title="BUSINESS USER"
            width={250}
            height={60}
            fontSize={17}
            onPressListener={() => {
              navigation.navigate('BusinessUserSignup');
            }} />
        </>
      }

      <CustomButton title="WCASHLESS USER"
        width={250}
        height={60}
        fontSize={17}
        onPressListener={() => {
          navigation.navigate('CreateWcashlessAccount');
        }}
      />

      {(user?.role?.type == 'superadmin' || role === 'Owner') &&
        <>
          <CustomButton
            title="VENUE"
            width={250}
            height={60}
            fontSize={17}
            onPressListener={() => {
              navigation.navigate('CreateVenue');
            }} />

          <CustomButton
            title="EVENT"
            width={250}
            height={60}
            fontSize={17}
            onPressListener={() => {
              navigation.navigate('CreateEvent');
            }}
          />
        </>
      }
      <EmptyGap />
    </BasicScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
  },
});


export default ManageCreates;