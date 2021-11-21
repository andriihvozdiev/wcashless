import React, { useState, useEffect, useRef } from 'react';
import {
  View, StatusBar, Animated, StyleSheet, Dimensions, TouchableWithoutFeedback, TouchableOpacity, Image, Alert
} from 'react-native';
import { Input, Text } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import ReactNativeBiometrics from 'react-native-biometrics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { textStyles } from '../../styles/styles';
import CustomButton from '../../components/CustomButton';
import EmptyGap from '../../components/EmptyGap';
import BasicScreen from '../../components/BasicScreen';
import LoadingIndicator from '../../components/LoadingIndicator';
import theme from '../../constants/Theme';

import { businessApiService } from '../../service';
import { saveBusiness, saveBusinessMember, saveJwt, saveRole, saveUser } from '../../redux/actions/UserActions';

const { width, height } = Dimensions.get('screen');

const wpay_logo = require('../../assets/logo/w_3d.png');

const IMAGE_HEIGHT_SMALL = 48;
const IMAGE_HEIGHT = 96;

const Login = ({
  navigation
}) => {

  const scrollViewRef = useRef();
  const passwordRef = useRef();

  const imageHeight = useRef(new Animated.Value(IMAGE_HEIGHT)).current;
  const imagePadding = useRef(new Animated.Value(IMAGE_HEIGHT_SMALL)).current;

  const initialValues = { email: "", password: "" };
  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setLoading] = useState(false);

  const isBiometricSupport = async () => {
    let { available, biometryType } =
      await ReactNativeBiometrics.isSensorAvailable();
    if (available && biometryType === ReactNativeBiometrics.TouchID) {
      console.log('TouchID is supported', biometryType);
    } else if (available && biometryType === ReactNativeBiometrics.FaceID) {
      console.log('FaceID is supported', biometryType);
    } else if (available && biometryType === ReactNativeBiometrics.Biometrics) {
      console.log('Biometrics is supported', biometryType);
    } else {
      console.log('Biometrics not supported', biometryType);
    }
    if (available) {
      try {
        const savedEmail = await AsyncStorage.getItem('@email');
        const savedPassword = await AsyncStorage.getItem('@password');
        console.log({ savedEmail, savedPassword });
        if (savedEmail !== null && savedPassword !== null) {
          let { success, error } = await ReactNativeBiometrics.simplePrompt({
            promptMessage: 'Sign in with Touch ID or Face ID',
            cancelButtonText: 'Close',
          });
          console.log({ success, error });
          if (success) {
            handleChange('email', savedEmail);
            handleChange('password', savedPassword);
            await submit();
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  useEffect(() => {
    navigation.setOptions({ headerShown: false });

  }, []);

  const validate = (values) => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let errors = {}
    if (!values.email) {
      errors.email = "Please enter your email";

    } else if (!reg.test(values.email)) {
      errors.email = "Invalid email format";
    }
    if (!values.password) {
      errors.password = "Please enter your password";
    }
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) return true;
    return false;
  }

  const handleChange = (name, value) => {
    setFormValues({ ...formValues, [name]: value });
  }

  const saveLoginInfo = async (user) => {
    let { available, biometryType } = await ReactNativeBiometrics.isSensorAvailable();
    if (available) {
      try {
        const savedEmail = await AsyncStorage.getItem('@email');
        const savedPassword = await AsyncStorage.getItem('@password');
        if (savedEmail !== email.trim().toLowerCase() || savedPassword !== password) {
          let { success, error } = await ReactNativeBiometrics.simplePrompt({
            promptMessage: 'save login information with Touch ID or Face ID.',
            cancelButtonText: 'Close',
          });
          console.log({ success, error });

          if (success) {
            await AsyncStorage.setItem('@email', email.trim().toLowerCase());
            await AsyncStorage.setItem('@password', password);
          }
        }
      } catch (e) {
        console.log(e);
      }
    }
    // navigation.replace('Root', { user });

  };

  const login = async () => {
    setLoading(true);
    if (validate(formValues)) {
      submit();
    } else {
      setLoading(false);
    }
  }

  const submit = async () => {
    try {
      const result = await businessApiService.loginUser(formValues.email, formValues.password);
      setLoading(false);

      if (result.error || result.data === null) {

        var message = '';
        if (result.networkError) {
          message = 'Connection is failed. Please check your internet connection.'
        }

        if (result.data?.error) {
          const error = result.data?.error;
          message = error.message;
        }

        Alert.alert(
          'Login Failed',
          message,
          [
            { text: "ok", onPress: () => { } }
          ],
          { cancelable: true }
        );
      } else {
        if (result.data?.user?.account?.type == 'Customer') {
          return;
        } else {
          saveJwt(result.data?.jwt);
          await getUserProfile();
        }
      }
    } catch (err) {
      console.log(err.message);
      setLoading(false);
    }
  }

  const getUserProfile = async () => {
    setLoading(true);
    const result = await businessApiService.getUser();
    if (result.error || result.data === null) {
      setLoading(false);
    } else {

      saveUser(result.data);

      const businessResult = await businessApiService.getBusinessInfo();
      if (!businessResult.error && businessResult.data) {
        const businessData = businessResult.data.data[0];
        if (businessData) {
          saveBusinessMember(businessData);
          saveBusiness(businessData.business);
          saveRole(businessData.role, businessData.position);
        }
      }
      setLoading(false);
      navigation.replace('Root');
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
      <StatusBar barStyle='dark-content' backgroundColor='#FFF' />
      {isLoading &&
        <LoadingIndicator />
      }
      <EmptyGap />
      <View style={width > height ? styles.totalContainer_land : styles.totalContainer_port}>
        <Image source={wpay_logo} style={width > height ? styles.logo_land : styles.logo_port} />
        <View style={width > height ? styles.mainContainer_land : styles.mainContainer_port}>
          <Text style={styles.title}>
            sign in
          </Text>
          <Input
            inputContainerStyle={width > height ? styles.input_land : styles.input_port}
            label={<Text style={textStyles.normalText}>business email</Text>}
            placeholder='name@business.com'
            keyboardType='email-address'
            returnKeyType='next'
            errorStyle={{ color: theme.COLORS.ERROR, fontSize: 14 }}
            errorMessage={(formErrors.email || '').toLowerCase()}
            value={formValues.email}
            clearButtonMode='while-editing'
            onChange={(event) => {
              handleChange('email', event.nativeEvent.text.trim())
            }}
            onSubmitEditing={() => passwordRef.current.focus()}
          />
          <Input
            ref={passwordRef}
            inputContainerStyle={width > height ? styles.input_land : styles.input_port}
            label={<Text style={textStyles.normalText}>password</Text>}
            rightIcon={
              <TouchableWithoutFeedback onPressIn={() => setShowPassword(true)} onPressOut={() => setShowPassword(false)}>
                <Icon name={showPassword ? 'eye' : 'eye-slash'} size={24} color='#a0a0a0' style={{ marginRight: 8 }} />
              </TouchableWithoutFeedback>
            }
            keyboardType='default'
            returnKeyType='done'
            errorStyle={styles.error}
            errorProps={{ multiline: true }}
            errorMessage={(formErrors.password || '').toLowerCase()}
            value={formValues.password}
            secureTextEntry={!showPassword}
            onChange={(event) => {
              handleChange('password', event.nativeEvent.text.trim())
            }}
            onSubmitEditing={login}
          />

          <CustomButton title="LOG IN" onPressListener={login} />

          <View style={styles.commandbar}>
            <TouchableOpacity onPress={() => { navigation.navigate('ResetPassword') }}>
              <Text style={textStyles.mediumText}>forgot password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { }} style={{ marginLeft: 50 }}>
              <Text style={textStyles.mediumText} onPress={() => navigation.navigate('Signup')}>sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>


      <EmptyGap />
    </BasicScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
  },
  totalContainer_land: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalContainer_port: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContainer_land: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '50%',
    marginStart: 12
  },
  mainContainer_port: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '80%'
  },
  logo_land: {
    resizeMode: 'contain',
    width: '40%',
    height: IMAGE_HEIGHT * 3,
  },
  logo_port: {
    width: IMAGE_HEIGHT,
    height: IMAGE_HEIGHT,
    resizeMode: 'contain',
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    alignSelf: 'flex-start',
    fontSize: 28,
    textAlign: 'left',
    fontFamily: 'SourceSansPro-SemiBold',
    marginBottom: 36
  },
  error: { maxWidth: width - 64, textAlign: 'left', marginBottom: 24, color: theme.COLORS.ERROR, fontSize: 14 },
  commandbar: {
    width: '100%',
    marginTop: 24,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  input_land: {
    width: width * 0.4,
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
  input_port: {
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
});

export default Login;