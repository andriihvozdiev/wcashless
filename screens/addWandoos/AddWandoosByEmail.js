import React, { useState, useEffect, useRef } from 'react';
import {
  View, Image, StyleSheet, Dimensions, TouchableOpacity
} from 'react-native';
import { Input, Text } from 'react-native-elements';
import { Dialog } from 'react-native-simple-dialogs';
import moment from 'moment';
import { store } from '../../redux/Store';

import EmptyGap from '../../components/EmptyGap';
import BasicScreen from '../../components/BasicScreen';
import LoadingIndicator from '../../components/LoadingIndicator';
import { businessApiService } from '../../service';
import { fontStyles } from '../../styles/styles';
import BlueButton from '../../components/BlueButton';
import theme from '../../constants/Theme';

const { width, height } = Dimensions.get('screen');

const cardBg = require('../../assets/card_bg.png');
const logo = require('../../assets/logo/wc_white_w.png');
const cardChip = require('../../assets/wc_chip.png');
const wpay = require('../../assets/logo/wpay_white_w.png');
const mexico_flag = require('../../assets/images/mexico_flag.png');
const close_icon = require('../../assets/images/close.png');

const AddWandoosByEmail = ({
  navigation, route
}) => {

  const scrollViewRef = useRef();

  const [businessAccount, setBusinessAccount] = useState(store.getState().user?.account);

  const [user, setUser] = useState(route.params.user);
  const [status, setStatus] = useState('normal');
  const [isUpdating, setUpdating] = useState(false);
  const [amount, setAmount] = useState('0');
  const [totalBalance, setTotalBalance] = useState(0);
  const [reason, setReason] = useState('');
  const [role, setRole] = useState('Super Admin');

  useEffect(() => {
    if (store.getState().user?.role?.type == 'superadmin') {
      setRole('Super Admin');
    } else {
      setRole(store.getState().role?.role);
    }

    setTotalBalance(route.params?.user?.wallet?.balance);

  }, []);

  const addWandoos = async () => {
    if (!amount || parseInt(amount) == 0) {
      return;
    }
    setUpdating(true);

    const result = await businessApiService.addBalance({
      wallet: user?.wallet?.id,
      amount: parseInt(amount),
      body: {
        description: `${businessAccount?.email} added ${amount} wandoOs to ${user?.email} manually`,
        amount: parseInt(amount),
        type: 'Email',
        to: user?.email
      },
    });

    if (result.error) {
      showError(result.data?.error?.message);
      setUpdating(false);
      return;
    }

    setTotalBalance(result.data?.data?.transaction?.toAccount?.wallet?.balance || 0)

    showCompleted();
    setUpdating(false);
  }

  const showError = (message) => {
    setStatus('error');
    setReason(message);
  }

  const showCompleted = () => {
    setStatus('success');
  }

  const numberWithCommas = (x) => {
    if (x == undefined || x == '') return '0';
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const refresh = () => {
    setStatus('normal');
    setAmount('0');
  }

  const showTravelerInfo = () => (
    <View style={styles.cardContainer}>
      <Image source={cardBg} style={styles.cardBgImage}></Image>
      <Image source={logo} style={styles.cardLogoImage}></Image>
      <Image source={cardChip} style={styles.cardChipImage}></Image>
      <View style={styles.balanceRow}>
        <Text style={styles.subTitle}>{user?.firstName} {user?.lastName}</Text>
      </View>

      <View style={styles.userRow}>
        <Text style={styles.memberTitle}>email: </Text>
        <Text style={{ ...styles.memberDescription, marginLeft: 24 }}>{user?.email}</Text>
      </View>
      <View style={styles.wristbandIdRow}>
        <Text style={styles.memberTitle}>wandoOs: </Text>
        <Text style={{ ...styles.memberDescription, marginLeft: 30 }}>{totalBalance}</Text>
      </View>
      <View style={styles.memberIdRow}>
        <Text style={styles.memberTitle}>member ID: </Text>
        <Text style={{ ...styles.memberDescription, marginLeft: 28 }}>{user?.id}</Text>
      </View>
      <View style={styles.memberDateRow}>
        <Text style={styles.memberTitle}>member since: </Text>
        <Text style={{ ...styles.memberDescription, marginLeft: 6 }}>{user && moment(user?.registerdate).format('MMM Do, YYYY')}</Text>
      </View>

      <Image source={wpay} style={styles.wpayIcon}></Image>
    </View>
  )

  return (
    <BasicScreen
      scrollContainerStyle={styles.scrollView}
      scrollViewRef={scrollViewRef}
      hideBackground={status !== 'normal'}
      style={{ marginTop: 0, paddingTop: 96, backgroundColor: 'transparent' }}
    >
      {isUpdating && <LoadingIndicator />}
      <>
        <View style={{ ...styles.amountContainer, ...styles.amountRow, paddingRight: 0, marginTop: 8 }}>
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
        {showTravelerInfo()}

        <EmptyGap />
        <BlueButton
          title='Add WandoOs'
          width={width * 0.75}
          style={{ marginTop: 30 }}
          onPressListener={addWandoos}
        />

      </>

      {status === 'success' &&
        <Dialog
          visible={true}
          overlayStyle={{ padding: 0 }}
          dialogStyle={{ backgroundColor: theme.COLORS.SUCCESS, borderColor: 'white', borderWidth: 1, borderRadius: 50, marginLeft: 0, marginRight: 0 }}>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ ...fontStyles.bold, fontSize: 28, color: 'white', alignSelf: 'flex-start', marginLeft: 8 }}>
                WPAY success
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={refresh}>
                <Image source={close_icon} style={styles.closeIcon} />
              </TouchableOpacity>
            </View>

            <View style={{ ...styles.amountContainer, ...styles.amountRow, marginTop: 16, borderColor: '#1A1A1A', paddingVertical: 16 }}>
              <Text style={{ ...fontStyles.bold, fontSize: 17 }}>Total amount</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 24 }}>
                <Image source={mexico_flag} style={styles.flagIcon} />
                <Text style={{ ...fontStyles.bold, fontSize: 18 }}>MXW</Text>
              </View>

              <Text style={{ ...styles.inputAmount, flex: 1 }}>{numberWithCommas(amount)}</Text>
            </View>

            {showTravelerInfo()}

            <BlueButton
              title='Add more'
              width={width * 0.75}
              style={{ marginTop: 30 }}
              onPressListener={() => { navigation.goBack(); }}
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
                WPAY fail
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={refresh}>
                <Image source={close_icon} style={styles.closeIcon} />
              </TouchableOpacity>
            </View>

            <View style={{ ...styles.amountContainer, ...styles.amountRow, marginTop: 16, borderColor: '#1A1A1A', paddingVertical: 16 }}>
              <Text style={{ ...fontStyles.bold, fontSize: 17 }}>Total amount</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 24 }}>
                <Image source={mexico_flag} style={styles.flagIcon} />
                <Text style={{ ...fontStyles.bold, fontSize: 18 }}>MXW</Text>
              </View>

              <Text style={{ ...styles.inputAmount, flex: 1, color: theme.COLORS.ERROR }}>{numberWithCommas(amount)}</Text>
            </View>

            {showTravelerInfo()}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 16 }}>
              <Text style={{ ...fontStyles.semibold, fontSize: 18, color: 'white' }}>Reason: </Text>
              <Text style={{ ...fontStyles.regular, fontSize: 17, color: 'white', marginLeft: 12, flex: 1 }}>{reason}</Text>
            </View>

            <BlueButton
              title='WPAY again'
              width={width * 0.75}
              style={{ marginTop: 30 }}
              onPressListener={refresh}
            />
          </View>
        </Dialog>
      }
    </BasicScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {

  },
  amountContainer: {
    width: width * 0.85,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderColor: theme.COLORS.SUCCESS,
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
    color: theme.COLORS.SUCCESS,
    textAlign: 'right',
    paddingTop: 0,
    paddingBottom: 0
  },
  input: {
    width: width * 0.8,
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    paddingLeft: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  logo: {
    width: width * 0.6,
    height: 64,
    resizeMode: 'contain'
  },
  cardContainer: {
    position: 'relative',
    width: 300,
    height: 195,
    marginTop: 12,
  },
  cardBgImage: {
    width: 300,
    height: 195,
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

export default AddWandoosByEmail;