import React, { useState, useEffect, useRef } from 'react';
import {
  View, Animated, StyleSheet, TouchableOpacity, Dimensions, Image, ImageBackground, StatusBar
} from 'react-native';
import { Input, Text } from 'react-native-elements';
import DropDownPicker from 'react-native-dropdown-picker';
import CountryPicker from 'react-native-country-picker-modal'
import * as RNLocalize from "react-native-localize";
import RNCountry from "react-native-countries";

import { businessApiService } from '../../service';
import { store } from '../../redux/Store';

import EmptyGap from '../../components/EmptyGap';
import BasicScreen from '../../components/BasicScreen';
import LoadingIndicator from '../../components/LoadingIndicator';
import theme from '../../constants/Theme';
import { fontStyles, textStyles, commonStyles } from '../../styles/styles';
import ImagePickerDialog from '../../components/ImagePickerDialog';
import BlueButton from '../../components/BlueButton';

const { width, height } = Dimensions.get('screen');

const IMAGE_HEIGHT_SMALL = 48;
const IMAGE_HEIGHT = 96;

const logo_bg = require('../../assets/logo/event_logo.png');
const camera_w = require('../../assets/images/camera_w.png');
const dropdown_icon = require('../../assets/images/dropdown.png');

const CreateEvent = ({
  navigation
}) => {

  const scrollViewRef = useRef();

  const businessNameRef = useRef();
  const eventNameRef = useRef();
  const eventDescriptionRef = useRef();

  const imageHeight = useRef(new Animated.Value(IMAGE_HEIGHT)).current;
  const imagePadding = useRef(new Animated.Value(IMAGE_HEIGHT_SMALL)).current;

  const [business, setBusiness] = useState(store.getState().business);
  const [eventName, setEventName] = useState('');
  const [eventType, setEventType] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState();
  const [postalCode, setPostalCode] = useState('');

  const [countryName, setCountryName] = useState('');
  const [isCountryPicker, showCountryPicker] = useState(false);

  const [eventDescription, setEventDescription] = useState('');

  const [errorBusinessName, setErrorBusinessName] = useState();
  const [errorEventName, setErrorEventName] = useState();
  const [errorEventType, setErrorEventType] = useState();
  const [errorLocation, setErrorLocation] = useState();

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

  const [imagePicker, setImagePicker] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [newAsset, setNewAsset] = useState();

  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    setPhotoUrl('');
    setNewAsset();
    setErrorBusinessName('');
    setErrorEventName('');
    setErrorEventType('');
    setErrorLocation('');

    const countryNamesWithCodes = RNCountry.getCountryNamesWithCodes;
		const countryCode = RNLocalize.getCountry();
		const country = countryNamesWithCodes.find(element => (element.code == countryCode));
    setCountryName(country?.name);
  }, []);

  const selectImageAsset = async (asset) => {
    setNewAsset(asset);
    setPhotoUrl(asset.uri);
  }

  const onCountrySelect = (country) => {
    showCountryPicker(false);
    setCountry(country?.cca2);
    setCountryName(country?.name);
  }

  const createEvent = async () => {
    if (business == undefined || business == null) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true })
      businessNameRef.current.focus();
      return setErrorBusinessName(`Business Name required`);
    } else {
      setErrorBusinessName();
    }

    if (!eventName.trim()) {
      scrollViewRef.current.scrollTo({ y: height * 0.2, animated: true })
      eventNameRef.current.focus();
      return setErrorEventName(`Event Name required`);
    } else {
      setErrorEventName();
    }

    if (!eventType.trim()) {
      scrollViewRef.current.scrollTo({ y: height * 0.4, animated: true });
      return setErrorEventType(`Event Type required`);
    } else {
      setErrorEventType();
    }

    if (!location.trim()) {
      scrollViewRef.current.scrollTo({ y: height * 0.6, animated: true });
      return setErrorLocation(`Location required`);
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
      name: eventName,
      type: 'Event',
      subtype: eventType,
      description: eventDescription,
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
        navigation.replace('ManageEvents');
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

  const buildHeader = () => {
    return (
      <>
        <View style={{ width: '95%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'column', marginTop: 24 }}>
            <Text style={{ ...commonStyles.headerTitle, alignSelf: 'flex-start', marginStart: 12 }}>
              Add event
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

        <Text style={{ ...textStyles.subTitle, marginTop: 20, marginLeft: 10 }}>Event information</Text>

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

        <View style={styles.colItem}>
          <Text style={{ ...styles.rowTitle, marginStart: 12 }}>Event description</Text>
          <Input
            ref={eventDescriptionRef}
            containerStyle={{ flex: 1, padding: 0 }}
            inputContainerStyle={{ borderBottomColor: 'transparent' }}
            inputStyle={{...styles.rowDescription, textAlignVertical: 'top'}}
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

        <View style={{ alignSelf: 'flex-start', marginTop: 20, marginLeft: 10  }}>
          <Text style={{ ...textStyles.subTitle, }}>Notes</Text>
          <Text style={{ ...textStyles.smallText }}>Submit each time you add a new event.</Text>
          <Text style={{ ...textStyles.smallText, marginTop: 4, lineHeight: 20 }}>You will be able to edit each event name settings.</Text>
        </View>

        <EmptyGap />

        <BlueButton
          title="Submit"
          style={{ marginTop: 20 }}
          onPressListener={createEvent}
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
});

export default CreateEvent;