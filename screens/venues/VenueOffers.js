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
import { Input, Text } from 'react-native-elements';
import RNCountry from "react-native-countries";
import Flag from 'react-native-round-flags';
import moment from 'moment';

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
		
const VenueOffers = ({
  navigation, route
}) => {

  const scrollViewRef = useRef();

  const [isAdmin, setAdmin] = useState(store.getState().user?.role?.type == 'superadmin');

  const [venue, setVenue] = useState(route.params?.venue);
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [offerAvailability, setOfferAvailability] = useState('');
  const [photoUrl, setPhotoUrl] = useState(route.params?.venue?.photo?.url);
  const [newAsset, setNewAsset] = useState();

  const [businessName, setBusinessName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [venueType, setVenueType] = useState('');
  const [venueCategory, setVenueCategory] = useState('');
  const [countryName, setCountryName] = useState('');

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

  const [imagePicker, setImagePicker] = useState(false);

  const [isLoading, setLoading] = useState(false);

  useEffect(() => {

    setBusinessName(venue?.business?.name);
    const venueTypeItem = venueTypeItems.find(element => (element.value == venue?.subtype));
    setVenueType(venueTypeItem?.label);

    const venueCategoryItem = venueCategoryItems.find(element => (element.value == venue?.category));
    setVenueCategory(venueCategoryItem?.label);

    setVenueCategory(venue?.category);
    setVenueName(venue?.name);

    const countryNamesWithCodes = RNCountry.getCountryNamesWithCodes;
		const venueCountry = countryNamesWithCodes.find(element => (element.code == venue?.country));
		setCountryName(venueCountry?.name);

  }, []);

  const selectImageAsset = async (asset) => {
    setNewAsset(asset);
    setPhotoUrl(asset.uri);
  }

  return (
    <>
      <BasicScreen
        scrollViewRef={scrollViewRef}
      >

        <StatusBar barStyle='dark-content' backgroundColor='transparent' />
        {isLoading && <LoadingIndicator />}

        <View style={styles.rowItem}>
          <View style={{flexDirection: 'column'}}>
            <Text style={{...fontStyles.semibold, fontSize: 28}}>{venue?.name}</Text>
            <Text style={{...fontStyles.regular, fontSize: 14}}>{venue?.address}, {venue?.location}, {countryName}</Text>
            <Text style={{...fontStyles.regular, fontSize: 15}}>+52 1 984 319 7044</Text>
          </View>
          <Image source={category_bar} style={{width: 40, height: 40, resizeMode: 'contain'}}/>
        </View>

        <View style={styles.rowItem}>
          <Text style={{...fontStyles.semibold, fontSize: 22}}>Offers</Text>
        </View>
        <View style={{...styles.rowItem, marginTop: 2}}>
          <Text style={{...fontStyles.regular, fontSize: 15}}>This is your opportunity to promote your business and offer wcashless users any special offers for using wandoOs in your venues and events.</Text>
        </View>
        <View style={styles.rowItem}>
          <Text style={{...fontStyles.regular, fontSize: 15}}>These will be listed on your Venue page and latest "in-area" offers for wcashless users to view.</Text>
        </View>

        <View style={{...styles.rowItem, marginTop: 16}}>
          <Text style={{...fontStyles.semibold, fontSize: 17}}>Offer title</Text>
        </View>
        
        <Input
          containerStyle={{ ...styles.rowItem, ...styles.rowBorder, padding: 0 }}
          inputContainerStyle={{ borderBottomColor: 'transparent' }}
          inputStyle={{...fontStyles.semibold, fontSize: 20}}
          placeholder='e.g. 10% off Food & Drink'
          keyboardType='default'
          returnKeyType='done'
          value={offerTitle}
          onChange={(event) => {
            setOfferTitle(event.nativeEvent.text)
          }}
          errorStyle={{ height: 0 }}
        />

        <View style={{...styles.rowItem, justifyContent: 'flex-start', marginTop: 16}}>
          <Text style={{...fontStyles.semibold, fontSize: 17, marginRight: 12}}>Offer photo</Text>
          <TouchableOpacity style={styles.cameraButtonContainer} onPress={() => { setImagePicker(true) }}>
            <Image source={camera_w} style={styles.cameraIcon}></Image>
          </TouchableOpacity>
        </View>

        <View style={{...styles.rowItem, marginTop: 16}}>
          <Text style={{...fontStyles.semibold, fontSize: 17}}>Description & conditions</Text>
        </View>
        <Input
          containerStyle={{ ...styles.rowItem, ...styles.rowBorder, padding: 0 }}
          inputContainerStyle={{ borderBottomColor: 'transparent' }}
          inputStyle={styles.rowDescription}
          placeholder='E.g When you pay with your wcashless wandoOs.'
          keyboardType='default'
          returnKeyType='done'
          multiline={true}
          numberOfLines={3}
          value={offerDescription}
          onChange={(event) => {
            setOfferDescription(event.nativeEvent.text)
          }}
          errorStyle={{ height: 0 }}
        />

        <View style={{...styles.rowItem, marginTop: 16}}>
          <Text style={{...fontStyles.semibold, fontSize: 17}}>Availability</Text>
        </View>
        <Input
          containerStyle={{ ...styles.rowItem, ...styles.rowBorder, padding: 0 }}
          inputContainerStyle={{ borderBottomColor: 'transparent' }}
          inputStyle={styles.rowDescription}
          placeholder='E.g Available Mon - Fri 10:00 - 20:00'
          keyboardType='default'
          returnKeyType='done'
          value={offerAvailability}
          onChange={(event) => {
            setOfferAvailability(event.nativeEvent.text)
          }}
          errorStyle={{ height: 0 }}
        />

        <View style={{...styles.rowItem, marginTop: 16}}>
          <Text style={{...fontStyles.semibold, fontSize: 17}}>Choose background</Text>
        </View>
        <View style={{...styles.rowItem, marginTop: 8}}>
          <TouchableOpacity style={{...styles.colorCircle, backgroundColor: '#FFFF00'}}></TouchableOpacity>
          <TouchableOpacity style={{...styles.colorCircle, backgroundColor: '#F24727'}}></TouchableOpacity>
          <TouchableOpacity style={{...styles.colorCircle, backgroundColor: '#FF0000'}}></TouchableOpacity>
          <TouchableOpacity style={{...styles.colorCircle, backgroundColor: '#F12DDE'}}></TouchableOpacity>
          <TouchableOpacity style={{...styles.colorCircle, backgroundColor: '#C9A6F5'}}></TouchableOpacity>
          <TouchableOpacity style={{...styles.colorCircle, backgroundColor: '#9560DB'}}></TouchableOpacity>
          <TouchableOpacity style={{...styles.colorCircle, backgroundColor: '#14CDD4'}}></TouchableOpacity>
          <TouchableOpacity style={{...styles.colorCircle, backgroundColor: '#2D9BFO'}}></TouchableOpacity>
          <TouchableOpacity style={{...styles.colorCircle, backgroundColor: '#2B66F6'}}></TouchableOpacity>
          <TouchableOpacity style={{...styles.colorCircle, backgroundColor: '#414BB2'}}></TouchableOpacity>
          <TouchableOpacity style={{...styles.colorCircle, backgroundColor: '#CFE741'}}></TouchableOpacity>
          <TouchableOpacity style={{...styles.colorCircle, backgroundColor: '#8FD14F'}}></TouchableOpacity>
          <TouchableOpacity style={{...styles.colorCircle, backgroundColor: '#55A128'}}></TouchableOpacity>
          <TouchableOpacity style={{...styles.colorCircle, backgroundColor: '#000000'}}></TouchableOpacity>
        </View>

        <View style={{...styles.rowItem, justifyContent: 'flex-end', marginTop: 16}}>
          <TouchableOpacity>
            <Text style={{...styles.rowDescription, fontSize: 17}}>Save & Review</Text>
          </TouchableOpacity>
          
        </View>
        
        <EmptyGap />

        {imagePicker &&
          <ImagePickerDialog
            closeDialog={() => setImagePicker(false)}
            onImageAsset={(asset) => { selectImageAsset(asset) }}
          />
        }

        
      </BasicScreen>
    </>

  );
}

const styles = StyleSheet.create({
  rowItem: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 10
  },
  rowBorder: {
    backgroundColor: 'white',
    borderWidth: 0.5,
    borderColor: theme.COLORS.BORDER_COLOR,
    borderRadius: 8,
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
  categoryIcon: {
    width: 15,
    height: 15,
    resizeMode: 'contain'
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
  colorCircle: {
    width: 18, 
    height: 18,
    borderColor: theme.COLORS.GREY_COLOR,
    borderWidth: 1,
    borderRadius: 10
  }
});

export default VenueOffers;