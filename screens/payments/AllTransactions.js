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
import { Searchbar } from 'react-native-paper';
import moment from 'moment';

import { store } from '../../redux/Store';
import { logoutUser } from '../../redux/actions/UserActions';
import LoadingIndicator from '../../components/LoadingIndicator';
import BasicScreen from '../../components/BasicScreen';
import { businessApiService } from '../../service';
import { commonStyles, fontStyles } from '../../styles/styles';
import theme from '../../constants/Theme';

const { width, height } = Dimensions.get('screen');

const mexico_flag = require('../../assets/images/mexico_flag.png');
const email_icon = require('../../assets/images/email.png');
const download_icon = require('../../assets/images/download.png');
const arrow_next = require('../../assets/images/arrow_next.png');

const AllTransactions = ({
  navigation, route
}) => {
  const scrollViewRef = useRef();

  const [isAdmin, setAdmin] = useState(store.getState().user?.role?.type == 'superadmin');
  const [business, setBusiness] = useState(route.params?.selectedBusiness ? route.params?.selectedBusiness : store.getState().business);

  const [isLoading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [search, setSearch] = useState('');

  const [page, setPage] = useState(0);
  const PageSize = 50;


  useEffect(() => {
    setPage(1);
    setTransactions([]);
    setAllTransactions([]);

    fetchTransactionHistory();
  }, []);

  const fetchTransactionHistory = async () => {
    setLoading(true);
    var result;
    if (isAdmin && !(route.params?.selectedBusiness)) {
      result = await businessApiService.getTransactions(page + 1, PageSize);
    } else {
      result = await businessApiService.getBusinessTransactions(business?.id, page, PageSize);
    }

    setLoading(false);

    if (!result.error && result.data) {
      const newTransactions = result.data.data;
      setAllTransactions([...allTransactions, ...newTransactions]);
      setPage(page + 1);
      onChangeSearch(search);
    } else {
      if (result.data?.error?.status == 401) {
        showAuthErrorAlert();
      }
    }
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
        <View style={styles.rowItem}>
          <View style={{ flex: 1, marginStart: 12 }}>
            <Text style={styles.timeText} numberOfLines={1}>
              {moment(transaction.createdAt).format('yyyy/MM/DD HH:mm')}
            </Text>
            <Text style={styles.paymentIdText}>
              {transaction?.id?.toString().padStart(5, '0')}
            </Text>
            {/* <Text style={styles.paymentTypeText} numberOfLines={1}>
              {transaction.type}
            </Text>

            {(isAdmin && !(route.params?.selectedBusiness)) &&
              <Text style={styles.businessText} numberOfLines={1}>
                {transaction?.business?.name ? transaction?.business?.name : transaction.data?.to}
              </Text>
            }
            {!isAdmin &&
              <Text style={styles.businessText} numberOfLines={1}>
                {transaction.author?.firstName} {transaction.author?.lastName}
              </Text>
            } */}
          </View>
          <Image source={mexico_flag} style={styles.arrowIconImage} />
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

  return (
    <BasicScreen
      scrollContainerStyle={styles.scrollView}
      scrollViewRef={scrollViewRef}
      lightBg
      disabledScroll={true}
    >

      {isLoading &&
        <LoadingIndicator />
      }

      <Searchbar
        placeholder="Type Here..."
        onChangeText={onChangeSearch}
        value={search}
        style={commonStyles.searchbar}
        iconColor={theme.COLORS.BORDER_COLOR}
        inputStyle={commonStyles.searchbarInputStyle}
      />

      <FlatList
        data={(!search || search == '') ? allTransactions : transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={{ flex: 1, marginTop: 20 }}
        onEndReachedThreshold={0.2}
        onEndReached={loadMoreData}
      />

      <View style={styles.bottomContainer}>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
					<Text style={{ ...fontStyles.regular, fontSize: 15 }}>Choose an option</Text>

					<View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
						<TouchableOpacity style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center' }} onPress={() => { }}>
							<Image source={download_icon} style={{ width: 15, height: 15, marginEnd: 8 }}></Image>
							<Text style={{ ...fontStyles.regular, fontSize: 15, color: theme.COLORS.BLUE }}>Download</Text>
						</TouchableOpacity>

						<TouchableOpacity style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', marginTop: 8 }} onPress={() => { }}>
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

    </BasicScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  businessNameText: {
    ...fontStyles.semibold,
    fontSize: 20,
    marginBottom: 10
  },
  listTitleFont: {
    ...fontStyles.semibold,
    fontSize: 17,
  },
  rowItem: {
    width: width * 0.85,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  arrowIconImage: {
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
		marginTop: 2,
		width: '100%',
		backgroundColor: '#B4C9E8',
		borderColor: theme.COLORS.BORDER_COLOR,
		borderWidth: 1,
		borderRadius: 16,
		paddingHorizontal: 12,
		paddingVertical: 8
	},
});

export default AllTransactions;