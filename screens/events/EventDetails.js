import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, Alert, Dimensions, ImageBackground, StatusBar, TouchableOpacity, Image
} from 'react-native';
import { Input, Text } from 'react-native-elements';
import * as RNLocalize from "react-native-localize";
import RNCountry from "react-native-countries";
import Flag from 'react-native-round-flags';
import moment from 'moment';
import { isValidPhoneNumber, parsePhoneNumber } from 'libphonenumber-js'
import { useIsFocused } from '@react-navigation/native';

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

const cardBg = require('../../assets/card_bg.png');
const logo = require('../../assets/logo/wc_white_w.png');
const cardChip = require('../../assets/wc_chip.png');
const wpay = require('../../assets/logo/wpay_white_w.png');
const rating_icon = require('../../assets/images/rating.png');
const rating_active_icon = require('../../assets/images/rating_yellow.png');

const EventDetails = ({
  navigation, route
}) => {

  const scrollViewRef = useRef();

  const [event, setEvent] = useState(route.params?.event);
  const [photoUrl, setPhotoUrl] = useState(route.params?.event?.photo?.url);
  const [newAsset, setNewAsset] = useState();

  const [averageRating, setAverageRating] = useState(0);
  const [reviews, setReviews] = useState([]);

  const [imagePicker, setImagePicker] = useState(false);
  const [eventType, setEventType] = useState('');

  const [countryName, setCountryName] = useState('');

  const [countryCode, setCountryCode] = useState(isValidPhoneNumber(event?.phone ? event.phone : '') ? parsePhoneNumber(event?.phone)?.country : 'US');
  const [callingCode, setCallingCode] = useState(isValidPhoneNumber(event?.phone ? event.phone : '') ? parsePhoneNumber(event?.phone)?.countryCallingCode : '1');
  const [phoneNumber, setPhoneNumber] = useState(isValidPhoneNumber(event?.phone ? event.phone : '') ? parsePhoneNumber(event?.phone)?.nationalNumber : '');

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

  const isFocused = useIsFocused();

  useEffect(() => {
    setInitialValues();
  }, []);

  useEffect(() => {
    getEventDetail(event);
  }, [isFocused]);

  const setInitialValues = async(event) => {
    const eventTypeItem = eventTypeItems.find(element => (element.value == event?.subtype));
    setEventType(eventTypeItem?.label);

    const countryNamesWithCodes = RNCountry.getCountryNamesWithCodes;
    const countryCode = event?.country ? event.country : RNLocalize.getCountry();
    const country = countryNamesWithCodes.find(element => (element.code == countryCode));
    setCountryName(country?.name);

    getReviews();
  }

  const getEventDetail = async() => {
    setLoading(true);
    const result = await businessApiService.getBusinessSite(event?.id);
    setLoading(false);
    
    if (!result.error && result.data) {
      setEvent(result.data?.data)
      setInitialValues(event);
    }
  }

  const getReviews = async () => {
    setLoading(true);
    const result = await businessApiService.getReviews(event?.id);
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
              {event?.name}
            </Text>
            <Text style={{ ...fontStyles.semibold, fontSize: 15, alignSelf: 'flex-start', marginStart: 12, color: theme.COLORS.BLUE }}>
              {event?.email}
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

        <View style={styles.cardContainer}>
          <Image source={cardBg} style={styles.cardBgImage}></Image>
          <Image source={logo} style={styles.cardLogoImage}></Image>
          <Image source={cardChip} style={styles.cardChipImage}></Image>
          <View style={styles.eventNameRow}>
            <Text style={styles.subTitle}>{event?.name}</Text>
          </View>

          <View style={styles.eventIdRow}>
            <Text style={styles.memberTitle}>Event ID: </Text>
            <Text style={{ ...styles.memberDescription, marginLeft: 20 }}>{event?.id}</Text>
          </View>
          <View style={styles.eventDateRow}>
            <Text style={styles.memberTitle}>Event since: </Text>
            <Text style={{ ...styles.memberDescription, marginLeft: 26 }}>{moment(event?.createdAt).format('MMM Do, YYYY')}</Text>
          </View>
          <Image source={wpay} style={styles.wpayIcon}></Image>
        </View>

        <View style={{ ...styles.rowItem, height: 35, backgroundColor: 'transparent', borderWidth: 0, paddingHorizontal: 0 }}>
          <Text style={{ ...fontStyles.semibold, fontSize: 17 }}>Event Rating</Text>
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
          <TouchableOpacity onPress={() => { navigation.navigate('EventReviews', { event }) }}>
            <Text style={styles.rowDescription}>Go to reviews</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ ...textStyles.subTitle, marginTop: 20 }}>Event information</Text>

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Event name</Text>
          <Text style={styles.rowDescription}>{event?.name}</Text>
        </View>

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Event type</Text>
          <Text style={styles.rowDescription}>{eventType}</Text>
        </View>

        <View style={styles.colItem}>
          <Text style={{ ...styles.rowTitle, marginStart: 12 }}>Event description</Text>
          <Input
            containerStyle={{ flex: 1, padding: 0 }}
            inputContainerStyle={{ borderBottomColor: 'transparent' }}
            inputStyle={{ ...styles.rowDescription, textAlignVertical: 'top' }}
            placeholder='Event description'
            multiline={true}
            numberOfLines={3}
            value={event?.description}
            errorStyle={{ height: 0 }}
            editable={false}
          />
        </View>

        <Text style={{ ...textStyles.subTitle, marginTop: 20 }}>Address details</Text>

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Street</Text>
          <Text style={styles.rowDescription}>{event?.address}</Text>
        </View>

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>City/Location</Text>
          <Text style={styles.rowDescription}>{event?.location}</Text>
        </View>

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Country</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {(event?.country && event?.country != '') && <Flag code={event?.country} style={{ width: 20, height: 20 }} />}
            <Text style={{ ...styles.rowDescription, marginLeft: 12 }}>{countryName}</Text>
          </View>
        </View>

        <View style={styles.rowItem}>
          <Text style={styles.rowTitle}>Postal code / Zip code</Text>
          <Text style={styles.rowDescription}>{event?.postalCode}</Text>
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
          <Text style={styles.rowTitle}>Event email</Text>
          <Text style={styles.rowDescription}>{event?.email ? event?.email : 'event@email.com'}</Text>
        </View>

        <EmptyGap />

        <BlueButton
          title="Settings"
          style={{ marginTop: 20 }}
          onPressListener={() => { navigation.navigate('EditEvent', { event }) }}
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
  eventNameRow: {
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
  eventIdRow: {
    position: 'absolute',
    top: 110,
    left: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  eventDateRow: {
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

export default EventDetails;