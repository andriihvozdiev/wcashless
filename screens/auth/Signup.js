import React, { useState, useEffect, useRef } from 'react';
import {
  View, Animated, StyleSheet, Keyboard, Dimensions, TouchableWithoutFeedback, TouchableOpacity, Alert
} from 'react-native';
import { Input, withTheme, Text } from 'react-native-elements';
import PhoneInput from "react-native-phone-number-input";
import Icon from 'react-native-vector-icons/FontAwesome';
import DropDownPicker from 'react-native-dropdown-picker';

import EmptyGap from '../../components/EmptyGap';
import BasicScreen from '../../components/BasicScreen';
import LoadingIndicator from '../../components/LoadingIndicator';
import theme from '../../constants/Theme';
import { textStyles, inputStyles, fontStyles } from '../../styles/styles';
import CustomButton from '../../components/CustomButton';

import { businessApiService, zapierService } from '../../service';
import { saveUserJWT } from '../../redux/actions/UserActions';

const { width, height } = Dimensions.get('screen');

const wpay_logo = require('../../assets/logo/w_3d.png');
const receive_wpay = require('../../assets/logo/wpay_white_w.png');

const IMAGE_HEIGHT_SMALL = 48;
const IMAGE_HEIGHT = 96;


const Signup = ({
  navigation
}) => {

  const scrollViewRef = useRef();

  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const businessNameRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();
  const passwordRef = useRef();

  const imageHeight = useRef(new Animated.Value(IMAGE_HEIGHT)).current;
  const imagePadding = useRef(new Animated.Value(IMAGE_HEIGHT_SMALL)).current;

  const initialValues = {
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    businessName: '',
    password: '',
    phone: '',
    address: '',
    businessType: 0
  };

  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [nameRowMarginBottom, setNameRowMarginBottom] = useState(0);

  const [isLoading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('US')

  const [open, setOpen] = useState(false);
  const ITEM_HEIGHT = 42
  const [businessTypeItems, setBusinessTypeItems] = useState([
    { label: 'Small Business or Independant', value: 0 },
    { label: 'Single business/venue owner', value: 1 },
    { label: 'Multiple business/venues', value: 2 },
    { label: 'Event owner', value: 3 },
  ]);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, []);

  const validate_password = (password) => {
    let check = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
    if (password.match(check)) {
      console.log("Your password is strong.");
      return true;
    } else {
      console.log("Meh, not so much.");
      return false;
    }
  }

  const validate = (values) => {
    let errors = {};
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    if (!values.email) {
      errors.email = "Please enter your email";
    } else if (!regex.test(values.email)) {
      errors.email = "Invalid email format";
    }

    var marginBottom = 0;
    if (!values.firstName) {
      errors.firstName = "Please enter your First Name";
      marginBottom = 24;
    } else if (values.firstName.length < 3) {
      errors.firstName = "First Name must be at least 3 characters long!";
      marginBottom = 40;
    }

    if (!values.lastName) {
      errors.lastName = "Please enter your Last Name";
      if (marginBottom == 0) marginBottom = 24;
    } else if (values.lastName.length < 3) {
      errors.lastName = "Last Name must be at least 3 characters long!";
      marginBottom = 40;
    }

    setNameRowMarginBottom(marginBottom);

    if (!values.phone) {
      errors.phone = "Please enter your phone number";
    }

    if (!values.password) {
      errors.password = "Please enter your password";
    } else {
      if (!validate_password(values.password)) {
        errors.password = "The password must contain at least 8 characters, 1 numeric/special character, lowercase/uppercase alphabetical character."
      }
    }

    setFormErrors(errors);
    if (Object.keys(errors).length === 0) return true;

    return false;
  }

  const signup = async () => {
    setLoading(true);
    if (validate(formValues)) {

      try {
        const data = {
          username: `${formValues.firstName} ${formValues.lastName}`,
          email: formValues.email,
          password: formValues.password,
          firstName: formValues.firstName,
          lastName: formValues.lastName,
          phone: formValues.phone,
          address: formValues.address ? formValues.address : ' ',
          type: 'Owner',
          businessName: formValues.businessName,
          businessType: formValues.businessType
        }
        const result = await businessApiService.createBusinessAccount(data);

        if (result.error || result.data === null) {
          console.log(result.error);
        } else {

          const params = JSON.stringify({
            firstName: formValues?.firstName,
            lastName: formValues?.lastName,
            businessEmail: formValues?.email,
            phone: formValues?.phone,
            businessName: formValues?.businessName
          })

          zapierService.welcomeB2BRegistration(params);

          // if (businessName === B2B_USER_GROUP) {
          //   zapierService.welcomeB2BRegistration(params);
          // } else {
          //   zapierService.sendZapierWebhook('https://hooks.zapier.com/hooks/catch/10531013/b4vqy73/', params);
          // }

          Alert.alert(
            "Success",
            "Please check your email to verify your account.",
            [
              { text: "Login", onPress: () => { navigation.replace('Login') } }
            ],
            { cancelable: true }
          );

        }
        setLoading(false);
      } catch (err) {
        console.log(err.message);
        setLoading(false);
      }
    } else {
      setLoading(false);
    }

    setLoading(false);
  }

  const handleChange = (name, value) => {
    setFormValues({ ...formValues, [name]: value });
  };

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
      <Text style={styles.title}>
        sign up
      </Text>
      <>
        <Text style={{ ...textStyles.subTitle, marginStart: 20, marginBottom: 12 }}>my details</Text>

        <View style={styles.rowItem}>
          <Input
            ref={firstNameRef}
            containerStyle={{ ...inputStyles.container, flex: 1 }}
            inputContainerStyle={{ ...inputStyles.inputContainer, ...styles.inputContainer }}
            keyboardType='ascii-capable'
            placeholder='first name'
            returnKeyType='next'
            errorStyle={{ color: theme.COLORS.ERROR, fontSize: 14 }}
            errorMessage={(formErrors.firstName || '').toLowerCase()}
            value={formValues.firstName}
            clearButtonMode='while-editing'
            onChange={(event) => {
              handleChange('firstName', event.nativeEvent.text.trim())
            }}
            onSubmitEditing={() => lastNameRef.current.focus()}
          />
          <Input
            ref={lastNameRef}
            containerStyle={{ ...inputStyles.container, flex: 1, marginLeft: 10 }}
            inputContainerStyle={{ ...inputStyles.inputContainer, ...styles.inputContainer }}
            keyboardType='ascii-capable'
            returnKeyType='next'
            placeholder='last name'
            errorStyle={{ color: theme.COLORS.ERROR, fontSize: 14 }}
            errorMessage={(formErrors.lastName || '').toLowerCase()}
            value={formValues.lastName}
            clearButtonMode='while-editing'
            onChange={(event) => {
              handleChange('lastName', event.nativeEvent.text.trim())
            }}
            onSubmitEditing={() => emailRef.current.focus()}
          />
        </View>

        <Input
          ref={emailRef}
          containerStyle={{ ...inputStyles.container, width: width * 0.8 }}
          inputContainerStyle={{ ...inputStyles.inputContainer, ...styles.inputContainer }}
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
        />

        <PhoneInput
          ref={phoneRef}
          defaultCode={countryCode}
          containerStyle={styles.phoneInput}
          textContainerStyle={{ backgroundColor: 'transparent', paddingTop: 0, paddingBottom: 0 }}
          textInputStyle={{ height: 40, fontSize: 15, marginTop: 2, paddingTop: 0, paddingBottom: 0 }}
          layout="first"
          onChangeFormattedText={(text) => {
            handleChange('phone', text);
          }}
        />
        {formErrors.phone !== '' &&
          <Text style={{ ...styles.error, alignSelf: 'flex-start', marginLeft: 20, marginTop: 8 }}>{formErrors.phone}</Text>
        }

        <Text style={{ ...textStyles.subTitle, marginTop: 20, marginStart: 20 }}>my business</Text>
        <Input
          ref={businessNameRef}
          containerStyle={{ ...inputStyles.container, width: width * 0.8 }}
          inputContainerStyle={{ ...inputStyles.inputContainer, ...styles.inputContainer }}
          placeholder='business name'
          keyboardType='ascii-capable'
          returnKeyType='next'
          errorStyle={{ color: theme.COLORS.ERROR, fontSize: 14 }}
          errorMessage={(formErrors.businessName || '').toLowerCase()}
          value={formValues.businessName}
          clearButtonMode='while-editing'
          onChange={(event) => {
            handleChange('businessName', event.nativeEvent.text)
          }}
        />

        <DropDownPicker
          placeholder='business owner type'
          placeholderStyle={{ color: 'grey' }}
          open={open}
          value={formValues.businessType}
          items={businessTypeItems}
          setOpen={setOpen}
          onSelectItem={(item) => {
            console.log(item);
            handleChange('businessType', item.value)
          }}
          setItems={setBusinessTypeItems}
          style={{ width: width * 0.8 }}
          listMode="SCROLLVIEW"
          scrollViewProps={{ nestedScrollEnabled: true }}
          containerStyle={{ width: width * 0.8, marginTop: 12 }}
        />
        {formErrors.businessType !== '' &&
          <Text style={{ ...styles.error, alignSelf: 'flex-start', marginLeft: 20, marginTop: 8 }}>{formErrors.businessType}</Text>
        }

        <Text style={{ ...textStyles.smallText, marginTop: 20, marginStart: 20, marginEnd: 20 }}>
          <Text style={textStyles.subTitle}>Note: </Text>You will create your business/venues/locations once your account is validated in your business settings.
        </Text>

        <Text style={{ ...textStyles.subTitle, marginTop: 20, marginStart: 20 }}>password</Text>
        <Input
          ref={passwordRef}
          containerStyle={{ ...inputStyles.container, width: width * 0.8 }}
          inputContainerStyle={{ ...inputStyles.inputContainer, ...styles.inputContainer }}
          placeholder='Password'
          rightIcon={<TouchableWithoutFeedback onPress={() => setShowPassword(!showPassword)}><Icon name={showPassword ? 'eye-slash' : 'eye'} size={24} color='#a0a0a0' style={{ marginRight: 8 }} /></TouchableWithoutFeedback>}
          keyboardType='default'
          returnKeyType='next'
          errorStyle={styles.error}
          errorProps={{ multiline: true }}
          errorMessage={(formErrors.password || '')}
          value={formValues.password}
          secureTextEntry={!showPassword}
          onChange={(event) => {
            handleChange('password', event.nativeEvent.text.trim())
          }}
          onSubmitEditing={signup}
        />

        <CustomButton title="SIGN UP" icon={receive_wpay} onPressListener={signup} containerStyle={formErrors.password ? { marginTop: 60 } : { marginTop: 30 }} />

      </>
      <View style={styles.commandbar}>
        <TouchableOpacity onPress={() => { navigation.navigate('Login') }}>
          <Text style={{ ...textStyles.mediumText, textAlign: 'center' }}>already have an account?  <Text style={{ fontSize: 17, fontFamily: 'SourceSansPro-SemiBold' }}>Login</Text></Text>
        </TouchableOpacity>
      </View>

      <EmptyGap />
    </BasicScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
  },
  title: {
    ...fontStyles.bold,
    fontSize: 28,
    marginLeft: 20,
    marginBottom: 16,
    alignSelf: 'flex-start'
  },
  logo: {
    width: '100%',
    height: IMAGE_HEIGHT,
    resizeMode: 'contain',
    marginBottom: 20,
    marginTop: 20,
  },
  error: {
    maxWidth: width - 64,
    textAlign: 'left',
    marginBottom: 24,
    color: theme.COLORS.ERROR,
    fontSize: 14
  },
  rowItem: {
    width: width * 0.8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    borderColor: '#000000',
  },
  subInputContainer: {
    flex: 1,
    paddingLeft: 0,
    paddingRight: 0
  },
  subInput: {
    height: 50,
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    paddingLeft: 8,
    marginTop: 4,
  },
  phoneInput: {
    width: width * 0.8,
    height: 50,
    marginTop: 12,
    marginBottom: 12,
    borderColor: '#000',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    paddingLeft: 8
  },
  commandbar: {
    width: '100%',
    marginTop: 30,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
});

export default Signup;