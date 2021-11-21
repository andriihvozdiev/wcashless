import React, { useState, useEffect, useRef } from 'react';
import {
  View, Animated, StyleSheet, Dimensions, TouchableOpacity, Image, StatusBar
} from 'react-native';
import { Input, withTheme, Text } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Dialog } from 'react-native-simple-dialogs';

import EmptyGap from '../../components/EmptyGap';
import BasicScreen from '../../components/BasicScreen';
import LoadingIndicator from '../../components/LoadingIndicator';
import { businessApiService, zapierService } from '../../service';
import theme from '../../constants/Theme';
import { fontStyles, textStyles } from '../../styles/styles';
import BlueButton from '../../components/BlueButton';

const { width, height } = Dimensions.get('screen');

const close_icon = require('../../assets/images/close.png');

const IMAGE_HEIGHT_SMALL = 48;
const IMAGE_HEIGHT = 96;

const CreateWcashlessAccount = ({
  navigation, route
}) => {

  const scrollViewRef = useRef();

  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const emailRef = useRef();

  const imageHeight = useRef(new Animated.Value(IMAGE_HEIGHT)).current;
  const imagePadding = useRef(new Animated.Value(IMAGE_HEIGHT_SMALL)).current;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const [errorFN, setErrorFN] = useState();
  const [errorLN, setErrorLN] = useState();
  const [errorEmail, setErrorEmail] = useState();

  const [isLoading, setLoading] = useState(false);

  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    setErrorFN('');
    setErrorLN('');
    setErrorEmail('');
  }, []);


  const createAccount = async () => {
    if (!firstName.trim()) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true })
      firstNameRef.current.focus();
      return setErrorFN(`First name required`);
    } else {
      setErrorFN();
    }
    if (!lastName.trim()) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true })
      lastNameRef.current.focus();
      return setErrorLN(`Last name required`);
    } else {
      setErrorLN();
    }
    if (!email.trim()) {
      scrollViewRef.current.scrollTo({ y: height * 0.2, animated: true })
      emailRef.current.focus();
      return setErrorEmail(`Email required`);
    } else {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
      if (!regex.test(email)) {
        scrollViewRef.current.scrollTo({ y: height * 0.2, animated: true })
        emailRef.current.focus();
        return setErrorEmail(`Invalid email format`);
      } else {
        setErrorEmail();
      }
    }

    try {
      let username = username = email.trim().toLowerCase();
      if (__DEV__) {
        username = username.replace('@', '');
      } else {
        username = username.replace('@', '_');
      }

      setLoading(true);

      const data = {
        firstName: firstName,
        lastName: lastName,
        username: `${firstName} ${lastName}`,
        email: email.trim(),
        type: 'Customer',
      }
      const result = await businessApiService.createBusinessAccount(data);
      setLoading(false);

      if (result.error) {
        setCompleted(false);
        return;
      }

      scrollViewRef.current.scrollTo({ y: 0, animated: true })

      // Enroll wcashless member to PASSKIT
      const passkitParams = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
      }
      await zapierService.createPasskit(passkitParams);

      setCompleted(true);

    } catch (error) {
      console.log(error);
      setCompleted(false);
    }
  }

  return (
    <BasicScreen
      scrollContainerStyle={styles.scrollView}
      scrollViewRef={scrollViewRef}
    >

      <StatusBar barStyle='dark-content' backgroundColor='transparent' />
      {isLoading && <LoadingIndicator />}

      <Text style={{ ...textStyles.subTitle, marginTop: 20 }}>User information</Text>
      <View style={styles.rowItem}>
        <Text style={styles.rowTitle}>First Name</Text>
        <Input
          ref={firstNameRef}
          containerStyle={styles.subInputContainer}
          inputContainerStyle={styles.subInput}
          inputStyle={styles.rowDescription}
          keyboardType='ascii-capable'
          placeholder='First name'
          returnKeyType='next'
          textAlign='right'
          errorStyle={{ height: 0 }}
          value={firstName}
          clearButtonMode='while-editing'
          onChange={(event) => {
            setFirstName(event.nativeEvent.text.trim());
          }}
          onSubmitEditing={() => lastNameRef.current.focus()}
        />
      </View>
      {(errorFN != undefined && errorFN != '') &&
        <Text style={styles.errorStyle}>{errorFN}</Text>
      }

      <View style={styles.rowItem}>
        <Text style={styles.rowTitle}>Last Name</Text>
        <Input
          ref={lastNameRef}
          containerStyle={styles.subInputContainer}
          inputContainerStyle={styles.subInput}
          inputStyle={styles.rowDescription}
          keyboardType='ascii-capable'
          returnKeyType='next'
          textAlign='right'
          placeholder='Last name'
          errorStyle={{ height: 0 }}
          value={lastName}
          clearButtonMode='while-editing'
          onChange={(event) => {
            setLastName(event.nativeEvent.text.trim());
          }}
        />
      </View>
      {(errorLN != undefined && errorLN != '') && <Text style={styles.errorStyle}>{errorLN}</Text>}

      <View style={styles.rowItem}>
        <Text style={styles.rowTitle}>Email</Text>
        <Input
          ref={emailRef}
          containerStyle={styles.subInputContainer}
          inputContainerStyle={styles.subInput}
          inputStyle={styles.rowDescription}
          placeholder='name@example.com'
          keyboardType='email-address'
          returnKeyType='next'
          textAlign='right'
          errorStyle={{ height: 0 }}
          value={email}
          clearButtonMode='while-editing'
          onChange={(event) => {
            setEmail(event.nativeEvent.text.trim());
          }}
        />
      </View>
      {(errorEmail != undefined && errorEmail != '') && <Text style={styles.errorStyle}>{errorEmail}</Text>}

      <EmptyGap />

      <BlueButton
        title="Create account"
        style={{ marginTop: 20 }}
        onPressListener={createAccount}
      />


      {completed &&
        <Dialog
          visible={true}
          overlayStyle={{ padding: 0 }}
          dialogStyle={{
            width: '90%',
            backgroundColor: theme.COLORS.WHITE,
            borderColor: theme.COLORS.SUCCESS,
            borderWidth: 2,
            borderRadius: 50,
            alignSelf: 'center',
            paddingVertical: 20
          }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ ...fontStyles.bold, fontSize: 28, alignSelf: 'flex-start', marginLeft: 8 }}>
                Success
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => { navigation.goBack() }}>
                <Image source={close_icon} style={styles.closeIcon} />
              </TouchableOpacity>
            </View>

            <Text style={{ ...fontStyles.semibold, fontSize: 17, marginTop: 20 }}>Please check your email to verify your account.</Text>

            <BlueButton
              title='Back'
              onPressListener={() => { navigation.goBack() }}
              width={width * 0.7}
              style={{ marginTop: 30 }}
            />

          </View>
        </Dialog>
      }
    </BasicScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
  },
  rowItem: {
    height: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: theme.COLORS.BORDER_COLOR,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 10
  },
  rowTitle: {
    ...fontStyles.regular,
    fontSize: 15
  },
  rowDescription: {
    ...fontStyles.regular,
    fontSize: 15,
    color: theme.COLORS.BLUE
  },
  subInputContainer: {
    flex: 1,
    height: 40,
    paddingLeft: 0,
    paddingRight: 0,
  },
  subInput: {
    height: 40,
    paddingLeft: 8,
    borderBottomColor: 'transparent'
  },
  errorStyle: {
    alignSelf: 'flex-end',
    color: theme.COLORS.ERROR,
    fontSize: 14,
    marginEnd: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  closeIcon: {
    width: 15,
    height: 15
  },
});

export default withTheme(CreateWcashlessAccount, '');