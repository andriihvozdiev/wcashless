import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View, Image, TouchableOpacity, FlatList, Linking } from 'react-native';
import { Text, Input } from 'react-native-elements';
import moment from 'moment';
import { businessApiService } from '../../service';
import { store } from '../../redux/Store';
import { Searchbar } from 'react-native-paper';

import LoadingIndicator from '../../components/LoadingIndicator';
import BasicScreen from '../../components/BasicScreen';
import { commonStyles, fontStyles } from '../../styles/styles';
import theme from '../../constants/Theme';

const { width, height } = Dimensions.get('screen');

const mexico_flag = require('../../assets/images/mexico_flag.png');
const email_icon = require('../../assets/images/email.png');
const download_icon = require('../../assets/images/download.png');
const arrow_next = require('../../assets/images/arrow_next.png');

const PayoutHistory = ({
  navigation, route
}) => {
  const scrollViewRef = useRef();

  const [isLoading, setLoading] = useState(false);
  const [payouts, setPayouts] = useState([]);
  const [allPayouts, setAllPayouts] = useState([1]);
  const [search, setSearch] = useState('');

  const [isAdmin, setAdmin] = useState(store.getState().user?.role?.type == 'superadmin');
  const [business, setBusiness] = useState(route.params?.selectedBusiness ? route.params?.selectedBusiness : store.getState().business);

  useEffect(() => {
  }, []);

  const fetchPayoutHistory = async () => {
    // setLoading(true);
    // var result;
    // if (isAdmin && !(route.params?.selectedBusiness)) {
    //   result = await businessApiService.getTransactions(page + 1, PageSize);
    // } else {
    //   result = await businessApiService.getBusinessTransactions(business?.id, page, PageSize);
    // }

    // setLoading(false);

    // if (!result.error && result.data) {
    //   const newTransactions = result.data.data;
    //   setAllTransactions([...allTransactions, ...newTransactions]);
    //   setPage(page + 1);
    //   onChangeSearch(search);
    // } else {
    //   if (result.data?.error?.status == 401) {
    //     showAuthErrorAlert();
    //   }
    // }
  }

  const loadMoreData = () => {
    fetchPayoutHistory();
  }

  const renderItem = ({ item }) => {
    var payout = item;
    // if (isAdmin && (route.params?.selectedBusiness)) {
    //   payout.business = route.params?.selectedBusiness;
    // }

    return (
      <TouchableOpacity
        onPress={() => { }}
        key={payout.id}
        style={styles.rowItem}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <View style={{ flex: 1 }}>
            <Text style={styles.timeText} numberOfLines={1}>
              2022/11/04 17:04
              {/* {moment(payout.createdAt).format('yyyy/MM/DD HH:mm')} */}
            </Text>
            <Text style={styles.paymentIdText}>
              123456
              {/* {payout?.id?.toString().padStart(5, '0')} */}
            </Text>
            
          </View>
          <Text style={styles.currencyText}>
            MXW
          </Text>
          <Text style={styles.amountText}>
            190
            {/* {payout.amount} */}
          </Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={{ flex: 1, ...fontStyles.semibold, fontSize: 17 }}>Payout amount</Text>
          <Image source={mexico_flag} style={styles.arrowIconImage} />
          <Text style={styles.payoutAmount}>
            $190
            {/* {payout.amount} */}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  const onChangeSearch = async (query) => {
    setSearch(query);

    if (!query || query == '') {
      setPayouts(allPayouts);
    } else {
      const searchQuery = query.toLowerCase();

      const searched = allPayouts.filter(item => (
        // moment(item.createdAt).format('yyyy/MM/DD HH:mm').includes(searchQuery) ||
        // moment(item.createdAt).format('yyyy/MMMM/DD HH:mm').toLowerCase().includes(searchQuery) ||
        // item.type.toLowerCase().includes(searchQuery) ||
        // item.id.toString().padStart(6, '0').includes(searchQuery) ||
        // item.amount?.toString().includes(searchQuery) ||
        // item.data?.description?.toLowerCase().includes(searchQuery) ||
        item.business?.name?.toLowerCase().includes(searchQuery)
      ));
      setPayouts(searched);
    }
  }

  const numberWithCommas = (x) => {
    if (x == undefined) return '0';
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return (
    <BasicScreen
      scrollContainerStyle={styles.scrollView}
      scrollViewRef={scrollViewRef}
    >

      {isLoading &&
        <LoadingIndicator />
      }

      <Searchbar
        placeholder="Search..."
        onChangeText={onChangeSearch}
        value={search}
        style={commonStyles.searchbar}
        iconColor={theme.COLORS.BORDER_COLOR}
        inputStyle={commonStyles.searchbarInputStyle}
      />

      <FlatList
        data={(!search || search == '') ? allPayouts : payouts}
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

    </BasicScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
  },
  rowItem: {
    width: width * 0.85,
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: theme.COLORS.GREY_COLOR,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  timeText: {
    ...fontStyles.semibold,
    fontSize: 13,
    textAlign: 'left',
  },
  paymentIdText: {
    ...fontStyles.regular,
    fontSize: 13,
    textAlign: 'left',
  },
  arrowIconImage: {
    width: 20,
    height: 20,
    marginLeft: 8
  },
  currencyText: {
    ...fontStyles.semibold,
    fontSize: 14,
    marginLeft: 6,
    color: theme.COLORS.SUCCESS
  },
  amountText: {
    ...fontStyles.semibold,
    fontSize: 14,
    marginLeft: 8,
    textAlign: 'right'
  },
  payoutAmount: {
    ...fontStyles.semibold,
    fontSize: 17,
    marginLeft: 4
  },
  bottomContainer: {
		marginTop: 30,
		width: '100%',
		backgroundColor: '#B4C9E8',
		borderColor: theme.COLORS.BORDER_COLOR,
		borderWidth: 1,
		borderRadius: 16,
		paddingHorizontal: 12,
		paddingVertical: 8
	},
});

export default PayoutHistory;