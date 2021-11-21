import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  Alert,
  Dimensions,
  ImageBackground,
  StatusBar,
  Image,
  TouchableOpacity
} from 'react-native';
import { Input, withTheme, Text } from 'react-native-elements';
import DropDownPicker from 'react-native-dropdown-picker';
import CountryPicker from 'react-native-country-picker-modal';
import * as RNLocalize from "react-native-localize";
import RNCountry from "react-native-countries";
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js'

import { businessApiService } from '../../service';
import { store } from '../../redux/Store';
import EmptyGap from '../../components/EmptyGap';
import BasicScreen from '../../components/BasicScreen';
import LoadingIndicator from '../../components/LoadingIndicator';
import theme from '../../constants/Theme';
import { commonStyles, fontStyles, textStyles } from '../../styles/styles';
import { logoutUser } from '../../redux/actions/UserActions';
import ImagePickerDialog from '../../components/ImagePickerDialog';
import BlueButton from '../../components/BlueButton';

const { width, height } = Dimensions.get('screen');

const IMAGE_HEIGHT_SMALL = 48;
const IMAGE_HEIGHT = 96;

const header_logo = require('../../assets/logo/logo_bg.png');
const camera_w = require('../../assets/images/camera_w.png');
const dropdown_icon = require('../../assets/images/dropdown.png');

const category_bar = require('../../assets/category/category_bar.png');
const category_excursions = require('../../assets/category/category_excursions.png');
const category_shopping = require('../../assets/category/category_shopping.png');
const category_groceries = require('../../assets/category/category_groceries.png');
const category_entertainment = require('../../assets/category/category_entertainment.png');
const category_general = require('../../assets/category/category_general.png');
const category_services = require('../../assets/category/category_services.png');
const category_events_festivals = require('../../assets/category/category_events_festivals.png');
const category_transportation = require('../../assets/category/category_transportation.png');
const category_stays = require('../../assets/category/category_stays.png');
const category_health = require('../../assets/category/category_health.png');
const category_live = require('../../assets/category/category_live.png');
const category_arts = require('../../assets/category/category_arts.png');

