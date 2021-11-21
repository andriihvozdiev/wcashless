import React, { useState, useEffect, useRef } from 'react';
import {
  View, Image, StyleSheet, Dimensions, TouchableOpacity, Platform, ImageBackground
} from 'react-native';
import { Button, Input, Text } from 'react-native-elements';
import moment from 'moment';
import { Dialog } from 'react-native-simple-dialogs';
import { store } from '../../redux/Store';

import EmptyGap from '../../components/EmptyGap';
import BasicScreen from '../../components/BasicScreen';
import ScanBracelet from '../../components/ScanBracelet';
import LoadingIndicator from '../../components/LoadingIndicator';
import QRScanDialog from '../../components/QRScanDialog';
import { businessApiService } from '../../service';
import { textStyles, commonStyles, fontStyles } from '../../styles/styles';
import theme from '../../constants/Theme';
import { saveBusiness } from '../../redux/actions/UserActions';
import BlueButton from '../../components/BlueButton';

const { width, height } = Dimensions.get('screen');

const logo_light = require('../../assets/logo/wc_black_db.png');
const cardBg = require('../../assets/card_bg.png');
const logo = require('../../assets/logo/wc_white_w.png');
const cardChip = require('../../assets/wc_chip.png');
const wpay = require('../../assets/logo/wpay_white_w.png');
const wpay_enabled = require('../../assets/images/wpay_enabled.png');
const wpay_disabled = require('../../assets/images/wpay_disabled.png');
const qr_button = require('../../assets/images/qr_button.png');
const qr_button_active = require('../../assets/images/qr_button_enabled.png');
const mexico_flag = require('../../assets/images/mexico_flag.png');
const close_icon = require('../../assets/images/close.png');
const search_disabled = require('../../assets/images/search_disabled.png');
const search_enabled = require('../../assets/images/search_enabled.png');

