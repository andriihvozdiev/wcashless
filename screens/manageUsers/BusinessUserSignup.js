import React, { useState, useEffect, useRef } from 'react';
import {
  View, Animated, StyleSheet, Image, Dimensions, TouchableWithoutFeedback, StatusBar, ImageBackground, TouchableOpacity
} from 'react-native';
import { Input, Text } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import DropDownPicker from 'react-native-dropdown-picker';
import parsePhoneNumber from 'libphonenumber-js'
import * as RNLocalize from "react-native-localize";
import CountryPicker from 'react-native-country-picker-modal'

import { store } from '../../redux/Store';
import EmptyGap from '../../components/EmptyGap';
import BasicScreen from '../../components/BasicScreen';
import LoadingIndicator from '../../components/LoadingIndicator';
import { businessApiService, zapierService } from '../../service';
import theme from '../../constants/Theme';
import { fontStyles, textStyles } from '../../styles/styles';
import CustomButton from '../../components/CustomButton';
import BlueButton from '../../components/BlueButton';

const dropdown_icon = require('../../assets/images/dropdown.png');

const { width, height } = Dimensions.get('screen');

const IMAGE_HEIGHT_SMALL = 48;
const IMAGE_HEIGHT = 96;

const BusinessUserSignup = ({
  navigation
}) => {

  const scrollViewRef = useRef();

  const firstNameRef = useRef();
  const lastNameRef = useRef();
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
    password: '',
    phone: '',
    country: '',
    address: '',
    role: ''
  };

  const [business, setBusiness] = useState(store.getState().business);

  const [nameRowMarginBottom, setNameRowMaginBottom] = useState(0);

  const [formValues, setFormValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState('US');
  const [callingCode, setCallingCode] = useState('1');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [open, setOpen] = useState(false);
  const [roleItems, setRoleItems] = useState([
    { label: 'Manager', value: 'Manager' },
    { label: 'Staff', value: 'Staff' },
  ]);

  const [completed, setCompleted] = useState(false);
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {

  }, []);

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
    setNameRowMaginBottom(marginBottom);

    if (!values.phone) {
      errors.phone = "Please enter your phone number";
    }

    if (values.role === '') {
      errors.role = "Please select business role";
    }

    if (!values.password) {
      errors.password = "Please enter your password";
    } else if (values.password.length < 8) {
      errors.password = "The password must be at least 8 characters long!"
    }

    setFormErrors(errors);
    if (Object.keys(errors).length === 0) return true;

    return false;
  }

  const createUser = async () => {
    setLoading(true);

    if (validate(formValues)) {
      try {
        const data = {
          firstName: formValues.firstName,
          lastName: formValues.lastName,
          phone: formValues.phone,
          country: formValues.country,
          username: `${formValues.firstName} ${formValues.lastName}`,
          email: formValues.email,
          password: formValues.password,
          address: ' ',
          type: 'Personal',
          business: business?.id,
          position: formValues.role,
          role: formValues.role
        }
        const result = await businessApiService.createBusinessAccount(data);

        if (result.error || result.data === null) {
          console.log(result.error);
        } else {

          const params = JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            businessEmail: data.email,
            phone: data.phone,
            businessName: business?.name
          })

          zapierService.welcomeB2BRegistration(params);

          setCompleted(true);

        }
        setLoading(false);
      } catch (err) {
        console.log(err.message);
        setLoading(false);
      }
    } else {
      setCompleted(false);
      setLoading(false);
    }

    setLoading(false);
  }

  const handleChange = (name, value) => {
    setFormValues({ ...formValues, [name]: value });
  };

  const onCountrySelect = (country) => {
    setCountryCode(country.cca2);

    const code = country.callingCode[0];
    setCallingCode(code);
    handleChange('phone', `+${code}${phoneNumber}`);
  }

  return (
    <BasicScreen
      scrollContainerStyle={styles.scrollView}
      scrollViewRef={scrollViewRef}
    >

      <StatusBar barStyle='dark-content' backgroundColor='transparent' />
      {isLoading && <LoadingIndicator />}
      {completed &&
        <>
          <EmptyGap />
          <Text style={{ ...textStyles.subTitle, marginStart: 20 }}>Please check your email to verify your account.</Text>
          <EmptyGap />
          <CustomButton title="BACK" onPressListener={() => { navigation.goBack() }} />
        </>
      }
      {!completed &&
        <>
          <Text style={styles.subTitle}>Personal information</Text>

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
              value={formValues?.firstName}
              clearButtonMode='while-editing'
              onChange={(event) => {
                handleChange('firstName', event.nativeEvent.text.trim())
              }}
              onSubmitEditing={() => lastNameRef.current.focus()}
            />
          </View>
          {(formErrors.firstName != undefined && formErrors.firstName != '') &&
            <Text style={styles.errorStyle}>{formErrors.firstName}</Text>
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
              value={formValues?.lastName}
              clearButtonMode='while-editing'
              onChange={(event) => {
                handleChange('lastName', event.nativeEvent.text.trim())
              }}
              onSubmitEditing={() => emailRef.current.focus()}
            />
          </View>
          {(formErrors.lastName != undefined && formErrors.lastName != '') && <Text style={styles.errorStyle}>{formErrors.lastName}</Text>}

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
              value={formValues.email}
              clearButtonMode='while-editing'
              onChange={(event) => {
                handleChange('email', event.nativeEvent.text.trim())
              }}
            />
          </View>
          {(formErrors.email != undefined && formErrors.email != '') && <Text style={styles.errorStyle}>{formErrors.email}</Text>}

          <View style={{ flexDirection: 'row', width: '100%', marginTop: 10 }}>
            <View style={{ ...styles.rowItem, width: 120, marginTop: 0 }}>
              <TouchableOpacity style={{ height: 40, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <CountryPicker
                  countryCode={countryCode}
                  withFilter
                  withFlag
                  onSelect={onCountrySelect}
                  containerButtonStyle={{
                    height: 40,
                    justifyContent: 'center',
                    color: 'blue',
                    fontSize: 15
                  }}
                />
                <Image source={dropdown_icon} style={{ width: 12, height: 10 }} />
                <Text style={{ ...styles.rowDescription, marginLeft: 12 }}>+{callingCode}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ ...styles.phoneNumberInput, marginLeft: 8 }}>
              <Input
                ref={phoneRef}
                containerStyle={styles.subInputContainer}
                inputContainerStyle={styles.subInput}
                inputStyle={styles.rowDescription}
                placeholder='(000) 000 0000'
                keyboardType='phone-pad'
                returnKeyType='next'
                textAlign='right'
                errorStyle={{ height: 0 }}
                value={parsePhoneNumber(formValues?.phone)?.formatNational()}
                onChange={(event) => {
                  const number = event.nativeEvent.text.trim();
                  setPhoneNumber(number)
                  handleChange('phone', `+${callingCode}${number}`);
                }}
              />
            </View>
          </View>
          {(formErrors.phone != undefined && formErrors.phone != '') && <Text style={styles.errorStyle}>{formErrors.phone}</Text>}

          <View style={{ ...styles.rowItem, paddingEnd: 0 }}>
            <Text style={styles.rowTitle}>Password</Text>
            <Input
              ref={passwordRef}
              containerStyle={styles.subInputContainer}
              inputContainerStyle={styles.subInput}
              inputStyle={styles.rowDescription}
              placeholder='Password'
              rightIcon={<TouchableWithoutFeedback onPressIn={() => setShowPassword(true)} onPressOut={() => setShowPassword(false)}><Icon name={showPassword ? 'eye' : 'eye-slash'} size={24} color='#a0a0a0' style={{ marginRight: 8, marginLeft: 10 }} /></TouchableWithoutFeedback>}
              keyboardType='default'
              returnKeyType='next'
              textAlign='right'
              errorStyle={{ height: 0 }}
              errorMessage={(formErrors.password || '').toLowerCase()}
              value={formValues.password}
              secureTextEntry={!showPassword}
              onChange={(event) => {
                handleChange('password', event.nativeEvent.text.trim())
              }}
            />
          </View>
          {(formErrors.password != undefined && formErrors.password != '') && <Text style={styles.errorStyle}>{formErrors.password}</Text>}


          <Text style={styles.subTitle}>Business information</Text>

          <View style={{ ...styles.rowItem, zIndex: 0 }}>
            <Text style={styles.rowTitle}>Business name</Text>
            <Text style={styles.rowDescription}>{business?.name}</Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.rowTitle}>Business role</Text>
          </View>
          <DropDownPicker
            placeholder='Business role'
            placeholderStyle={{ color: 'grey' }}
            open={open}
            value={formValues.role}
            items={roleItems}
            setOpen={setOpen}
            onSelectItem={(item) => {
              handleChange('role', item.value)
            }}
            setItems={setRoleItems}
            listMode="SCROLLVIEW"
            scrollViewProps={{ nestedScrollEnabled: true }}
            style={{ width: width * 0.4, backgroundColor: 'transparent', borderWidth: 0 }}
            labelStyle={{ textAlign: 'right', color: theme.COLORS.BLUE }}
            containerStyle={{ width: width * 0.4, alignSelf: 'flex-end', marginTop: -45 }}
          />
          {(formErrors.role != undefined && formErrors.role != '') &&
            <Text style={styles.errorStyle}>{formErrors.role}</Text>
          }

          <EmptyGap />
          <BlueButton
            title="Submit"
            style={{ marginTop: 30 }}
            onPressListener={createUser} />

        </>
      }
    </BasicScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
  },
  subTitle: {
    ...fontStyles.semibold,
    alignSelf: 'flex-start',
    marginStart: 12,
    marginTop: 24,
    fontSize: 16,
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
  phoneNumberInput: {
    height: 40,
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: theme.COLORS.BORDER_COLOR,
    borderRadius: 8,
    paddingHorizontal: 12
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
});

export default BusinessUserSignup;