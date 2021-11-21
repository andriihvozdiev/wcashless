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
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js'
import { useIsFocused } from '@react-navigation/native';

import { businessApiService } from '../../service';
import { store } from '../../redux/Store';
import EmptyGap from '../../components/EmptyGap';
import BasicScreen from '../../components/BasicScreen';
import LoadingIndicator from '../../components/LoadingIndicator';
import theme from '../../constants/Theme';
import { commonStyles, fontStyles, textStyles } from '../../styles/styles';
import ImagePickerDialog from '../../components/ImagePickerDialog';
import BlueButton from '../../components/BlueButton';

const { width, height } = Dimensions.get('screen');

const header_logo = require('../../assets/logo/logo_bg.png');
const camera_w = require('../../assets/images/camera_w.png');

const cardBg = require('../../assets/card_bg.png');
const logo = require('../../assets/logo/wc_white_w.png');
const cardChip = require('../../assets/wc_chip.png');
const wpay = require('../../assets/logo/wpay_white_w.png');
const rating_icon = require('../../assets/images/rating.png');
const rating_active_icon = require('../../assets/images/rating_yellow.png');

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

const VenueDetails = ({
  navigation, route
}) => {

  const scrollViewRef = useRef();

  const [isAdmin, setAdmin] = useState(store.getState().user?.role?.type == 'superadmin');

  const [venue, setVenue] = useState(route.params?.venue);
  const [photoUrl, setPhotoUrl] = useState(route.params?.venue?.photo?.url);
  const [newAsset, setNewAsset] = useState();

  const [averageRating, setAverageRating] = useState(0);
  const [reviews, setReviews] = useState([]);

  const [venueType, setVenueType] = useState('');
  const [venueCategory, setVenueCategory] = useState('');
  const [countryName, setCountryName] = useState('');

  const [countryCode, setCountryCode] = useState(isValidPhoneNumber(venue?.phone ? venue.phone : '') ? parsePhoneNumber(venue?.phone)?.country : 'US');
  const [callingCode, setCallingCode] = useState(isValidPhoneNumber(venue?.phone ? venue.phone : '') ? parsePhoneNumber(venue?.phone)?.countryCallingCode : '1');
  const [phoneNumber, setPhoneNumber] = useState(isValidPhoneNumber(venue?.phone ? venue.phone : '') ? parsePhoneNumber(venue?.phone)?.nationalNumber : '');

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

  const isFocused = useIsFocused();

  useEffect(() => {
    setInitialValues();    
  }, []);

  useEffect(() => {
    getVenueDetail(venue);
  }, [isFocused]);

  const setInitialValues = async(venue) => {
    const venueTypeItem = venueTypeItems.find(element => (element.value == venue?.subtype));
    setVenueType(venueTypeItem?.label);

    const venueCategoryItem = venueCategoryItems.find(element => (element.value == venue?.category));
    setVenueCategory(venueCategoryItem?.label);

    const countryNamesWithCodes = RNCountry.getCountryNamesWithCodes;
    const venueCountry = countryNamesWithCodes.find(element => (element.code == venue?.country));
    setCountryName(venueCountry?.name);

    getReviews();
  }

  const getVenueDetail = async() => {
    setLoading(true);
    const result = await businessApiService.getBusinessSite(venue?.id);
    setLoading(false);
    
    if (!result.error && result.data) {
      setVenue(result.data?.data)
      setInitialValues(result.data?.data);
    }
  }

  const getReviews = async () => {
    setLoading(true);
    const result = await businessApiService.getReviews(venue?.id);
    setLoading(false);

    if (!result.error && result.data) {
      setAverageRating(result.data.data?.rating);
      setReviews(result.data.data?.reviews);
    }
  }

  const selectImageAsset = async (asset) => {
    setNewAsset(asset);
    setPhotoUrl(asset.uri);
  }

  const buildHeader = () => {
    return (
      <>
        <View style={{ width: '95%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'column', marginTop: 24 }}>
            <Text style={{ ...commonStyles.headerTitle, alignSelf: 'flex-start', marginStart: 12 }}>
              {venue?.name}
            </Text>
            <Text style={{ ...fontStyles.semibold, fontSize: 15, alignSelf: 'flex-start', marginStart: 12, color: theme.COLORS.BLUE }}>
              {venue?.email ? venue?.email : ''}
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

        <View style={styles.cardContainer}>
          <Image source={cardBg} style={styles.cardBgImage}></Image>
          <Image source={logo} style={styles.cardLogoImage}></Image>
          <Image source={cardChip} style={styles.cardChipImage}></Image>
          <View style={styles.venueNameRow}>
            <Text style={styles.subTitle}>{venue?.name}</Text>
          </View>

          <View style={styles.venueIdRow}>
            <Text style={styles.memberTitle}>Venue ID: </Text>
            <Text style={{ ...styles.memberDescription, marginLeft: 20 }}>{venue?.id}</Text>
          </View>
          <View style={styles.venueDateRow}>
            <Text style={styles.memberTitle}>Venue since: </Text>
            <Text style={{ ...styles.memberDescription, marginLeft: 26 }}>{moment(venue?.createdAt).format('MMM Do, YYYY')}</Text>
          </View>
          <Image source={wpay} style={styles.wpayIcon}></Image>
        </View>

        <View style={{ ...styles.rowItem, height: 35, backgroundColor: 'transparent', borderWidth: 0, paddingHorizontal: 0 }}>
          <Text style={{ ...fontStyles.semibold, fontSize: 17 }}>Venue Rating</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ ...fontStyles.semibold, fontSize: 17, marginRight: 4 }}>({reviews.length})</Text>
            <Image source={(averageRating && averageRating > 0) ? rating_active_icon : rating_icon} style={styles.ratingImage} />
            <Image source={(averageRating && averageRating > 1) ? rating_active_icon : rating_icon} style={styles.ratingImage} />
            <Image source={(averageRating && averageRating > 2) ? rating_active_icon : rating_icon} style={styles.ratingImage} />
            <Image source={(averageRating && averageRating > 3) ? rating_active_icon : rating_icon} style={styles.ratingImage} />
            <Image source={(averageRating && averageRating > 4) ? rating_active_icon : rating_icon} style={styles.ratingImage} />
          </View>
        </View>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end' }}>
          <TouchableOpacity onPress={() => { navigation.navigate('VenueReviews', { venue }) }}>
            <Text style={styles.rowDescription}>Go to reviews</Text>
          </TouchableOpacity>
        </View>


        <View style={{ ...styles.rowItem, backgroundColor: 'transparent', borderWidth: 0, paddingHorizontal: 0 }}>
          <Text style={{ ...fontStyles.semibold, fontSize: 17 }}>Venue Offers</Text>
          <TouchableOpacity onPress={() => { navigation.navigate('VenueOffers', { venue }) }}>
            <Text style={styles.rowDescription}>View offers</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ ...textStyles.subTitle, marginTop: 20 }}>Venue information</Text>

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Venue name</Text>
          <Text style={styles.rowDescription}>{venue?.name}</Text>
        </View>

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Venue type</Text>
          <Text style={{ ...styles.rowDescription, flex: 1, marginLeft: 12, textAlign: 'right' }} numberOfLines={1}>{venueType}</Text>
        </View>

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Venue category</Text>
          <Text style={styles.rowDescription}>{venueCategory}</Text>
        </View>

        <View style={styles.colItem}>
          <Text style={{ ...styles.rowTitle, marginStart: 12 }}>Venue description</Text>
          <Input
            containerStyle={{ flex: 1, padding: 0 }}
            inputContainerStyle={{ borderBottomColor: 'transparent' }}
            inputStyle={{ ...styles.rowDescription, textAlignVertical: 'top' }}
            placeholder='Venue description'
            multiline={true}
            numberOfLines={3}
            value={venue?.description}
            errorStyle={{ height: 0 }}
            editable={false}
          />
        </View>

        <Text style={{ ...textStyles.subTitle, marginTop: 20 }}>Address details</Text>

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Street</Text>
          <Text style={styles.rowDescription}>{venue?.address}</Text>
        </View>


        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>City/Location</Text>
          <Text style={styles.rowDescription}>{venue?.location}</Text>
        </View>

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Country</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {(venue?.country && venue?.country != '') && <Flag code={venue?.country} style={{ width: 20, height: 20 }} />}
            <Text style={{ ...styles.rowDescription, marginLeft: 12 }}>{countryName}</Text>
          </View>
        </View>

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Postal code / Zip code</Text>
          <Text style={styles.rowDescription}>{venue?.postalCode}</Text>
        </View>

        <View style={{ flexDirection: 'row', marginTop: 10 }}>
          <View style={{ ...styles.rowItem, marginTop: 0, width: 100 }}>
            <Flag code={countryCode} style={{ width: 20, height: 20 }} />
            <Text style={{ ...styles.rowDescription, marginLeft: 12 }}>+{callingCode}</Text>
          </View>

          <View style={{ ...styles.rowItem, marginTop: 0, flex: 1, marginLeft: 8, justifyContent: 'flex-end' }}>
            <Text style={{ ...styles.rowDescription, marginLeft: 12 }}>{phoneNumber}</Text>
          </View>
        </View>

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Venue email</Text>
          <Text style={styles.rowDescription}>{venue?.email ? venue?.email : ''}</Text>
        </View>

        <EmptyGap />

        <BlueButton
          title="Settings"
          style={{ marginTop: 20 }}
          onPressListener={() => { navigation.navigate('EditVenue', { venue: venue }) }}
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
  categoryIcon: {
    width: 15,
    height: 15,
    resizeMode: 'contain'
  },
  cardContainer: {
    position: 'relative',
    width: 300,
    height: 160,
    marginTop: 20,
    marginBottom: 20
  },
  cardBgImage: {
    width: 300,
    height: 160,
    resizeMode: 'stretch',
    position: 'absolute',
  },
  cardLogoImage: {
    top: 12,
    left: 16,
    width: 130,
    height: 40,
    resizeMode: 'contain',
    position: 'absolute',
  },
  cardChipImage: {
    position: 'absolute',
    top: 54,
    left: 24,
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  venueNameRow: {
    position: 'absolute',
    top: 62,
    left: 80,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center'
  },
  subTitle: {
    ...fontStyles.semibold,
    fontSize: 16,
    color: 'white'
  },
  venueIdRow: {
    position: 'absolute',
    top: 110,
    left: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  venueDateRow: {
    position: 'absolute',
    top: 130,
    left: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  memberTitle: {
    ...fontStyles.semibold,
    fontSize: 12,
    color: 'white'
  },
  memberDescription: {
    fontSize: 12,
    color: 'white'
  },
  wpayIcon: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 45,
    height: 45,
    resizeMode: 'contain'
  },
  ratingImage: {
    width: 20,
    height: 20,
    marginLeft: 2,
    resizeMode: 'contain'
  }
});

export default VenueDetails;