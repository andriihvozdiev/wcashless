import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, Alert, Dimensions, ImageBackground, StatusBar, TouchableOpacity, Image
} from 'react-native';
import { Input, Text } from 'react-native-elements';
import DropDownPicker from 'react-native-dropdown-picker';
import CountryPicker from 'react-native-country-picker-modal'
import * as RNLocalize from "react-native-localize";
import RNCountry from "react-native-countries";
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js'

import EmptyGap from '../../components/EmptyGap';
import BasicScreen from '../../components/BasicScreen';
import ImagePickerDialog from '../../components/ImagePickerDialog';
import LoadingIndicator from '../../components/LoadingIndicator';
import theme from '../../constants/Theme';
import { commonStyles, fontStyles, textStyles } from '../../styles/styles';
import BlueButton from '../../components/BlueButton';
import { store } from '../../redux/Store';
import { businessApiService } from '../../service';
import { logoutUser } from '../../redux/actions/UserActions';

const { width, height } = Dimensions.get('screen');

const logo_bg = require('../../assets/logo/event_logo.png');
const camera_w = require('../../assets/images/camera_w.png');
const dropdown_icon = require('../../assets/images/dropdown.png');

const EditEvent = ({
  navigation, route
}) => {

  const scrollViewRef = useRef();

  const eventNameRef = useRef();

  const [isAdmin, setAdmin] = useState(store.getState().user?.role?.type == 'superadmin');

  const [event, setEvent] = useState(route.params?.event);
  const [photoUrl, setPhotoUrl] = useState(route.params?.event?.photo?.url);
  const [newAsset, setNewAsset] = useState();

  const [imagePicker, setImagePicker] = useState(false);

  const [eventType, setEventType] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventEmail, setEventEmail] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [countryName, setCountryName] = useState('');
  const [isCountryPicker, showCountryPicker] = useState(false);

  const [countryCode, setCountryCode] = useState(isValidPhoneNumber(event?.phone ? event.phone : '') ? parsePhoneNumber(event?.phone)?.country : 'US');
  const [callingCode, setCallingCode] = useState(isValidPhoneNumber(event?.phone ? event.phone : '') ? parsePhoneNumber(event?.phone)?.countryCallingCode : '1');
  const [phoneNumber, setPhoneNumber] = useState(isValidPhoneNumber(event?.phone ? event.phone : '') ? parsePhoneNumber(event?.phone)?.nationalNumber : '');

  const [errorEventType, setErrorEventType] = useState();
  const [errorEventName, setErrorEventName] = useState();
  const [errorAddress, setErrorAddress] = useState();
  const [errorLocation, setErrorLocation] = useState();
  const [errorCountry, setErrorCountry] = useState();
  const [errorPostalCode, setErrorPostalCode] = useState();
  const [errorPhoneNumber, setErrorPhoneNumber] = useState();

  const [open, setOpen] = useState(false);
  const [eventTypeItems, setEventTypeItems] = useState([
    { label: 'Electronic music', value: 'event_e_music' },
    { label: 'Live music', value: 'event_live_music' },
    { label: 'Festival', value: 'event_fstival' },
    { label: 'Daytime', value: 'event_day_time' },
    { label: 'Night time', value: 'event_night_time' },
    { label: 'Multi Day event', value: 'event_multi_day_event' },
    { label: 'Beach Club', value: 'event_beach_club' },
    { label: 'Bar/Venue', value: 'event_bar_venue' },
    { label: 'Specialist Event Space', value: 'event_special' },
    { label: 'Night Club', value: 'event_night_club' },
    { label: 'Private Location', value: 'event_private_location' },
    { label: 'Exhibition', value: 'event_exhibition' },
    { label: 'Seminar', value: 'event_seminar' },
    { label: 'Conference', value: 'event_conference' },
    { label: 'Trade Show', value: 'event_trade_show' },
    { label: 'Wellness', value: 'event_wellness' },
    { label: 'Sports', value: 'event_sports' },
  ]);

  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setErrorEventType('');
    setErrorEventName('');
    setErrorAddress('');
    setErrorLocation('');
    setErrorCountry('');
    setErrorPostalCode('');
    setErrorPhoneNumber('');

    setEventType(event?.subtype);
    setEventEmail(event?.email);
    setEventName(event?.name);
    setEventDescription(event?.description);
    setAddress(event?.address);
    setLocation(event?.location);
    setCountry(event?.country);
    setPostalCode(event?.postalCode);

    const countryNamesWithCodes = RNCountry.getCountryNamesWithCodes;
    const countryCode = event?.country ? event.country : RNLocalize.getCountry();
    const country = countryNamesWithCodes.find(element => (element.code == countryCode));
    setCountryName(country?.name);

  }, []);

  const onCountrySelect = (country) => {
    showCountryPicker(false);
    setCountry(country.cca2);
    setCountryName(country?.name);
  }

  const updateEvent = async () => {
    
    if (!eventType) {
      scrollViewRef.current.scrollTo({ y: height * 0.2, animated: true })
      return setErrorEventType(`Event Type required`);
    } else {
      setErrorEventType();
    }

    if (!eventName) {
      scrollViewRef.current.scrollTo({ y: height * 0.4, animated: true });
      eventNameRef.current.focus();
      return setErrorEventName(`Event Name required`);
    } else {
      setErrorEventName();
    }
    
    if (!isValidPhoneNumber(`+${callingCode} ${phoneNumber}`)) {
      return setErrorPhoneNumber('Invalid phone number');
    } else {
      setErrorPhoneNumber();
    }

    var photo = null;

    if (newAsset != null) {
      // upload image
      const file = {
        uri: newAsset.uri,
        name: newAsset.fileName,
        type: newAsset.type
      }
      setLoading(true);
      const result = await businessApiService.uploadFile(file);
      setLoading(false);
      if (!result.error && result.data != null) {
        photo = result.data;
      }
    }

    const params = {
      name: eventName,
      email: eventEmail,
      subtype: eventType,
      description: eventDescription,
      address: address,
      location: location,
      country: country,
      postalCode: postalCode,
      photo: photo?.id,
      phone: `+${callingCode} ${phoneNumber}`
    }

    try {
      setLoading(true);
      const result = await businessApiService.updateBusinessSite(event?.id, params);
      setLoading(false);
      if (!result.error) {
        showNormalAlert('Success', 'Event updated successfully.');
      } else {
        if (result.data?.error?.status == 401) {
          showNormalAlert('Invalid User', 'You account session has been expired. Please login again', () => {
            logoutUser();
            navigation.replace('Login');
          });
        } else {
          showNormalAlert('Udate failed', result.data?.error?.message);
        }
      }

    } catch (error) {
      setLoading(false);
    }
  }

  const showNormalAlert = (title, message, okClicked) => {
    Alert.alert(
      title,
      message,
      [
        { text: "ok", onPress: () => { okClicked ? okClicked() : null } }
      ],
      { cancelable: true }
    );
  }

  const selectImageAsset = async (asset) => {
    setNewAsset(asset);
    setPhotoUrl(asset.uri);
  }

  const onCallingCodeSelect = (country) => {
    setCountryCode(country.cca2);
    const code = country.callingCode[0];
    setCallingCode(code);
  }

  const buildHeader = () => {
    return (
      <>
        <View style={{ width: '95%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'column', marginTop: 24 }}>
            <Text style={{ ...commonStyles.headerTitle, alignSelf: 'flex-start', marginStart: 12 }}>
              Edit event
            </Text>
            <Text style={{ ...fontStyles.semibold, fontSize: 15, alignSelf: 'flex-start', marginStart: 12, color: theme.COLORS.BLUE }}>
              {eventEmail}
            </Text>
          </View>

          <ImageBackground source={photoUrl ? { uri: photoUrl } : logo_bg} style={styles.avatarContainer} imageStyle={styles.avatar}>
            <TouchableOpacity style={styles.cameraButtonContainer} onPress={() => { setImagePicker(true) }}>
              <Image source={camera_w} style={styles.cameraIcon}></Image>
            </TouchableOpacity>
          </ImageBackground>
        </View>
      </>
    )
  }

  return (
    <>
      <BasicScreen
        scrollViewRef={scrollViewRef}
        style={{ paddingTop: 50 }}
        header={buildHeader()}
      >

        <StatusBar barStyle='dark-content' backgroundColor='transparent' />
        {isLoading && <LoadingIndicator />}

        <Text style={{ ...textStyles.subTitle, marginTop: 20 }}>Event information</Text>

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Event name</Text>
          <Input
            ref={eventNameRef}
            containerStyle={{ ...styles.subInputContainer }}
            inputContainerStyle={styles.subInput}
            inputStyle={styles.rowDescription}
            keyboardType='default'
            placeholder='Event name'
            returnKeyType='done'
            textAlign='right'
            errorStyle={{ height: 0 }}
            value={eventName}
            onChange={(event) => {
              setEventName(event.nativeEvent.text)
            }}
          />
        </View>
        {(errorEventName != undefined && errorEventName != '') &&
          <Text style={styles.errorStyle}>{errorEventName}</Text>
        }

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Event type</Text>
        </View>
        <DropDownPicker
          placeholder='Event type'
          placeholderStyle={{ color: 'grey', textAlign: 'right' }}
          open={open}
          value={eventType}
          items={eventTypeItems}
          setOpen={setOpen}
          setValue={setEventType}
          setItems={setEventTypeItems}
          listMode="SCROLLVIEW"
          scrollViewProps={{ nestedScrollEnabled: true }}
          style={{ width: width * 0.7, backgroundColor: 'transparent', borderWidth: 0 }}
          labelStyle={{ textAlign: 'right', color: theme.COLORS.BLUE }}
          containerStyle={{ width: width * 0.7, alignSelf: 'flex-end', marginTop: -45 }}
        />
        {(errorEventType != undefined && errorEventType != '') &&
          <Text style={styles.errorStyle}>{errorEventType}</Text>
        }

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Event email</Text>
          <Input
            containerStyle={{ ...styles.subInputContainer }}
            inputContainerStyle={styles.subInput}
            inputStyle={styles.rowDescription}
            keyboardType='email-address'
            placeholder='event@email.com'
            returnKeyType='next'
            textAlign='right'
            errorStyle={{ height: 0 }}
            value={eventEmail}
            onChange={(event) => {
              setEventEmail(event.nativeEvent.text.trim())
            }}
          />
        </View>

        <View style={styles.colItem}>
          <Text style={{ ...styles.rowTitle, marginStart: 12 }}>Event description</Text>
          <Input
            containerStyle={{ flex: 1, padding: 0 }}
            inputContainerStyle={{ borderBottomColor: 'transparent' }}
            inputStyle={{ ...styles.rowDescription, textAlignVertical: 'top' }}
            placeholder='Event description'
            keyboardType='default'
            returnKeyType='done'
            multiline={true}
            numberOfLines={3}
            value={eventDescription}
            onChange={(event) => {
              setEventDescription(event.nativeEvent.text)
            }}
            errorStyle={{ height: 0 }}
          />
        </View>

        <Text style={{ ...textStyles.subTitle, marginTop: 20 }}>Address details</Text>

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Street</Text>
          <Input
            containerStyle={{ ...styles.subInputContainer }}
            inputContainerStyle={styles.subInput}
            inputStyle={styles.rowDescription}
            keyboardType='default'
            placeholder='Street address'
            returnKeyType='done'
            textAlign='right'
            errorStyle={{ height: 0 }}
            value={address}
            onChange={(event) => {
              setAddress(event.nativeEvent.text)
            }}
          />
        </View>
        {(errorAddress != undefined && errorAddress != '') &&
          <Text style={styles.errorStyle}>{errorAddress}</Text>
        }

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>City/Location</Text>
          <Input
            containerStyle={{ ...styles.subInputContainer }}
            inputContainerStyle={styles.subInput}
            inputStyle={styles.rowDescription}
            keyboardType='default'
            placeholder='City'
            returnKeyType='done'
            textAlign='right'
            errorStyle={{ height: 0 }}
            value={location}
            onChange={(event) => {
              setLocation(event.nativeEvent.text)
            }}
          />
        </View>
        {(errorLocation != undefined && errorLocation != '') && <Text style={styles.errorStyle}>{errorLocation}</Text>}

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Country</Text>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => { showCountryPicker(true) }}>
            <CountryPicker
              countryCode={country ? country : RNLocalize.getCountry()}
              withFilter
              withFlag
              onSelect={onCountrySelect}
              containerButtonStyle={{
                height: 40,
                justifyContent: 'center',
                color: 'blue',
                fontSize: 15
              }}
              visible={isCountryPicker}
            />
            <Text style={styles.rowDescription}>{countryName}</Text>
            <Image source={dropdown_icon} style={{ width: 12, height: 10, marginLeft: 10 }} />
          </TouchableOpacity>

        </View>
        {(errorCountry != undefined && errorCountry != '') && <Text style={styles.errorStyle}>{errorCountry}</Text>}

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Postal code / Zip code</Text>
          <Input
            containerStyle={{ ...styles.subInputContainer }}
            inputContainerStyle={styles.subInput}
            inputStyle={styles.rowDescription}
            keyboardType='default'
            placeholder='Code'
            returnKeyType='done'
            textAlign='right'
            errorStyle={{ height: 0 }}
            value={postalCode}
            onChange={(event) => {
              setPostalCode(event.nativeEvent.text)
            }}
          />
        </View>
        {(errorPostalCode != undefined && errorPostalCode != '') && <Text style={styles.errorStyle}>{errorPostalCode}</Text>}

        <View style={{ flexDirection: 'row', width: '100%', marginTop: 10 }}>
          <View style={{ ...styles.rowItem, width: 120, marginTop: 0 }}>
            <TouchableOpacity style={{ height: 40, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
              <CountryPicker
                countryCode={countryCode}
                withFilter
                withFlag
                onSelect={onCallingCodeSelect}
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

          <View style={{ ...styles.rowItem, marginLeft: 8, flex: 1, marginTop: 0 }}>
            <Input
              containerStyle={styles.subInputContainer}
              inputContainerStyle={styles.subInput}
              inputStyle={styles.rowDescription}
              placeholder='(000) 000 0000'
              keyboardType='phone-pad'
              returnKeyType='next'
              textAlign='right'
              errorStyle={{ height: 0 }}
              value={phoneNumber}
              onChange={(event) => {
                const number = event.nativeEvent.text.trim();
                setPhoneNumber(number)
              }}
            />
          </View>
        </View>
        {(errorPhoneNumber != undefined && errorPhoneNumber != '') && <Text style={styles.errorStyle}>{errorPhoneNumber}</Text>}

        <EmptyGap />

        <BlueButton
          title="Submit"
          style={{ marginTop: 20 }}
          onPressListener={updateEvent}
        />

      </BasicScreen>

      {imagePicker &&
        <ImagePickerDialog
          closeDialog={() => setImagePicker(false)}
          onImageAsset={(asset) => { selectImageAsset(asset) }}
        />
      }
    </>

  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    width: 90,
    height: 90,
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  avatar: {
    borderRadius: 50,
    borderColor: 'grey',
    borderWidth: 1,
  },
  cameraButtonContainer: {
    width: 25,
    height: 25,
    borderRadius: 15,
    backgroundColor: theme.COLORS.BLUE,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cameraIcon: {
    width: 12,
    height: 12,
  },
  colItem: {
    width: '100%',
    minHeight: 100,
    flexDirection: 'column',
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: theme.COLORS.BORDER_COLOR,
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 10
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
    color: theme.COLORS.ERROR
  }
});

export default EditEvent;