import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
  FlatList
} from 'react-native';
import { Text } from 'react-native-elements';
import moment from 'moment';
import { Dialog } from 'react-native-simple-dialogs';
import Flag from 'react-native-round-flags';
import CalendarPicker from 'react-native-calendar-picker';
import Icon from 'react-native-vector-icons/Ionicons';

import { store } from '../../redux/Store';
import { logoutUser } from '../../redux/actions/UserActions';
import LoadingIndicator from '../../components/LoadingIndicator';
import BasicScreen from '../../components/BasicScreen';
import BlueButton from '../../components/BlueButton';
import { businessApiService } from '../../service';
import { commonStyles, fontStyles } from '../../styles/styles';
import theme from '../../constants/Theme';
import EmptyGap from '../../components/EmptyGap';

const { width, height } = Dimensions.get('screen');

const mexico_flag = require('../../assets/images/mexico_flag.png');
const email_icon = require('../../assets/images/email.png');
const download_icon = require('../../assets/images/download.png');
const arrow_next = require('../../assets/images/arrow_next.png');
const dropdown_icon = require('../../assets/images/dropdown.png');
const close_icon = require('../../assets/images/close.png');

const Analytics = ({
  navigation, route
}) => {
  const scrollViewRef = useRef();

  const [isAdmin, setAdmin] = useState(store.getState().user?.role?.type == 'superadmin');
  const [business, setBusiness] = useState(route.params?.selectedBusiness ? route.params?.selectedBusiness : store.getState().business);

  const [isLoading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    totalWandoOs: 0,
    numberOfTransactions: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);

  const [page, setPage] = useState(0);
  const PageSize = 50;

  const [period, setPeriod] = useState();
  const [isPeriodPicker, showPeriodPicker] = useState(false);
  const [isCalendarPicker, showCalendarPicker] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState();
  const [selectedEndDate, setSelectedEndDate] = useState();
  const [isHelpDialog, showHelpDialog] = useState(false);

  useEffect(() => {
    setPage(1);
    setTransactions([]);
    setAllTransactions([]);

    const initialPeriod = {
      label: 'Today',
      from: moment().format('YYYY-MM-DD'),
      to: null
    };
    setPeriod(initialPeriod);

    fetchTransactionHistory(initialPeriod);
  }, []);

  const fetchTransactionHistory = async (newPeriod = null) => {
    setLoading(true);

    var from = period?.from;
    var to = period?.to;
    var currentPage = page;

    if (newPeriod) {
      from = newPeriod?.from;
      to = newPeriod?.to;
      currentPage = 0;

      setPage(0);
      setTransactions([]);
      setAllTransactions([]);
    }

    var result, analyticsResult;
    if (isAdmin && !(route.params?.selectedBusiness)) {
      result = await businessApiService.getTransactions(currentPage + 1, PageSize, from, to);
    } else {
      analyticsResult = await businessApiService.getStatistics(business?.id, from, to);
      result = await businessApiService.getBusinessTransactions(business?.id, currentPage, PageSize, from, to);
    }

    calculateAnalytics(analyticsResult);

    setLoading(false);

    if (!result.error && result.data) {
      const newTransactions = result.data.data;
      if (newPeriod) {
        setAllTransactions(newTransactions);
      } else {
        setAllTransactions([...allTransactions, ...newTransactions]);
      }
      setPage(currentPage + 1);
    } else {
      if (result.data?.error?.status == 401) {
        showAuthErrorAlert();
      }
    }
  }

  const calculateAnalytics = async (analyticsResult) => {
    const statistics = analyticsResult?.data?.data;

    var sum = 0;
    var count = 0;
    statistics?.forEach(element => {
      const analytics = element.analytics;

      if (analytics?.length > 0) {
        analytics.map((statistic) => {
          if (statistic?.type === 'payment') {
            sum += statistic?.sum;
            count += parseInt(statistic?.count);
          }
          if (statistic?.type === 'refund') {
            sum -= statistic?.sum;
            count += parseInt(statistic?.count);
          }
          if (statistic?.type === 'topup') {
            sum += statistic?.sum;
            count += parseInt(statistic?.count);
          }
        });
      }
    });

    setAnalytics({
      totalWandoOs: sum,
      numberOfTransactions: count
    });

  }

  const showAuthErrorAlert = () => {
    Alert.alert(
      'Invalid User',
      'You account session has been expired. Please login again',
      [
        {
          text: "ok",
          onPress: () => {
            logoutUser();
            navigation.replace('Login');
          }
        }
      ],
      { cancelable: true }
    );
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
    fetchTransactionHistory(newPeriod);
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
    fetchTransactionHistory(newPeriod);
  }

  const buildHeader = () => {
    return (
      <View style={{ width: '100%', flexDirection: 'column', alignItems: 'center', paddingHorizontal: 20 }}>

        <Text style={{ ...commonStyles.headerTitle, alignSelf: 'flex-start' }}>Analytics</Text>

        <View style={{ ...styles.row, width: '100%', marginTop: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ ...fontStyles.semibold, fontSize: 15 }}>Transactions</Text>
            <TouchableOpacity style={{ marginLeft: 8, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => { showPeriodPicker(true) }}>
              <Text style={{ ...fontStyles.semibold, fontSize: 15, color: theme.COLORS.BLUE }}>{period?.label}</Text>
              <Image source={dropdown_icon} style={{ width: 12, height: 10, marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => { showHelpDialog(true) }}>
            <Icon name="information-circle-outline" size={20} color={theme.COLORS.BLUE} />
          </TouchableOpacity>
        </View>
        {(period?.label == 'Select period') &&
          <View style={{ ...styles.row, marginTop: 8 }}>
            <Text style={{ ...fontStyles.semibold, fontSize: 15, color: theme.COLORS.BLUE }}>
              {period?.from}
            </Text>
            <Text style={{ ...fontStyles.semibold, fontSize: 15, color: theme.COLORS.BLUE }}>
              {period?.to}
            </Text>
          </View>
        }
      </View>
    )
  }

  return (
    <BasicScreen
      scrollViewRef={scrollViewRef}
      style={{ paddingTop: 70 }}
      header={buildHeader()}
    >

      {isLoading &&
        <LoadingIndicator />
      }

      <View style={{ ...styles.blackContainer, marginTop: 12 }}>
        <View style={{ ...styles.row, width: '100%' }}>
          <Text style={{ ...fontStyles.semibold, fontSize: 13, color: 'white', flex: 1 }}>wandoOs total</Text>
          <Flag code='MX' style={{ ...styles.flagIcon, width: 15, height: 15 }} />
          <Text style={{ ...styles.currencyText, fontSize: 16 }}>
            MXW
          </Text>
          <Text style={{ ...styles.amountText, color: 'white', fontSize: 16 }}>
            {analytics?.totalWandoOs}
          </Text>
        </View>

        <View style={{ ...styles.row, width: '100%', marginTop: 4 }}>
          <Text style={{ ...fontStyles.semibold, fontSize: 13, color: 'white', flex: 1 }}>Transaction & value</Text>
          <Flag code='US' style={{ ...styles.flagIcon, width: 15, height: 15 }} />
          <Text style={{ ...styles.currencyText, fontSize: 16 }}>
            My local $
          </Text>
          <Text style={{ ...styles.amountText, color: 'white', fontSize: 16 }}>
            $10
          </Text>
        </View>
        <View style={{ ...styles.row, width: '100%', marginTop: 4 }}>
          <Text style={{ ...fontStyles.semibold, fontSize: 13, color: 'white', flex: 1 }}>Number of transactions</Text>
          <Text style={{ ...styles.amountText, color: 'white', fontSize: 16 }}>
            {analytics?.numberOfTransactions}
          </Text>
        </View>
      </View>

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

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <Text style={{ ...fontStyles.regular, fontSize: 15 }}>Report an issue</Text>
          <TouchableOpacity style={{ paddingVertical: 6, paddingStart: 10 }} onPress={() => Linking.openURL('https://wcashless.com/support-ticket')}>
            <Image source={arrow_next} style={{ width: 12, height: 12 }}></Image>
          </TouchableOpacity>
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

      {isHelpDialog &&
        <Dialog
          visible={true}
          overlayStyle={{ padding: 0, backgroundColor: '#00000055' }}
          onTouchOutside={() => { showHelpDialog(false) }}
          dialogStyle={{
            width: '90%',
            backgroundColor: theme.COLORS.WHITE,
            borderColor: theme.COLORS.SUCCESS,
            borderWidth: 2,
            borderRadius: 30,
            alignSelf: 'center',
            paddingVertical: 20
          }}>

          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ ...fontStyles.bold, fontSize: 22 }}>
              About analytics
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => { showHelpDialog(false) }}>
              <Image source={close_icon} style={styles.closeIcon} />
            </TouchableOpacity>
          </View>

          <Text style={{ ...fontStyles.semibold, fontSize: 16, marginTop: 20 }}>
            Track your sales performance.
          </Text>
          <Text style={{ ...fontStyles.semibold, fontSize: 16, marginTop: 4 }}>
            View sales history via Transaction volume, wandoOs total.
          </Text>

          <Text style={{ ...fontStyles.semibold, fontSize: 16, marginTop: 12 }}>Use Targets and compare sales periods.</Text>
          <Text style={{ ...fontStyles.semibold, fontSize: 16, marginTop: 12 }}>You can also track your highest spending and most loyal customers and engage with them directly through the messenger.</Text>

        </Dialog>
      }

    </BasicScreen>
  );
}

const styles = StyleSheet.create({
  blackContainer: {
    width: width * 0.85,
    backgroundColor: theme.COLORS.BORDER_COLOR,
    borderColor: theme.COLORS.BLUE,
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  row: {
    width: width * 0.85,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flagIcon: {
    width: 25,
    height: 25,
    marginLeft: 8
  },
  currencyText: {
    ...fontStyles.regular,
    fontSize: 17,
    marginLeft: 6,
    color: theme.COLORS.SUCCESS
  },
  amountText: {
    ...fontStyles.semibold,
    fontSize: 18,
    width: 40,
    marginLeft: 8,
    textAlign: 'right'
  },
  bottomContainer: {
    marginTop: 20,
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
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  closeIcon: {
    width: 15,
    height: 15
  },
});

export default Analytics;