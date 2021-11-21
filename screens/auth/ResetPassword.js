import React, { useState, useEffect, useRef } from 'react';
import {
  View, Animated, StyleSheet, Keyboard, Dimensions, TouchableWithoutFeedback, TouchableOpacity, Alert
} from 'react-native';
import { Input, Text } from 'react-native-elements';
import EmptyGap from '../../components/EmptyGap';
import BasicScreen from '../../components/BasicScreen';
import Icon from 'react-native-vector-icons/FontAwesome';

import theme from '../../constants/Theme';
import CustomButton from '../../components/CustomButton';
import LoadingIndicator from '../../components/LoadingIndicator';
import { fontStyles, textStyles } from '../../styles/styles';
import { businessApiService } from '../../service';

const { width, height } = Dimensions.get('screen');

const wpay_logo = require('../../assets/logo/w_3d.png');
const receive_wpay = require('../../assets/logo/wpay_white_w.png');
const reset_password_w = require('../../assets/images/reset_password_w.png');

const IMAGE_HEIGHT_SMALL = 48;
const IMAGE_HEIGHT = 96;

const ResetPassword = ({
  navigation
}) => {

  const scrollViewRef = useRef();
  const passwordRef = useRef();

  const imageHeight = useRef(new Animated.Value(IMAGE_HEIGHT)).current;
  const imagePadding = useRef(new Animated.Value(IMAGE_HEIGHT_SMALL)).current;

  const [isLoading, setLoading] = useState(false);
  const [status, setStatus] = useState(0);
  const [destination, setDestination] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [errorEmail, setErrorEmail] = useState();
  const [errorCode, setErrorCode] = useState();
  const [errorPassword, setErrorPassword] = useState();
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    setStatus(0);
    setEmail('');
    setDestination('');
    setCode('');
    setPassword('');
    setErrorEmail('');
    setErrorCode('');
    setErrorPassword('');

    Keyboard.addListener("keyboardWillShow", _keyboardDidShow);
    Keyboard.addListener("keyboardWillHide", _keyboardDidHide);
    Keyboard.addListener("keyboardDidShow", _keyboardDidShow);
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide);

    // cleanup function
    return () => {
      Keyboard.removeListener("keyboardWillShow", _keyboardDidShow);
      Keyboard.removeListener("keyboardWillHide", _keyboardDidHide);
      Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
      Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
    };
  }, []);

  const _keyboardDidShow = (event) => {
    Animated.timing(imageHeight, {
      duration: event.duration || 300,
      toValue: IMAGE_HEIGHT_SMALL,
      useNativeDriver: false
    }).start();
    Animated.timing(imagePadding, {
      duration: event.duration || 300,
      toValue: Platform.OS === "ios" ? 32 : 16,
      useNativeDriver: false
    }).start();
  }
  const _keyboardDidHide = (event) => {
    Animated.timing(imageHeight, {
      duration: event.duration || 300,
      toValue: IMAGE_HEIGHT,
      useNativeDriver: false
    }).start();
    Animated.timing(imagePadding, {
      duration: event.duration || 300,
      toValue: IMAGE_HEIGHT_SMALL,
      useNativeDriver: false
    }).start();
  }

  const resetRequest = async () => {
    if (!email.trim()) {
      return setErrorEmail(`Email required`);
    } else {
      setErrorEmail();
    }
    setLoading(true);
    const result = await businessApiService.forgotPassword(email.trim().toLowerCase());
    setLoading(false);
    if (result.error) {
      const message = `Cannot send verification code to ${email}`;
      Alert.alert(
        'Error',
        message,
        [
          { text: "ok", onPress: () => { } }
        ],
        { cancelable: true }
      );
      return
    } else {
      setStatus(1);
    }
  }

  const resetPassword = async () => {
    if (!code.trim()) {
      setErrorCode(`Validation code required`);
    } else {
      setErrorCode();
    }
    if (!password) {
      setErrorPassword(`Password required`);
    } else {
      setErrorPassword();
    }
    setLoading(true);
    try {
      const result = await businessApiService.resetPassword(password, password, code);
      setLoading(false);
      if (result.error) {
        const message = result.error.message;
        Alert.alert(
          'Error',
          message,
          [
            { text: "ok", onPress: () => { } }
          ],
          { cancelable: true }
        );
      } else {
        setStatus(2);
      }
    } catch (err) {
      setErrorPassword(err.message);
      setLoading(false);
    }
  }

  return (
    <BasicScreen
      scrollContainerStyle={styles.scrollView}
      scrollViewRef={scrollViewRef}
      style={{ marginTop: 0, paddingTop: 0 }}
      lightBg={false}
      showBottomLogo
    >
      {isLoading &&
        <LoadingIndicator />
      }
      <Animated.Image source={wpay_logo} style={[styles.logo, { height: imageHeight, marginTop: imagePadding }]} />
      <Text style={{ ...styles.title }}>
        reset password
      </Text>
      {status === 0 && <>
        <Input
          inputContainerStyle={styles.input}
          label={<Text style={textStyles.normalText} >account email</Text>}
          placeholder='name@business.com'
          keyboardType='email-address'
          returnKeyType='send'
          errorStyle={styles.error}
          errorMessage={(errorEmail || '').toLowerCase()}
          errorProps={{ multiline: true }}
          value={email}
          clearButtonMode='while-editing'
          onChange={(event) => {
            setEmail(event.nativeEvent.text.trim())
          }}
          onSubmitEditing={resetRequest}
        />
        <EmptyGap />
        <CustomButton
          title="RESET PASSWORD"
          icon={reset_password_w}
          width={240}
          height={60}
          fontSize={16}
          paddingLeft={20}
          iconSpace={16}
          onPressListener={resetRequest}
        />
      </>}

      {status === 1 && <>
        <Text multiline style={styles.info}>A verification code has been sent to your email: {email}</Text>
        <Input
          inputContainerStyle={styles.input}
          label={<Text >verification code</Text>}
          placeholder=''
          keyboardType='number-pad'
          returnKeyType='next'
          errorStyle={styles.error}
          errorMessage={(errorEmail || '').toLowerCase()}
          errorProps={{ multiline: true }}
          value={code}
          clearButtonMode='while-editing'
          onChange={(event) => {
            setCode(event.nativeEvent.text.trim())
          }}
          onSubmitEditing={() => passwordRef.current.focus()}
        />
        <Input
          ref={passwordRef}
          inputContainerStyle={styles.input}
          label={<Text>new password</Text>}
          rightIcon={<TouchableWithoutFeedback onPressIn={() => setShowPassword(true)} onPressOut={() => setShowPassword(false)}><Icon name={showPassword ? 'eye' : 'eye-slash'} size={24} color='#a0a0a0' style={{ marginRight: 8 }} /></TouchableWithoutFeedback>}
          keyboardType='default'
          returnKeyType='done'
          errorStyle={styles.error}
          errorProps={{ multiline: true }}
          errorMessage={(errorPassword || '').toLowerCase()}
          value={password}
          secureTextEntry={!showPassword}
          onChange={(event) => {
            setPassword(event.nativeEvent.text.trim())
          }}
          onSubmitEditing={resetPassword}
        />
        <CustomButton
          title="RESET"
          icon={reset_password_w}
          width={200}
          onPressListener={resetPassword}
        />
      </>}

      {status === 2 && <>
        <EmptyGap />
        <Text multiline style={styles.info}>Password reset. Please login now.</Text>
        <CustomButton
          title="LOG IN"
          icon={receive_wpay}
          width={220}
          onPressListener={() => navigation.goBack()}
        />
        <EmptyGap />
      </>}

      <View style={styles.commandbar}>
        <TouchableOpacity onPress={() => { navigation.goBack() }}>
          <Text style={textStyles.subTitle}>back</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { navigation.replace('Signup') }}>
          <Text style={textStyles.subTitle}>sign up</Text>
        </TouchableOpacity>
      </View>
      <EmptyGap />
    </BasicScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...fontStyles.semibold,
    fontSize: 28,
    marginLeft: 8,
    marginBottom: 36
  },
  scrollView: {
  },
  logo: {
    width: '100%',
    height: IMAGE_HEIGHT,
    resizeMode: 'contain',
    marginBottom: 20,
    marginTop: 20,
  },
  info: {
    maxWidth: width - 32, textAlign: 'left', marginBottom: 24, alignSelf: 'flex-start', marginLeft: 10
  },
  input: {
    width: width * 0.8,
    height: 50,
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    paddingLeft: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  error: { maxWidth: width - 64, textAlign: 'left', marginBottom: 24, color: theme.COLORS.ERROR, fontSize: 14 },
  commandbar: {
    width: '100%',
    marginTop: 36,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});

export default ResetPassword;