const EditVenue = ({
  navigation, route
}) => {

  const scrollViewRef = useRef();

  const venueNameRef = useRef();

  const [isAdmin, setAdmin] = useState(store.getState().user?.role?.type == 'superadmin');

  const [venue, setVenue] = useState(route.params?.venue);
  const [photoUrl, setPhotoUrl] = useState(route.params?.venue?.photo?.url);
  const [newAsset, setNewAsset] = useState();

  const [venueName, setVenueName] = useState('');
  const [venueType, setVenueType] = useState('');
  const [venueCategory, setVenueCategory] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState(route.params?.venue?.country);
  const [postalCode, setPostalCode] = useState('');
  const [venueDescription, setVenueDescription] = useState('');

  const [countryCode, setCountryCode] = useState(isValidPhoneNumber(venue?.phone ? venue.phone : '') ? parsePhoneNumber(venue?.phone)?.country : 'US');
  const [callingCode, setCallingCode] = useState(isValidPhoneNumber(venue?.phone ? venue.phone : '') ? parsePhoneNumber(venue?.phone)?.countryCallingCode : '1');
  const [phoneNumber, setPhoneNumber] = useState(isValidPhoneNumber(venue?.phone ? venue.phone : '') ? parsePhoneNumber(venue?.phone)?.nationalNumber : '');
  const [venueEmail, setVenueEmail] = useState('');

  const [isCountryPicker, showCountryPicker] = useState(false);
  const [countryName, setCountryName] = useState('');

  const [errorVenueName, setErrorVenueName] = useState();
  const [errorVenueType, setErrorVenueType] = useState();
  const [errorVenueCategory, setErrorVenueCategory] = useState();
  const [errorAddress, setErrorAddress] = useState();
  const [errorLocation, setErrorLocation] = useState();
  const [errorCountry, setErrorCountry] = useState();
  const [errorPostalCode, setErrorPostalCode] = useState();
  const [errorPhoneNumber, setErrorPhoneNumber] = useState();

  const [open, setOpen] = useState(false);
  const [venueTypeItems, setVenueTypeItems] = useState([
    { label: 'Bar, Restaurant, Food & Beverage', value: 'venu_bar' },
    { label: 'Events, Venue, Festival', value: 'venu_festival' },
    { label: 'Hotel, Hostel, Resort & Residency, Retreats', value: 'venu_multiple' },
    { label: 'Professional Sevices', value: 'venu_services' },
    { label: 'Retail & Shopping', value: 'venu_shopping' },
    { label: 'Health & Wellbeing', value: 'venu_health' },
    { label: 'Travel & Transportation', value: 'venu_travel' },
    { label: 'Event Space, Exhibition', value: 'venu_exhibition' },
    { label: 'Co-working', value: 'venu_co_working' },
    { label: 'Historic, Local Culture', value: 'venu_histoic' },
    { label: 'Tours & Experiences', value: 'venu_tours' },
    { label: 'Art & Galleries', value: 'venu_art' },
    { label: 'Sports & Arena', value: 'venu_sports' },
  ]);

  const [openCategory, setOpenCategory] = useState(false);
  const [venueCategoryItems, setVenueCategoryItems] = useState([
    { label: 'Bar & Restaurant', value: 'category_bar', icon: () => <Image source={category_bar} style={styles.categoryIcon} /> },
    { label: 'Excursions & Tour', value: 'category_excursions', icon: () => <Image source={category_excursions} style={styles.categoryIcon} /> },
    { label: 'Shopping', value: 'category_shopping', icon: () => <Image source={category_shopping} style={styles.categoryIcon} /> },
    { label: 'Groceries', value: 'category_groceries', icon: () => <Image source={category_groceries} style={styles.categoryIcon} /> },
    { label: 'Entertainment', value: 'category_entertainment', icon: () => <Image source={category_entertainment} style={styles.categoryIcon} /> },
    { label: 'General', value: 'category_general', icon: () => <Image source={category_general} style={styles.categoryIcon} /> },
    { label: 'Services', value: 'category_services', icon: () => <Image source={category_services} style={styles.categoryIcon} /> },
    { label: 'Events & Festivals', value: 'category_events_festivals', icon: () => <Image source={category_events_festivals} style={styles.categoryIcon} /> },
    { label: 'Transportation', value: 'category_transportation', icon: () => <Image source={category_transportation} style={styles.categoryIcon} /> },
    { label: 'Stays', value: 'category_stays', icon: () => <Image source={category_stays} style={styles.categoryIcon} /> },
    { label: 'Health & Wellbeing', value: 'category_health', icon: () => <Image source={category_health} style={styles.categoryIcon} /> },
    { label: 'Live & Concerts', value: 'category_live', icon: () => <Image source={category_live} style={styles.categoryIcon} /> },
    { label: 'Arts & Exhibitions', value: 'category_arts', icon: () => <Image source={category_arts} style={styles.categoryIcon} /> },
  ]);

  const [imagePicker, setImagePicker] = useState(false);

  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setErrorVenueType('');
    setErrorVenueCategory('');
    setErrorAddress('');
    setErrorLocation('');
    setErrorCountry('');
    setErrorPostalCode('');
    setErrorPhoneNumber('');

    setVenueType(venue?.subtype);
    setVenueCategory(venue?.category);
    setVenueName(venue?.name);
    setAddress(venue?.address);
    setLocation(venue?.location);
    setCountry(venue?.country);
    setPostalCode(venue?.postalCode);
    setVenueDescription(venue?.description);

    setVenueEmail(venue?.email);

    const countryNamesWithCodes = RNCountry.getCountryNamesWithCodes;
    const countryCode = venue?.country ? venue.country : RNLocalize.getCountry();
    const venueCountry = countryNamesWithCodes.find(element => (element.code == countryCode));
    setCountryName(venueCountry?.name);

  }, []);


  const updateVenue = async () => {

    if (!venueName) {
      scrollViewRef.current.scrollTo({ y: height * 0.2, animated: true });
      venueNameRef.current.focus();
      return setErrorVenueName(`Event Name required`);
    } else {
      setErrorVenueName();
    }

    if (!venueType) {
      scrollViewRef.current.scrollTo({ y: height * 0.4, animated: true })
      return setErrorVenueType(`Venue Type required`);
    } else {
      setErrorVenueType();
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
      name: venueName,
      subtype: venueType,
      category: venueCategory,
      description: venueDescription,
      address: address,
      location: location,
      country: country,
      postalCode: postalCode,
      photo: photo?.id,
      email: venueEmail,
      phone: `+${callingCode}${phoneNumber}`,
    }

    console.log(params);

    try {

      setLoading(true);
      const result = await businessApiService.updateBusinessSite(venue?.id, params);
      setLoading(false);

      if (!result.error) {
        showNormalAlert('Success', 'Venue updated successfully', () => { navigation.goBack() });
      } else {
        if (result.data?.error?.status == 401) {
          showNormalAlert('Invalid User', 'You account session has been expired. Please login again', () => {
            logoutUser();
            navigation.replace('Login');
          });
        } else {
          showNormalAlert('Update failed', result.data?.error?.message);
        }
      }

    } catch (error) {
      setLoading(false);
      console.log(error);
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

  const onCountrySelect = (country) => {
    showCountryPicker(false);
    setCountry(country.cca2);
    setCountryName(country?.name);
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
              Edit venue
            </Text>
            <Text style={{ ...fontStyles.semibold, fontSize: 15, alignSelf: 'flex-start', marginStart: 12, color: theme.COLORS.BLUE }}>
              {venue?.email}
            </Text>
          </View>

          <ImageBackground source={photoUrl ? { uri: photoUrl } : header_logo} style={styles.avatarContainer} imageStyle={styles.avatar}>
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

        <Text style={{ ...textStyles.subTitle, marginTop: 20 }}>Venue information</Text>

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Venue name</Text>
          <Input
            ref={venueNameRef}
            containerStyle={{ ...styles.subInputContainer }}
            inputContainerStyle={styles.subInput}
            inputStyle={styles.rowDescription}
            keyboardType='default'
            placeholder='Venue name'
            returnKeyType='done'
            textAlign='right'
            errorStyle={{ height: 0 }}
            value={venueName}
            onChange={(event) => {
              setVenueName(event.nativeEvent.text)
            }}
          />
        </View>
        {(errorVenueName != undefined && errorVenueName != '') &&
          <Text style={styles.errorStyle}>{errorVenueName}</Text>
        }

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Venue type</Text>
        </View>
        <DropDownPicker
          placeholder='Venue type'
          placeholderStyle={{ color: 'grey', textAlign: 'right' }}
          open={open}
          value={venueType}
          items={venueTypeItems}
          setOpen={setOpen}
          setValue={setVenueType}
          setItems={setVenueTypeItems}
          listMode="SCROLLVIEW"
          scrollViewProps={{ nestedScrollEnabled: true }}
          style={{ width: width * 0.7, backgroundColor: 'transparent', borderWidth: 0 }}
          labelStyle={{ textAlign: 'right', color: theme.COLORS.BLUE }}
          containerStyle={{ width: width * 0.7, alignSelf: 'flex-end', marginTop: -45 }}
        />
        {(errorVenueType != undefined && errorVenueType != '') &&
          <Text style={styles.errorStyle}>{errorVenueType}</Text>
        }

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Venue category</Text>
        </View>
        <DropDownPicker
          placeholder='Category'
          placeholderStyle={{ color: 'grey', textAlign: 'right' }}
          open={openCategory}
          value={venueCategory}
          items={venueCategoryItems}
          setOpen={setOpenCategory}
          setValue={setVenueCategory}
          setItems={setVenueCategoryItems}
          listMode="MODAL"
          scrollViewProps={{ nestedScrollEnabled: true }}
          style={{ width: 200, alignSelf: 'flex-end', backgroundColor: 'transparent', borderWidth: 0 }}
          labelStyle={{ textAlign: 'right', color: theme.COLORS.BLUE }}
          containerStyle={{ width: 200, alignSelf: 'flex-end', marginTop: -45 }}
        />

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Venue offers</Text>
          <TouchableOpacity onPress={() => { navigation.navigate('VenueOffers', { venue }) }}>
            <Text style={styles.rowDescription}>Manage offers</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.colItem}>
          <Text style={{ ...styles.rowTitle, marginStart: 12 }}>Venue description</Text>
          <Input
            containerStyle={{ flex: 1, padding: 0 }}
            inputContainerStyle={{ borderBottomColor: 'transparent' }}
            inputStyle={{ ...styles.rowDescription, textAlignVertical: 'top' }}
            placeholder='Venue description'
            keyboardType='default'
            returnKeyType='done'
            multiline={true}
            numberOfLines={3}
            value={venueDescription}
            onChange={(event) => {
              setVenueDescription(event.nativeEvent.text)
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
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => { showCountryPicker(true); }}>
            <Text style={{ ...styles.rowDescription, marginRight: 12 }}>{countryName}</Text>
            <CountryPicker
              countryCode={country ? country : RNLocalize.getCountry()}
              withFilter
              withFlagButton={false}
              onSelect={onCountrySelect}
              containerButtonStyle={{
                height: 40,
                justifyContent: 'center',
                color: 'blue',
                fontSize: 15,
              }}
              visible={isCountryPicker}
            />
            <Image source={dropdown_icon} style={{ width: 12, height: 10 }} />
          </TouchableOpacity>
        </View>

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
        {(errorPhoneNumber != undefined && errorPhoneNumber != '') &&
          <Text style={styles.errorStyle}>{errorPhoneNumber}</Text>
        }

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Venue email</Text>
          <Input
            containerStyle={styles.subInputContainer}
            inputContainerStyle={styles.subInput}
            inputStyle={styles.rowDescription}
            keyboardType='email-address'
            returnKeyType='next'
            textAlign='right'
            placeholder='venue@email.com'
            errorStyle={{ height: 0 }}
            value={venueEmail}
            clearButtonMode='while-editing'
            onChange={(event) => {
              setVenueEmail(event.nativeEvent.text.trim())
            }}
          />
        </View>

        <EmptyGap />

        <BlueButton
          title="Update"
          style={{ marginTop: 20 }}
          onPressListener={updateVenue}
        />
      </BasicScreen>

      {
        imagePicker &&
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
  categoryIcon: {
    width: 15,
    height: 15,
    resizeMode: 'contain'
  },
  errorStyle: {
    alignSelf: 'flex-end',
    color: theme.COLORS.ERROR
  }
});

export default EditVenue;