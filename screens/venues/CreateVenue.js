import React, { useState, useEffect, useRef } from 'react';
import {
  View, Animated, StyleSheet, TouchableOpacity, Dimensions, Image, ImageBackground, StatusBar
} from 'react-native';
import { Input, Text } from 'react-native-elements';
import DropDownPicker from 'react-native-dropdown-picker';
import { store } from '../../redux/Store';
import CountryPicker from 'react-native-country-picker-modal'
import * as RNLocalize from "react-native-localize";
import RNCountry from "react-native-countries";

import BasicScreen from '../../components/BasicScreen';
import LoadingIndicator from '../../components/LoadingIndicator';
import theme from '../../constants/Theme';
import { commonStyles, fontStyles, textStyles } from '../../styles/styles';
import { businessApiService } from '../../service';
import ImagePickerDialog from '../../components/ImagePickerDialog';
import BlueButton from '../../components/BlueButton';
import EmptyGap from '../../components/EmptyGap';

const logo_bg = require('../../assets/logo/logo_bg.png');
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

const { width, height } = Dimensions.get('screen');

const IMAGE_HEIGHT_SMALL = 48;
const IMAGE_HEIGHT = 96;

const CreateVenue = ({
  navigation
}) => {

  const scrollViewRef = useRef();

  const businessNameRef = useRef();
  const venueNameRef = useRef();
  const venueDescriptionRef = useRef();

  const imageHeight = useRef(new Animated.Value(IMAGE_HEIGHT)).current;
  const imagePadding = useRef(new Animated.Value(IMAGE_HEIGHT_SMALL)).current;

  const [business, setBusiness] = useState(store.getState().business);
  const [venueName, setVenueName] = useState('');
  const [venueType, setVenueType] = useState('');
  const [venueCategory, setVenueCategory] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState();
  const [postalCode, setPostalCode] = useState('');
  const [venueDescription, setVenueDescription] = useState('');

  const [countryName, setCountryName] = useState('');
	const [isCountryPicker, showCountryPicker] = useState(false);

  const [errorBusinessName, setErrorBusinessName] = useState();
  const [errorVenueName, setErrorVenueName] = useState();
  const [errorVenueType, setErrorVenueType] = useState();
  const [errorLocation, setErrorLocation] = useState();

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

  const [imagePicker, setImagePicker] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [newAsset, setNewAsset] = useState();

  const [isLoading, setLoading] = useState(false);

  const [openCategory, setOpenCategory] = useState(false);
  const [venueCategoryItems, setVenueCategoryItems] = useState([
    { label: 'Bar & Restaurant', value: 'category_bar', icon: () => <Image source={category_bar} style={styles.categoryIcon}/> },
		{ label: 'Excursions & Tour', value: 'category_excursions', icon: () => <Image source={category_excursions} style={styles.categoryIcon}/> },
		{ label: 'Shopping', value: 'category_shopping', icon: () => <Image source={category_shopping} style={styles.categoryIcon}/> },
		{ label: 'Groceries', value: 'category_groceries', icon: () => <Image source={category_groceries} style={styles.categoryIcon}/> },
		{ label: 'Entertainment', value: 'category_entertainment', icon: () => <Image source={category_entertainment} style={styles.categoryIcon}/> },
		{ label: 'General', value: 'category_general', icon: () => <Image source={category_general} style={styles.categoryIcon}/> },
		{ label: 'Services', value: 'category_services', icon: () => <Image source={category_services} style={styles.categoryIcon}/> },
		{ label: 'Events & Festivals', value: 'category_events_festivals', icon: () => <Image source={category_events_festivals} style={styles.categoryIcon}/> },
		{ label: 'Transportation', value: 'category_transportation', icon: () => <Image source={category_transportation} style={styles.categoryIcon}/> },
		{ label: 'Stays', value: 'category_stays', icon: () => <Image source={category_stays} style={styles.categoryIcon}/> },
		{ label: 'Health & Wellbeing', value: 'category_health', icon: () => <Image source={category_health} style={styles.categoryIcon}/> },
		{ label: 'Live & Concerts', value: 'category_live', icon: () => <Image source={category_live} style={styles.categoryIcon}/> },
		{ label: 'Arts & Exhibitions', value: 'category_arts', icon: () => <Image source={category_arts} style={styles.categoryIcon}/> },
  ]);

  useEffect(() => {
    setErrorBusinessName('');
    setErrorVenueName('');
    setErrorVenueType('');
    setPhotoUrl('');
    setNewAsset();

    const countryNamesWithCodes = RNCountry.getCountryNamesWithCodes;
		const countryCode = RNLocalize.getCountry();
		const country = countryNamesWithCodes.find(element => (element.code == countryCode));
    setCountryName(country?.name);
  }, []);

  const selectImageAsset = async (asset) => {
    setNewAsset(asset);
    setPhotoUrl(asset.uri);
  }

  const createVenue = async () => {
    if (!business.name) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true })
      businessNameRef.current.focus();
      return setErrorBusinessName(`Business Name required`);
    } else {
      setErrorBusinessName();
    }

    if (!venueName.trim()) {
      scrollViewRef.current.scrollTo({ y: height * 0.2, animated: true });
      venueNameRef.current.focus();
      return setErrorVenueName(`Venue name required`);
    } else {
      setErrorVenueName();
    }

    if (!venueType.trim()) {
      scrollViewRef.current.scrollTo({ y: height * 0.4, animated: true })
      return setErrorVenueType(`Business Type required`);
    } else {
      setErrorVenueType();
    }

    if (!location.trim()) {
      scrollViewRef.current.scrollTo({ y: height * 0.6, animated: true })
      return setErrorLocation(`Location is required`);
    } else {
      setErrorLocation();
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
      business: business?.id,
      name: venueName,
      type: 'Venue',
      subtype: venueType,
      description: venueDescription,
      address: address,
      location: location,
      country: country,
      postalCode: postalCode,
      photo: photo?.id
    }

    try {
      setLoading(true);
      const result = await businessApiService.createBusinessSite(params);
      setLoading(false);
      if (!result.error) {
        navigation.goBack();
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

  const onCountrySelect = (country) => {
    showCountryPicker(false);
    setCountry(country.cca2);
    setCountryName(country?.name);
  }

  const buildHeader = () => {
    return (
      <>
        <View style={{ width: '95%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'column', marginTop: 24 }}>
            <Text style={{ ...commonStyles.headerTitle, alignSelf: 'flex-start', marginStart: 12 }}>
              Add venue
            </Text>
            <Text style={{ ...fontStyles.semibold, fontSize: 15, alignSelf: 'flex-start', marginStart: 12, color: theme.COLORS.BLUE }}>
              {business?.name}
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

        <Text style={{ ...textStyles.subTitle, marginTop: 20, marginLeft: 10 }}>Venue information</Text>

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
          listMode="SCROLLVIEW"
          scrollViewProps={{ nestedScrollEnabled: true }}
          style={{ width: 180, alignSelf: 'flex-end', backgroundColor: 'transparent', borderWidth: 0 }}
          labelStyle={{ textAlign: 'right', color: theme.COLORS.BLUE }}
          containerStyle={{ width: 200, alignSelf: 'flex-end', marginTop: -45, zIndex: 1 }}
        />

        <View style={styles.colItem}>
          <Text style={{ ...styles.rowTitle, marginStart: 12 }}>Venue description</Text>
          <Input
            ref={venueDescriptionRef}
            containerStyle={{ flex: 1, padding: 0 }}
            inputContainerStyle={{ borderBottomColor: 'transparent' }}
            inputStyle={{...styles.rowDescription, textAlignVertical: 'top'}}
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

        <Text style={{ ...textStyles.subTitle, marginTop: 20, marginLeft: 10 }}>Address details</Text>

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
          <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={()=> {showCountryPicker(true)}}>
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

        <View style={{ alignSelf: 'flex-start', marginTop: 20, marginLeft: 10 }}>
          <Text style={{ ...textStyles.subTitle }}>Notes</Text>
          <Text style={{ ...textStyles.smallText }}>Submit each time you add a new business.</Text>
          <Text style={{ ...textStyles.smallText, marginTop: 4, lineHeight: 20 }}>You will be able to edit each venue name settings.</Text>
        </View>

        <EmptyGap />

        <BlueButton
          title="Submit"
          style={{ marginTop: 20 }}
          onPressListener={createVenue}
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
  categoryIcon: {
    width: 15,
    height: 15,
    resizeMode: 'contain'
  }
});

export default CreateVenue;