const RefundByNFC = ({
  navigation
}) => {

  const scrollViewRef = useRef();

  const [businessUser, setBusinessUser] = useState(store.getState().user?.account);
  const [business, setBusiness] = useState(store.getState().business);

  const [email, setEmail] = useState('');

  const [isNfcAvailable, setNfcAvailable] = useState(true);
  const [status, setStatus] = useState('normal');
  const [isLoading, setLoading] = useState(false);
  const [amount, setAmount] = useState('0');
  const [balance, setBalance] = useState(0);
  const [traveler, setTraveler] = useState();
  const [reason, setReason] = useState('');
  const [braceletId, setBraceletId] = useState('');
  const [found, setFound] = useState(false);

  useEffect(() => {

  }, []);

  const searchIcon = () => {
    return (
      <TouchableOpacity onPress={findWandooer}>
        <Image source={email ? search_enabled : search_disabled} style={styles.searchButton}></Image>
      </TouchableOpacity>
    )
  }

  const findWandooer = async () => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email || !email.trim()) {
      return showError('Enter user email.');
    } else if (!re.test(email)) {
      return showError('Enter a valid email.');
    }

    setLoading(true);
    const result = await businessApiService.getCustomerAccount(email);
    setLoading(false);
    const { error, data } = result;
    if (error) {
      showError('Hmmmm! Something went wrong, Please try again.');
      return;
    } else {
      const users = result.data.data || [];
      if (users.length == 0) {
        showError('User not found.');
        return;
      }
      const user = users[0];

      if (!user) {
        showError('User not found.');
        return;
      } else {
        setEmail('');
        navigation.navigate('RefundByEmail', { user: user });
      }
    }
  }

  const onSuccessQRScan = async (data) => {
    setStatus('normal');
    const email = data;
    await findUserByEmail(email);
  }

  const findUserByEmail = async (email) => {
    setLoading(true);
    const result = await businessApiService.getCustomerAccount(email);
    setLoading(false);

    const { error, data } = result;
    if (error) {
      showError(`User not found with ${email}.`);
      return;
    } else {
      const users = result.data.data || [];
      if (users.length == 0) {
        showError('User not found.');
        return;
      }
      const user = users[0];

      setTraveler(user);
      if (!user) {
        showError(`${email} has not been registered to any user`);
        return;
      } else {
        await refundPayment(user);
      }
    }
  }

  const onFound = async (wandoTagId) => {
    console.log('found wristband id:', wandoTagId);
    setBraceletId(wandoTagId);

    setLoading(true);
    const user = await getUserProfileFromBraceletId(wandoTagId);
    setLoading(false);
    if (!user) {
      showError('wristband has not been registered to any user');
      return;
    }
    setTraveler(user);

    await refundPayment(user, wandoTagId);
  }

  const refundPayment = async (user, wandoTagId) => {
    setFound(true);
    setLoading(true);

    if (business?.wallet?.balance < parseInt(amount)) {
      showError(`insufficient wandoO balance.`);

      setBalance(user?.wallet?.balance);
      return;
    }

    const params = {
      from: business?.wallet?.id,
      to: user?.wallet?.id,
      amount: amount,
      type: 'refund',
      data: {
        description: `${businessUser?.email} refunded ${amount} wandoOs to ${user?.email}`,
        amount: parseInt(amount),
        type: wandoTagId ? 'Wristband' : 'QR',
        from: businessUser?.email,
        to: user?.email,
      },
      // site: ''
    };

    const result = await businessApiService.refundPayment(params);
    if (result.error) {
      showError(result.data?.error?.message);
      return;
    }

    setBalance(result.data?.data?.transaction?.toAccount?.wallet?.balance);

    const businessResult = await businessApiService.getBusiness(store.getState().business?.id);
    if (businessResult.error || !businessResult.data) {
      showError('cannot find business');
      return;
    }
    const updatedBusiness = businessResult.data;

    setBusiness(updatedBusiness);
    saveBusiness(updatedBusiness);

    setStatus('scanned');
    setLoading(false);
  }

  const showError = (message) => {
    setStatus('error');
    setReason(message);
    setLoading(false);
  }

  const refresh = () => {
    setStatus('normal');
    setFound(false);
    setAmount('0');
  }

  const getUserProfileFromBraceletId = async (braceletId) => {
    const result = await businessApiService.getBracelet(braceletId);

    if (result.error || !result.data) {
      return null;
    }

    const customer = result.data?.holder;
    return customer;
  }

  const numberWithCommas = (x) => {
    if (x == undefined || x == '') return '0';
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  return (
    <>
      {isLoading &&
        <LoadingIndicator />
      }
      <BasicScreen
        scrollContainerStyle={styles.scrollView}
        scrollViewRef={scrollViewRef}
      >
        {(status !== 'qr_scan') &&
          <>
            <Text style={{ ...commonStyles.headerTitle, alignSelf: 'flex-start' }}>Refund wandoOs</Text>

            <View style={styles.boxContainer}>
              <Input
                containerStyle={{ ...styles.boxInContainer, paddingBottom: 10 }}
                inputContainerStyle={styles.input}
                label={<Text style={{...fontStyles.bold, fontSize: 17}}>Search and refund by email</Text>}
                rightIcon={searchIcon}
                placeholder='user@email.com'
                keyboardType='email-address'
                returnKeyType='search'
                value={email}
                clearButtonMode='while-editing'
                errorStyle={{ height: 0 }}
                onChange={(event) => {
                  setEmail(event.nativeEvent.text.trim())
                }}
                onSubmitEditing={findWandooer}
              />
            </View>


            <EmptyGap />

            <View style={styles.boxContainer}>
              <View style={styles.boxInContainer}>
                <Text style={{ ...fontStyles.bold, fontSize: 17 }}>By wristband, card or wallet</Text>

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

                <View style={styles.buttonContainer}>
                  <TouchableOpacity onPress={() => {
                    if (amount && parseInt(amount) > 0) {
                      setStatus('scan');
                      setNfcAvailable(true);
                    }
                  }}>
                    <Image source={(amount && parseInt(amount) > 0) ? wpay_enabled : wpay_disabled} style={styles.scanImage}></Image>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ position: 'absolute', top: 0, end: 16 }}
                    onPress={() => (amount && parseInt(amount) > 0) && setStatus('qr_scan')}>
                    <Image source={(amount && parseInt(amount) > 0) ? qr_button_active : qr_button} style={styles.scanQrImage}></Image>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

          </>
        }
        {
          status === 'qr_scan' &&
          <View style={{ alignItems: 'center' }}>
            <QRScanDialog
              onSuccess={(data) => { onSuccessQRScan(data) }}
              onCancel={() => {
                setStatus('normal');
                setFound(false);
              }}
            />
          </View>
        }
        {status === 'scanned' &&
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
                  <Text style={{ ...styles.subTitle, marginLeft: 10 }}>{balance}</Text>
                </View>

                <View style={styles.userRow}>
                  <Text style={styles.memberTitle}>user: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 30 }}>{traveler?.email}</Text>
                </View>
                <View style={styles.memberIdRow}>
                  <Text style={styles.memberTitle}>member ID: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 28 }}>{traveler?.id}</Text>
                </View>
                <View style={styles.memberDateRow}>
                  <Text style={styles.memberTitle}>member since: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 6 }}>{moment(traveler?.registerdate).format('MMM Do YYYY')}</Text>
                </View>

                <Image source={wpay} style={styles.wpayIcon}></Image>
              </View>

              <BlueButton
                title='Refund more'
                onPressListener={refresh}
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
                  WPAY fail
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={refresh}>
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
                  <Text style={styles.subTitle}>wandoO balance: </Text>
                  <Text style={{ ...styles.subTitle, marginLeft: 10 }}>{balance}</Text>
                </View>

                <View style={styles.userRow}>
                  <Text style={styles.memberTitle}>user: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 30 }}>{traveler?.email}</Text>
                </View>
                <View style={styles.memberIdRow}>
                  <Text style={styles.memberTitle}>member ID: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 28 }}>{traveler?.id}</Text>
                </View>
                <View style={styles.memberDateRow}>
                  <Text style={styles.memberTitle}>member since: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 6 }}>{moment(traveler?.registerdate).format('MMM Do YYYY')}</Text>
                </View>

                <Image source={wpay} style={styles.wpayIcon}></Image>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 16 }}>
                <Text style={{ ...fontStyles.semibold, fontSize: 18, color: 'white' }}>Reason: </Text>
                <Text style={{ ...fontStyles.regular, fontSize: 17, color: 'white', marginLeft: 12, flex: 1 }}>{reason}</Text>
              </View>

              <BlueButton
                title='Try again'
                onPressListener={refresh}
                width={width * 0.75}
                style={{ marginTop: 30 }}
              />
            </View>
          </Dialog>
        }
      </BasicScreen>
      {(status === 'scan' && isNfcAvailable) &&
        <View style={styles.scanLayout}>
          <ScanBracelet onFound={onFound} onFailed={() => setNfcAvailable(false)} />
          {Platform.OS === 'android' && found === false &&
            <Button
              title="Cancel"
              buttonStyle={styles.scanButton}
              titleStyle={{ fontWeight: 'bold', color: 'black' }}
              containerStyle={styles.scanButtonContainer}
              onPress={() => {
                setStatus('normal');
                setFound(false);
                setAmount('0');
              }}
            />
          }
          {Platform.OS === 'android' && found === true &&
            <View style={styles.logoContainer}>
              <Image source={logo_light} style={styles.logo} />
            </View>
          }
        </View>}
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {

  },
  boxContainer: {
    width: '100%',
    borderWidth: 2,
    borderColor: theme.COLORS.BORDER_COLOR,
    borderRadius: 22,
    marginTop: 12,
  },
  boxInContainer: {
    width: '100%',
    borderWidth: 5,
    borderColor: theme.COLORS.GREY_COLOR,
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20
  },
  input: {
    width: '100%',
    backgroundColor: 'white',
    borderColor: theme.COLORS.BORDER_COLOR,
    borderWidth: 2,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderRadius: 8,
    paddingLeft: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  searchButton: {
    width: 40,
    height: 40
  },
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
  buttonContainer: {
    flexDirection: 'row',
    width: width * 0.8,
    justifyContent: 'center',
    marginTop: 30
  },
  scanImage: {
    width: 110,
    height: 110,
    resizeMode: 'contain',
  },
  scanQrImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  scanLayout: {
    position: 'absolute',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  scanButton: {
    backgroundColor: '#dddddd',
    borderRadius: 100,
    paddingVertical: 12,
  },
  scanButtonContainer: {
    position: 'absolute',
    bottom: 0,
    marginBottom: 30,
    width: 300,
    marginTop: 40,
  },
  logoContainer: {
    position: 'absolute',
    alignItems: 'center',
    bottom: 30,
    width: width * 0.9,
    paddingTop: 12,
    paddingBottom: 24,
  },
  logo: {
    width: width * 0.6,
    height: 64,
    resizeMode: 'contain'
  },
  cardContainer: {
    position: 'relative',
    width: 300,
    height: 180,
    marginTop: 30,
  },
  cardBgImage: {
    width: 300,
    height: 180,
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
    top: 50,
    left: 18,
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  balanceRow: {
    position: 'absolute',
    top: 58,
    left: 70,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center'
  },
  subTitle: {
    ...fontStyles.semibold,
    fontSize: 16,
    color: 'white'
  },
  userRow: {
    position: 'absolute',
    top: 100,
    left: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  memberIdRow: {
    position: 'absolute',
    top: 120,
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
    top: 140,
    left: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  wpayIcon: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
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

export default RefundByNFC;