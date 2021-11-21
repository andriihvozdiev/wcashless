import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  TouchableOpacity,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Text } from 'react-native-elements';
import { Searchbar } from 'react-native-paper';
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

const { width, height } = Dimensions.get('screen');

const mexico_flag = require('../../assets/images/mexico_flag.png');
const email_icon = require('../../assets/images/email.png');
const download_icon = require('../../assets/images/download.png');
const arrow_next = require('../../assets/images/arrow_next.png');
const dropdown_icon = require('../../assets/images/dropdown.png');
const close_icon = require('../../assets/images/close.png');
const terms_privacy = require('../../assets/images/privacy.png');

const TransactionsHistory = ({
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
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(0);
  const PageSize = 50;
  const [isLoadMore, setLoadMore] = useState(false);

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
      label: 'This month',
      from: moment().startOf('month').format('YYYY-MM-DD'),
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
      if (result.data.meta?.pagination) {
        const pagination = result.data.meta?.pagination;
        if (pagination?.pageCount > pagination?.page) {
          setLoadMore(true);
        } else {
          setLoadMore(false);
        }
      } else {
        const pagination = result.data.meta;
        if (pagination?.pageCount > pagination?.page + 1) {
          setLoadMore(true);
        } else {
          setLoadMore(false);
        }
      }
      const newTransactions = result.data.data;
      if (newPeriod) {
        setAllTransactions(newTransactions);
      } else {
        setAllTransactions([...allTransactions, ...newTransactions]);
      }
      setPage(currentPage + 1);
      onChangeSearch(search);
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

  const onChangeSearch = async (query) => {
    setSearch(query);

    if (!query || query == '') {
      setTransactions(allTransactions);
    } else {
      const searchQuery = query.toLowerCase();

      const searched = allTransactions.filter(item => (
        moment(item.createdAt).format('yyyy/MM/DD HH:mm').includes(searchQuery) ||
        moment(item.createdAt).format('yyyy/MMMM/DD HH:mm').toLowerCase().includes(searchQuery) ||
        item.type.toLowerCase().includes(searchQuery) ||
        item.id.toString().padStart(6, '0').includes(searchQuery) ||
        item.amount?.toString().includes(searchQuery) ||
        item.data?.description?.toLowerCase().includes(searchQuery) ||
        item.business?.name?.toLowerCase().includes(searchQuery)
      ));
      setTransactions(searched);
    }
  }

  const loadMoreData = () => {
    fetchTransactionHistory();
  }

  const renderItem = ({ item }) => {
    var transaction = item;
    if (isAdmin && (route.params?.selectedBusiness)) {
      transaction.business = route.params?.selectedBusiness;
    }
    const transactionType = transaction?.type;

    return (
      <TouchableOpacity
        onPress={() => { navigation.navigate('TransactionDetail', { transaction }); }}
        key={transaction.createdAt}>
        <View style={{ ...styles.row, ...styles.rowItem }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.timeText} numberOfLines={1}>
              {moment(transaction.createdAt).format('yyyy/MM/DD HH:mm')}
            </Text>
            <Text style={styles.paymentIdText}>
              {transaction?.id?.toString().padStart(5, '0')}
            </Text>
          </View>
          <Image source={mexico_flag} style={styles.flagIcon} />
          <Text style={styles.currencyText}>
            MXW
          </Text>
          <Text style={((transactionType?.toLowerCase() == 'refund') || (transactionType?.toLowerCase() == 'remove wandoos')) ? { ...styles.amountText, color: theme.COLORS.ERROR } : styles.amountText}>
            {((transactionType?.toLowerCase() == 'refund') || (transactionType?.toLowerCase() == 'refund')) ? `-${transaction.amount}` : transaction.amount}
          </Text>

        </View>
      </TouchableOpacity>
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
        <Searchbar
          placeholder="Type Here..."
          onChangeText={onChangeSearch}
          value={search}
          style={commonStyles.searchbar}
          iconColor={theme.COLORS.BORDER_COLOR}
          inputStyle={commonStyles.searchbarInputStyle}
        />

        <View style={{ ...styles.row, width: '100%', marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ ...fontStyles.semibold, fontSize: 15 }}>Transactions</Text>
            <TouchableOpacity style={{ marginLeft: 8, flexDirection: 'row', alignItems: 'center' }}
              onPress={() => { showPeriodPicker(true) }}>
              <Text style={{ ...fontStyles.semibold, fontSize: 15, color: theme.COLORS.BLUE }}>{period?.label}</Text>
              <Image source={dropdown_icon} style={{ width: 12, height: 10, marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => { navigation.navigate('Analytics') }}>
              <Text style={{ ...fontStyles.semibold, fontSize: 15, color: theme.COLORS.BLUE }}>Analytics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => { showHelpDialog(true) }}>
              <Icon name="information-circle-outline" size={20} color={theme.COLORS.BLUE} />
            </TouchableOpacity>
          </View>

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
      style={{ paddingTop: 100 }}
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

      <View style={{ ...styles.row, marginTop: 20 }}>
        <Text style={{ ...fontStyles.semibold, fontSize: 15 }}>Latest</Text>
        <TouchableOpacity onPress={() => { navigation.navigate('AllTransactions') }}>
          <Text style={{ ...fontStyles.semibold, fontSize: 15, color: theme.COLORS.BLUE }}>See all</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', flex: 1 }}>
        {(!search || search == '') ?
          allTransactions.map((item) => renderItem({ item }))
          :
          transactions.map((item) => renderItem({ item }))
        }
      </View>

      {isLoadMore &&
        <BlueButton
          width={100}
          height={25}
          titleStyle={{ ...fontStyles.semibold, fontSize: 14, color: 'white' }}
          style={{ alignSelf: 'flex-end', marginLeft: 12 }}
          title="Load more"
          onPressListener={() => { loadMoreData() }}
        />
      }

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
            <Text style={{ ...fontStyles.bold, fontSize: 20 }}>
              Transactions & Payments
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => { showHelpDialog(false) }}>
              <Image source={close_icon} style={styles.closeIcon} />
            </TouchableOpacity>
          </View>

          <Text style={{ ...fontStyles.bold, fontSize: 16, marginTop: 20 }}>All your interactions are listed here.</Text>
          <Text style={{ ...fontStyles.bold, fontSize: 16, marginTop: 12 }}>They will be listed as:</Text>
          <Text style={{ ...fontStyles.regular, fontSize: 16, marginStart: 16 }}>{`\u2022  Payments`}</Text>
          <Text style={{ ...fontStyles.regular, fontSize: 16, marginStart: 16 }}>{`\u2022  Refund from a Payment`}</Text>

          <Text style={{ ...fontStyles.regular, fontSize: 15, marginTop: 12 }}>To raise an issue about a transaction. Go to your transactions & payments history.</Text>
          <Text style={{ ...fontStyles.regular, fontSize: 15 }}>Click on the detail and you can raise a support issue directly with wcashless.</Text>

          <Text style={{ ...fontStyles.regular, fontSize: 16, marginTop: 12 }}>Or Raise a Support ticket.</Text>

          <View style={{ width: '100%', borderColor: theme.COLORS.GREY_COLOR, borderWidth: 1, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 16, marginTop: 16 }}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={() => { Linking.openURL('https://www.wcashless.com/faq') }}>
              <Image source={terms_privacy} style={{ width: 20, height: 20, marginRight: 10 }}></Image>
              <Text style={{ ...fontStyles.semibold, fontSize: 15 }}>Help guides & FAQ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }} onPress={() => { }}>
              <Image source={terms_privacy} style={{ width: 20, height: 20, marginRight: 10 }}></Image>
              <Text style={{ ...fontStyles.semibold, fontSize: 15 }}>Contact wcashless support</Text>
            </TouchableOpacity>
          </View>

        </Dialog>
      }

    </BasicScreen>
  );
}

const styles = StyleSheet.create({
  blackContainer: {
    width: '100%',
    backgroundColor: theme.COLORS.BORDER_COLOR,
    borderColor: theme.COLORS.BLUE,
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowItem: {
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: theme.COLORS.GREY_COLOR,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  paymentIdText: {
    ...fontStyles.regular,
    fontSize: 15,
    textAlign: 'left',
  },
  paymentTypeText: {
    ...fontStyles.semibold,
    fontSize: 16,
    textAlign: 'left',
  },
  timeText: {
    ...fontStyles.semibold,
    fontSize: 15,
    textAlign: 'left',
    marginTop: 4
  },
  businessText: {
    ...fontStyles.regular,
    fontSize: 13,
    textAlign: 'left',
    marginTop: 4,
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

export default TransactionsHistory;