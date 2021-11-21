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
  TouchableOpacity,
  FlatList
} from 'react-native';
import { Input, Text } from 'react-native-elements';
import RNCountry from "react-native-countries";
import moment from 'moment';
import Icon from 'react-native-vector-icons/Ionicons';
import { Dialog } from 'react-native-simple-dialogs';
import CalendarPicker from 'react-native-calendar-picker';

import { businessApiService } from '../../service';
import { store } from '../../redux/Store';
import EmptyGap from '../../components/EmptyGap';
import BasicScreen from '../../components/BasicScreen';
import LoadingIndicator from '../../components/LoadingIndicator';
import theme from '../../constants/Theme';
import { fontStyles } from '../../styles/styles';
import BlueButton from '../../components/BlueButton';

const { width, height } = Dimensions.get('screen');

const IMAGE_HEIGHT_SMALL = 48;
const IMAGE_HEIGHT = 96;

const dropdown_icon = require('../../assets/images/dropdown.png');
const rating_icon = require('../../assets/images/rating.png');
const rating_active_icon = require('../../assets/images/rating_yellow.png');
const email_icon = require('../../assets/images/email.png');
const download_icon = require('../../assets/images/download.png');

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

const EventReviews = ({
  navigation, route
}) => {

  const scrollViewRef = useRef();

  const [event, setEvent] = useState(route.params?.event);
  const [photoUrl, setPhotoUrl] = useState(route.params?.event?.photo?.url);
  const [newAsset, setNewAsset] = useState();

  const [businessName, setBusinessName] = useState('');
  const [eventType, setEventType] = useState('');
  const [countryName, setCountryName] = useState('');

  const [averageRating, setAverageRating] = useState(0);
  const [reviews, setReviews] = useState([]);

  const [period, setPeriod] = useState();
  const [isPeriodPicker, showPeriodPicker] = useState(false);
  const [isCalendarPicker, showCalendarPicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState();
  const [selectedEndDate, setSelectedEndDate] = useState();
  const [isHelpDialog, showHelpDialog] = useState(false);

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

  const [isLoading, setLoading] = useState(false);

  useEffect(() => {

    setBusinessName(event?.business?.name);
    const eventTypeItem = eventTypeItems.find(element => (element.value == event?.subtype));
    setEventType(eventTypeItem?.label);

    const countryNamesWithCodes = RNCountry.getCountryNamesWithCodes;
    const eventCountry = countryNamesWithCodes.find(element => (element.code == event?.country));
    setCountryName(eventCountry?.name);

    getReviews();

  }, []);

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

  const selectPeriod = (item) => {
    showPeriodPicker(false);
    var newPeriod = {
      label: item,
      from: moment().format('YYYY-MM-DD'),
      to: null
    }

    if (item == 'Today') {
      newPeriod.from = moment().format('YYYY-MM-DD');
    }

    if (item == 'This week') {
      const todayWeekday = moment().isoWeekday();
      const startOfWeek = moment().subtract(todayWeekday - 1, 'days').format('YYYY-MM-DD');
      newPeriod.from = startOfWeek;
    }

    if (item == 'This month') {
      const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
      newPeriod.from = startOfMonth;
    }

    if (item == 'This year') {
      const startOfYear = moment().startOf('year').format('YYYY-MM-DD');
      newPeriod.from = startOfYear;
    }

    setPeriod(newPeriod);
  }

  const onDateChange = (date, type) => {
    if (type === 'END_DATE') {
      setSelectedEndDate(date);
    } else {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    }
  }

  const selectPeriodFromCalendar = () => {
    showCalendarPicker(false);
    showPeriodPicker(false);

    const from = moment(selectedStartDate).format('YYYY-MM-DD');
    const to = moment(selectedEndDate).format('YYYY-MM-DD');

    var newPeriod = {
      label: `Select period`,
      from: from,
      to: to
    }

    setPeriod(newPeriod);
  }

  const renderItem = ({ item }) => {
    const review = item;
    console.log(review)
    return (
      <TouchableOpacity style={styles.itemContainer} key={review.id}
        onPress={() => { }}>

        <View style={{ ...styles.rowItem, alignItems: 'flex-start', marginTop: 0, paddingHorizontal: 0 }}>
          <Text style={{ ...fontStyles.semibold, fontSize: 16, color: theme.COLORS.BLUE }}>
            {review.customer?.firstName} {review.customer?.lastName}
          </Text>
          <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
            <Text style={{ ...fontStyles.semibold, fontSize: 15 }}>
              {moment(review.reviewAt).format('MM/DD/yy HH:mm')}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={(review?.rating && review?.rating > 0) ? rating_active_icon : rating_icon} style={styles.smallRatingImage} />
              <Image source={(review?.rating && review?.rating > 1) ? rating_active_icon : rating_icon} style={styles.smallRatingImage} />
              <Image source={(review?.rating && review?.rating > 2) ? rating_active_icon : rating_icon} style={styles.smallRatingImage} />
              <Image source={(review?.rating && review?.rating > 3) ? rating_active_icon : rating_icon} style={styles.smallRatingImage} />
              <Image source={(review?.rating && review?.rating > 4) ? rating_active_icon : rating_icon} style={styles.smallRatingImage} />
            </View>
          </View>
        </View>

        <Text style={{ ...fontStyles.regular, fontSize: 14, marginTop: 8 }}>
          {review.review}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
          <BlueButton
            title="Reply"
            width={80}
            height={20}
            fontSize={12}
            titleStyle={{ ...fontStyles.semibold, color: 'white' }}
            onPressListener={() => { }}
          />
        </View>

      </TouchableOpacity>
    );
  }

  return (
    <>
      <BasicScreen
        scrollViewRef={scrollViewRef}
      >

        <StatusBar barStyle='dark-content' backgroundColor='transparent' />
        {isLoading && <LoadingIndicator />}

        <View style={styles.rowItem}>
          <View style={{ flexDirection: 'column' }}>
            <Text style={{ ...fontStyles.semibold, fontSize: 28 }}>{event?.name}</Text>
            <Text style={{ ...fontStyles.regular, fontSize: 14 }}>{event?.address}, {event?.location}, {countryName}</Text>
            <Text style={{ ...fontStyles.regular, fontSize: 15 }}>+52 1 984 319 7044</Text>
          </View>
          <Image source={category_bar} style={{ width: 40, height: 40, resizeMode: 'contain' }} />
        </View>

        <View style={styles.rowItem}>
          <Text style={{ ...fontStyles.semibold, fontSize: 22 }}>Average Rating</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ ...fontStyles.semibold, fontSize: 17, marginRight: 4 }}>({reviews.length})</Text>
            <Image source={(averageRating && averageRating > 0) ? rating_active_icon : rating_icon} style={styles.ratingImage} />
            <Image source={(averageRating && averageRating > 1) ? rating_active_icon : rating_icon} style={styles.ratingImage} />
            <Image source={(averageRating && averageRating > 2) ? rating_active_icon : rating_icon} style={styles.ratingImage} />
            <Image source={(averageRating && averageRating > 3) ? rating_active_icon : rating_icon} style={styles.ratingImage} />
            <Image source={(averageRating && averageRating > 4) ? rating_active_icon : rating_icon} style={styles.ratingImage} />
          </View>
        </View>

        <View style={{ ...styles.rowItem, marginTop: 30 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ ...fontStyles.semibold, fontSize: 17 }}>Latest Reviews</Text>
            <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => { }}>
              <Icon name="information-circle-outline" size={20} color={theme.COLORS.BLUE} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={() => { showPeriodPicker(true) }}>
            <Text style={{ ...fontStyles.semibold, fontSize: 15, color: theme.COLORS.BLUE }}>{period?.label ? period.label : 'Sort by'}</Text>
            <Image source={dropdown_icon} style={{ width: 12, height: 10, marginLeft: 4 }} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={reviews}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          style={{ flex: 1, marginTop: 12 }}
        />

        <EmptyGap />

        <View style={styles.bottomContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ ...fontStyles.regular, fontSize: 15 }}>Choose an option</Text>

            <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
              <TouchableOpacity style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center' }} onPress={() => { }}>
                <Image source={download_icon} style={{ width: 15, height: 15, marginEnd: 8 }}></Image>
                <Text style={{ ...fontStyles.regular, fontSize: 15, color: theme.COLORS.BLUE }}>Download</Text>
              </TouchableOpacity>

              <TouchableOpacity style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', marginTop: 6 }} onPress={() => { }}>
                <Image source={email_icon} style={{ width: 18, height: 13, marginEnd: 8, resizeMode: 'stretch' }}></Image>
                <Text style={{ ...fontStyles.regular, fontSize: 15, color: theme.COLORS.BLUE }}>Email</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>

        {isPeriodPicker &&
          <Dialog
            visible={true}
            onTouchOutside={() => showPeriodPicker(false)}
            overlayStyle={{ padding: 0, backgroundColor: '#00000055' }}
            dialogStyle={{
              backgroundColor: theme.COLORS.BORDER_COLOR,
              borderColor: theme.COLORS.BLUE,
              borderWidth: 1,
              borderRadius: 30,
              width: '80%',
              alignSelf: 'center'
            }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'column' }}>
                <TouchableOpacity onPress={() => { selectPeriod('Today') }}>
                  <Text style={styles.periodButtonTitle}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { selectPeriod('This week') }}>
                  <Text style={styles.periodButtonTitle}>This week</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { selectPeriod('This month') }}>
                  <Text style={styles.periodButtonTitle}>This month</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { selectPeriod('This year') }}>
                  <Text style={styles.periodButtonTitle}>This year</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => { showCalendarPicker(true) }}>
                <Icon name="calendar" size={30} color="#6563FF" />
              </TouchableOpacity>
            </View>

            <Text style={{ ...styles.periodButtonTitle, marginTop: 12 }}>Select period</Text>
            <View style={{ flexDirection: 'row', marginTop: 4 }}>
              <Text style={styles.startDateText}>{period?.from ? period.from : 'Start'}</Text>
              <Text style={{ ...styles.startDateText, marginStart: 20 }}>{period?.to ? period.to : 'End'}</Text>
            </View>

          </Dialog>
        }

        {isCalendarPicker &&
          <Dialog
            visible={true}
            overlayStyle={{ padding: 0, backgroundColor: '#00000055' }}
            onTouchOutside={() => showCalendarPicker(false)}
            dialogStyle={{
              backgroundColor: theme.COLORS.WHITE,
              borderColor: theme.COLORS.BLUE,
              borderWidth: 1,
              borderRadius: 30,
              alignSelf: 'center'
            }}>

            <CalendarPicker
              startFromMonday={true}
              allowRangeSelection={true}
              todayBackgroundColor="#f2e6ff"
              selectedDayColor="#7300e6"
              selectedDayTextColor="#FFFFFF"
              onDateChange={onDateChange}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24 }}>
              <BlueButton
                title="Cancel"
                style={{ height: 35, width: 100, marginEnd: 12 }}
                titleStyle={{ ...fontStyles.semibold, color: 'white' }}
                onPressListener={() => { showCalendarPicker(false) }}
              />

              <BlueButton
                title="Ok"
                style={{ height: 35, width: 100, backgroundColor: theme.COLORS.SUCCESS }}
                titleStyle={{ ...fontStyles.semibold, color: 'white' }}
                onPressListener={selectPeriodFromCalendar}
              />
            </View>

          </Dialog>
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
  ratingImage: {
    width: 20,
    height: 20,
    marginLeft: 2,
    resizeMode: 'contain'
  },
  bottomContainer: {
    marginTop: 2,
    width: '100%',
    backgroundColor: '#B4C9E8',
    borderColor: theme.COLORS.BORDER_COLOR,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  periodButtonTitle: {
    ...fontStyles.semibold,
    fontSize: 15,
    color: theme.COLORS.BLUE,
    marginTop: 2
  },
  startDateText: {
    width: 110,
    height: 35,
    ...fontStyles.regular,
    fontSize: 17,
    paddingHorizontal: 12,
    textAlignVertical: 'center',
    backgroundColor: 'white',
    borderWidth: 3,
    borderRadius: 8,
    borderColor: theme.COLORS.BLUE
  },
  itemContainer: {
    width: width * 0.85,
    borderWidth: 1,
    borderColor: theme.COLORS.BORDER_COLOR,
    borderRadius: 16,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 12
  },
  smallRatingImage: {
    width: 15,
    height: 15,
    marginLeft: 2,
    resizeMode: 'contain'
  },
});

export default EventReviews;