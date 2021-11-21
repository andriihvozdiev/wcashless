import React, { useState, useEffect, useRef } from 'react';
import {
  View, Image, StyleSheet, Dimensions, TouchableOpacity
} from 'react-native';
import { Input, Text } from 'react-native-elements';
import moment from 'moment';
import { Dialog } from 'react-native-simple-dialogs';
import { store } from '../../redux/Store';

import EmptyGap from '../../components/EmptyGap';
import BasicScreen from '../../components/BasicScreen';
import LoadingIndicator from '../../components/LoadingIndicator';
import { businessApiService } from '../../service';
import { fontStyles } from '../../styles/styles';
import BlueButton from '../../components/BlueButton';
import theme from '../../constants/Theme';

const { width, height } = Dimensions.get('screen');

const mexico_flag = require('../../assets/images/mexico_flag.png');
const cardBg = require('../../assets/card_bg.png');
const logo = require('../../assets/logo/wc_white_w.png');
const cardChip = require('../../assets/wc_chip.png');
const wpay = require('../../assets/logo/wpay_white_w.png');
const close_icon = require('../../assets/images/close.png');

const RefundByEmail = ({
  navigation, route, wandUser
}) => {

  const scrollViewRef = useRef();

  const [businessUser, setBusinessUser] = useState(store.getState().user?.account);
  const [business, setBusiness] = useState(store.getState().business);

  const [businessOwner, setBusinessOwner] = useState();
  const [user, setUser] = useState(route.params.user);
  const [status, setStatus] = useState('normal');
  const [isUpdating, setUpdating] = useState(false);
  const [amount, setAmount] = useState('0');
  const [businessWallet, setBusinessWallet] = useState();
  const [userBalance, setUserBalance] = useState(0);
  const [reason, setReason] = useState('');

  useEffect(() => {
    getBusinessBalance();
  }, []);

  const getBusinessBalance = async () => {
    const businessResult = await businessApiService.getBusiness(business?.id);
    if (businessResult.error || !businessResult.data) {
      setReason('cannot find business');
      setUpdating(false);
      return;
    }
    setBusinessWallet(businessResult.data.wallet);
    const businessMembers = businessResult.data.business_members;
    const owner = businessMembers.find(businessMember => businessMember.role === 'Owner');
    setBusinessOwner(owner);
  }

  const refund = async () => {
    if (!amount) {
      return;
    }
    setUpdating(true);

    if (businessWallet.balance < parseInt(amount)) {
      showError();
      setReason(`insufficient wandoO balance.`);
      setUpdating(false);
      return;
    }

    const params = {
      from: businessWallet?.id,
      to: user.wallet?.id,
      amount: amount,
      type: 'refund',
      data: {
        description: `${businessUser?.email} refunded ${amount} wandoOs to ${user?.email}`,
        amount: parseInt(amount),
        type: 'Email',
        from: businessUser?.email,
        to: user?.email,
      },
      // site: ''
    };


    const result = await businessApiService.refundPayment(params);
    if (result.error || !result.data) {
      showError();
      setReason(result.data?.error?.message);
      setUpdating(false);
      return;
    }

    setUserBalance(result.data?.data?.transaction?.toAccount?.wallet?.balance);

    const businessResult = await businessApiService.getBusiness(business?.id);
    if (businessResult.error || !businessResult.data) {
      setReason('cannot find business');
      setUpdating(false);
      return;
    }
    const business_wallet = businessResult.data.wallet;
    setBusinessWallet(business_wallet);

    showCompleted();
    setUpdating(false);

  }

  const showError = () => {
    setStatus('error');
  }

  const showCompleted = () => {
    setStatus('success');
  }

  const numberWithCommas = (x) => {
    if (x == undefined || x == '') return '0';
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return (

    <BasicScreen
      scrollViewRef={scrollViewRef}
    >
      {isUpdating &&
        <LoadingIndicator />
      }

      <View style={{ alignItems: 'center', marginTop: 20 }}>

        <View style={styles.cardContainer}>
          <Image source={cardBg} style={styles.cardBgImage}></Image>
          <Image source={logo} style={styles.cardLogoImage}></Image>
          <Image source={cardChip} style={styles.cardChipImage}></Image>
          <View style={styles.balanceRow}>
            <Text style={styles.subTitle}>{business?.name}</Text>
          </View>

          <View style={styles.userRow}>
            <Text style={styles.memberTitle}>email: </Text>
            <Text style={{ ...styles.memberDescription, marginLeft: 30 }}>{businessUser?.email}</Text>
          </View>
          <View style={styles.wristbandIdRow}>
            <Text style={styles.memberTitle}>wandoOs: </Text>
            <Text style={{ ...styles.memberDescription, marginLeft: 36 }}>{businessWallet?.balance}</Text>
          </View>
          <View style={styles.memberIdRow}>
            <Text style={styles.memberTitle}>member ID: </Text>
            <Text style={{ ...styles.memberDescription, marginLeft: 28 }}>{businessUser?.id}</Text>
          </View>
          <View style={styles.memberDateRow}>
            <Text style={styles.memberTitle}>member since: </Text>
            <Text style={{ ...styles.memberDescription, marginLeft: 6 }}>{moment(businessUser?.createdAt).format('MMM Do YYYY')}</Text>
          </View>

          <Image source={wpay} style={styles.wpayIcon}></Image>
        </View>


        <View style={{ ...styles.amountContainer, ...styles.amountRow, paddingRight: 0, marginTop: 20 }}>
          <Text style={{ ...fontStyles.bold, fontSize: 17 }}>Total amount</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 24 }}>
            <Image source={mexico_flag} style={styles.flagIcon} />
            <Text style={{ ...fontStyles.bold, fontSize: 18 }}>MXW</Text>
          </View>

          <Input
            containerStyle={{ flex: 1, height: 40 }}
            inputContainerStyle={{ borderBottomColor: 'transparent' }}
            inputStyle={styles.inputAmount}
            keyboardType='number-pad'
            returnKeyType='next'
            value={amount}
            errorStyle={{ height: 0 }}
            onFocus={() => {
              setAmount('');
            }}
            onChange={(event) => {
              const amountInt = parseInt(event.nativeEvent.text.trim()) || 0;
              setAmount(amountInt.toString());
            }}
          />
        </View>

        <EmptyGap />

        <BlueButton
          title="Refund wandoOs"
          style={{ marginTop: 20 }}
          onPressListener={refund} />

      </View>

      {status === 'success' &&
        <Dialog
          visible={true}
          overlayStyle={{ padding: 0 }}
          dialogStyle={{ backgroundColor: theme.COLORS.SUCCESS, borderColor: 'white', borderWidth: 1, borderRadius: 50, marginLeft: 0, marginRight: 0 }}>

          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ ...fontStyles.bold, fontSize: 28, color: 'white', alignSelf: 'flex-start', marginLeft: 8 }}>
                Refund success
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => { navigation.goBack(); }}>
                <Image source={close_icon} style={styles.closeIcon} />
              </TouchableOpacity>
            </View>

            <View style={{ ...styles.amountContainer, ...styles.amountRow, marginTop: 20 }}>
              <Text style={{ ...fontStyles.bold, fontSize: 18 }}>Refund amount</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
                <Image source={mexico_flag} style={styles.flagIcon} />
                <Text style={{ ...fontStyles.bold, fontSize: 18 }}>MXW</Text>
              </View>
              <Text style={{ ...fontStyles.bold, flex: 1, fontSize: 24, color: theme.COLORS.SUCCESS, marginLeft: 12, textAlign: 'right' }}>
                {numberWithCommas(amount)}
              </Text>
            </View>

            <View style={styles.cardContainer}>
              <Image source={cardBg} style={styles.cardBgImage}></Image>
              <Image source={logo} style={styles.cardLogoImage}></Image>
              <Image source={cardChip} style={styles.cardChipImage}></Image>
              <View style={styles.balanceRow}>
                <Text style={styles.subTitle}>wandoO balance: </Text>
                <Text style={{ ...styles.subTitle, marginLeft: 8 }}>{userBalance}</Text>
              </View>

              <View style={{ ...styles.userRow, top: 120 }}>
                <Text style={styles.memberTitle}>user: </Text>
                <Text style={{ ...styles.memberDescription, marginLeft: 30 }}>{user?.email}</Text>
              </View>
              <View style={styles.memberIdRow}>
                <Text style={styles.memberTitle}>member ID: </Text>
                <Text style={{ ...styles.memberDescription, marginLeft: 28 }}>{user?.id}</Text>
              </View>
              <View style={styles.memberDateRow}>
                <Text style={styles.memberTitle}>member since: </Text>
                <Text style={{ ...styles.memberDescription, marginLeft: 6 }}>{moment(user?.registerdate).format('MMM Do YYYY')}</Text>
              </View>

              <Image source={wpay} style={styles.wpayIcon}></Image>
            </View>

            <BlueButton
              title='Back'
              onPressListener={() => { navigation.goBack(); }}
              width={width * 0.75}
              style={{ marginTop: 30 }}
            />
          </View>
        </Dialog>
      }

      {status === 'error' &&
        <Dialog
          visible={true}
          overlayStyle={{ padding: 0 }}
          dialogStyle={{ backgroundColor: theme.COLORS.ERROR, borderColor: 'white', borderWidth: 1, borderRadius: 50, marginLeft: 0, marginRight: 0 }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ ...fontStyles.bold, fontSize: 28, color: 'white', alignSelf: 'flex-start', marginLeft: 8 }}>
                Refund fail
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => {
                setStatus('normal');
                setAmount('0');
              }}>
                <Image source={close_icon} style={styles.closeIcon} />
              </TouchableOpacity>
            </View>

            <View style={{ ...styles.amountContainer, ...styles.amountRow, marginTop: 20 }}>
              <Text style={{ ...fontStyles.bold, fontSize: 18 }}>Refund amount</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
                <Image source={mexico_flag} style={styles.flagIcon} />
                <Text style={{ ...fontStyles.bold, fontSize: 18 }}>MXW</Text>
              </View>
              <Text style={{ ...fontStyles.bold, flex: 1, fontSize: 24, color: theme.COLORS.ERROR, marginLeft: 12, textAlign: 'right' }}>
                {numberWithCommas(amount)}
              </Text>
            </View>

            <View style={styles.cardContainer}>
              <Image source={cardBg} style={styles.cardBgImage}></Image>
              <Image source={logo} style={styles.cardLogoImage}></Image>
              <Image source={cardChip} style={styles.cardChipImage}></Image>
              <View style={styles.balanceRow}>
                <Text style={styles.subTitle}>{business?.name}</Text>
              </View>

              <View style={styles.userRow}>
                <Text style={styles.memberTitle}>email: </Text>
                <Text style={{ ...styles.memberDescription, marginLeft: 30 }}>{businessUser?.email}</Text>
              </View>
              <View style={styles.wristbandIdRow}>
                <Text style={styles.memberTitle}>wandoOs: </Text>
                <Text style={{ ...styles.memberDescription, marginLeft: 38 }}>{businessWallet?.balance}</Text>
              </View>
              <View style={styles.memberIdRow}>
                <Text style={styles.memberTitle}>member ID: </Text>
                <Text style={{ ...styles.memberDescription, marginLeft: 28 }}>{businessUser?.id}</Text>
              </View>
              <View style={styles.memberDateRow}>
                <Text style={{ ...styles.memberTitle }}>member since: </Text>
                <Text style={{ ...styles.memberDescription, marginLeft: 6 }}>{moment(businessUser?.createdAt).format('MMM Do YYYY')}</Text>
              </View>

              <Image source={wpay} style={styles.wpayIcon}></Image>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 16 }}>
              <Text style={{ ...fontStyles.semibold, fontSize: 18, color: 'white' }}>Reason: </Text>
              <Text style={{ ...fontStyles.regular, fontSize: 17, color: 'white', marginLeft: 12, flex: 1 }}>{reason}</Text>
            </View>

            <BlueButton
              title='Try again'
              onPressListener={() => {
                setStatus('normal');
                setAmount('0');
              }}
              width={width * 0.75}
              style={{ marginTop: 30 }}
            />
          </View>
        </Dialog>
      }
    </BasicScreen>

  );
}

const styles = StyleSheet.create({
  amountContainer: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderColor: theme.COLORS.ERROR,
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
    fontSize: 22,
    color: theme.COLORS.ERROR,
    textAlign: 'right',
    paddingTop: 0,
    paddingBottom: 0
  },
  inputErrorStyle: {
    height: 0
  },
  cardContainer: {
    position: 'relative',
    width: 300,
    height: 190,
    marginTop: 12,
    marginBottom: 20
  },
  cardBgImage: {
    width: 300,
    height: 190,
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
    top: 52,
    left: 18,
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  balanceRow: {
    position: 'absolute',
    top: 60,
    left: 70,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center'
  },
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white'
  },
  userRow: {
    position: 'absolute',
    top: 100,
    left: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  wristbandIdRow: {
    position: 'absolute',
    top: 120,
    left: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  memberIdRow: {
    position: 'absolute',
    top: 140,
    left: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  memberTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white'
  },
  memberDescription: {
    fontSize: 12,
    color: 'white'
  },
  memberDateRow: {
    position: 'absolute',
    top: 160,
    left: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  wpayIcon: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 45,
    height: 45,
    resizeMode: 'contain'
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  closeIcon: {
    width: 15,
    height: 15
  },
});

export default RefundByEmail;