import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View, Image, ImageBackground } from 'react-native';
import { Text, Input } from 'react-native-elements';
import RNCountry from "react-native-countries";

import { businessApiService } from '../../service';
import { store } from '../../redux/Store';
import EmptyGap from '../../components/EmptyGap';
import LoadingIndicator from '../../components/LoadingIndicator';
import BasicScreen from '../../components/BasicScreen';
import { commonStyles, fontStyles } from '../../styles/styles';
import Theme from '../../constants/Theme';
import BlueButton from '../../components/BlueButton';
import theme from '../../constants/Theme';


const { width, height } = Dimensions.get('screen');

const logo = require('../../assets/images/wpay_circle_disabled.png');
const mexico_flag = require('../../assets/images/mexico_flag.png');

const PayoutScreen = ({
  navigation, route
}) => {
  const scrollViewRef = useRef();

  const [wandoOs, setWandoOs] = useState('0');
  const [amount, setAmount] = useState(0);

  const [business, setBusiness] = useState(route.params?.business ? route.params?.business : store.getState().business);
  const [businessBalance, setBusinessBalance] = useState(0);
  const [businessCountryName, setBusinessCountryName] = useState('');
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    getBalance();

    const countryNamesWithCodes = RNCountry.getCountryNamesWithCodes;
		const businessCountry = countryNamesWithCodes.find(element => (element.code == business?.country));
		setBusinessCountryName(businessCountry?.name);
  }, [])

  const getBalance = async () => {
    setLoading(true);
    const result = await businessApiService.getBusiness(business?.id);
    setLoading(false);
    if (!result.error && result.data) {
      setBusinessBalance(result.data?.wallet?.balance);
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
      <Text style={{ ...commonStyles.headerTitle, alignSelf: 'flex-start' }}>
        Payout
      </Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
        <Image source={business?.photo ? { uri: business?.photo?.url } : logo} style={styles.businessLogo} />
        <View style={styles.businessInfoContainer}>
          <View style={styles.rowItem}>
            <Text style={styles.rowTitle}>Business</Text>
            <Text style={styles.rowDescription}>{business?.name}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowTitle}>Current wandoOs total</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ ...styles.rowValue, color: Theme.COLORS.SUCCESS }}>MXW</Text>
              <Text style={{ ...styles.rowValue, color: Theme.COLORS.BLACK, marginLeft: 4 }}>{numberWithCommas(businessBalance)}</Text>
            </View>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowTitle}>Number of transactions</Text>
            <Text style={styles.rowValue}>10</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowTitle}>Local currency payout value</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ ...styles.rowValue, color: Theme.COLORS.SUCCESS }}>MXN</Text>
              <Text style={{ ...styles.rowValue, color: Theme.COLORS.BLACK, marginLeft: 4 }}>{numberWithCommas('990')}</Text>
            </View>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowTitle}>Country</Text>
            <Text style={styles.rowDescription}>{businessCountryName}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowTitle}>Location</Text>
            <Text style={styles.rowDescription}>{business?.city}</Text>
          </View>

        </View>
      </View>

      <Text style={styles.title}>Select amount from current balance</Text>

      <View style={{ ...styles.amountContainer, ...styles.amountRow, height: 60, paddingRight: 0, marginTop: 12 }}>
        <Text style={{ ...fontStyles.bold, fontSize: 17 }}>Payout wandoOs:</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
          <Image source={mexico_flag} style={styles.flagIcon} />
          <Text style={{ ...fontStyles.bold, fontSize: 18, color: theme.COLORS.SUCCESS }}>MXW</Text>
        </View>

        <Input
          containerStyle={{ flex: 1, height: 40 }}
          inputContainerStyle={{ borderBottomColor: 'transparent' }}
          inputStyle={styles.inputAmount}
          keyboardType='number-pad'
          returnKeyType='next'
          value={wandoOs}
          errorStyle={{ height: 0 }}
          onFocus={() => {
            setWandoOs('');
          }}
          onChange={(event) => {
            const amountInt = parseInt(event.nativeEvent.text.trim()) || 0;
            setWandoOs(amountInt.toString());
          }}
        />
      </View>
      <Text style={{ ...fontStyles.regular, fontSize: 13, marginLeft: 8, marginTop: 8, alignSelf: 'flex-start' }}>Exchange fee = Minimum 1,000 MXN - Max $1%</Text>


      <View style={{ ...styles.amountContainer, ...styles.amountRow, borderColor: theme.COLORS.SUCCESS, paddingVertical: 16, marginTop: 30, borderWidth: 5 }}>
        <Text style={{ ...fontStyles.bold, fontSize: 17, flex: 1 }}>Payout amount</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
          <Image source={mexico_flag} style={styles.flagIcon} />
          <Text style={{ ...fontStyles.bold, fontSize: 18 }}>MXN</Text>
        </View>
        <Text style={{ ...styles.inputAmount, color: theme.COLORS.SUCCESS, fontSize: 24, marginLeft: 16 }}>
          {amount ? numberWithCommas(amount) : '0'}
        </Text>
      </View>


      <EmptyGap />

      <BlueButton
        title='Payout'
        style={{ marginTop: 30, width: width * 0.75 }}
        onPressListener={() => { }}
      />

    </BasicScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
  },
  businessLogo: {
    width: 50,
    height: 50,
    borderRadius: 25
  },
  businessInfoContainer: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: Theme.COLORS.BORDER_COLOR,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  rowTitle: {
    ...fontStyles.semibold,
    fontSize: 14
  },
  rowDescription: {
    ...fontStyles.regular,
    fontSize: 14,
    color: Theme.COLORS.BLUE
  },
  rowValue: {
    ...fontStyles.semibold,
    fontSize: 14,
  },
  title: {
    width: '100%',
    ...fontStyles.bold,
    fontSize: 20,
    color: 'black',
    marginTop: 24,
  },
  amountContainer: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderColor: '#1A1A1A',
    borderWidth: 3,
    borderStyle: 'solid',
    borderRadius: 16,
    marginTop: 8,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagIcon: {
    width: 20,
    height: 20,
    marginRight: 2
  },
  inputAmount: {
    ...fontStyles.bold,
    fontSize: 17,
    textAlign: 'right',
    paddingTop: 0,
    paddingBottom: 0
  },
});

export default PayoutScreen;