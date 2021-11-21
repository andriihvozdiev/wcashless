import React, { useState, useEffect, useRef } from 'react';
import {
  View, Image, Alert, StyleSheet, Dimensions, TouchableOpacity, Platform, ImageBackground
} from 'react-native';
import { Button, Input, Text } from 'react-native-elements';
import moment from 'moment';
import { Dialog } from 'react-native-simple-dialogs';

import { store } from '../../redux/Store';
import theme from '../../constants/Theme';
import BasicScreen from '../../components/BasicScreen';
import ScanBracelet from '../../components/ScanBracelet';
import LoadingIndicator from '../../components/LoadingIndicator';
import { businessApiService } from '../../service';
import { commonStyles, fontStyles } from '../../styles/styles';
import QRScanDialog from '../../components/QRScanDialog';
import BlueButton from '../../components/BlueButton';
import EmptyGap from '../../components/EmptyGap';
import SquareButton from '../../components/SquareButton';
import { saveBusiness, saveBusinessMember, saveRole } from '../../redux/actions/UserActions';

const { width, height } = Dimensions.get('screen');

const logo_light = require('../../assets/logo/wc_black_db.png');

const cardBg = require('../../assets/card_bg.png');
const logo = require('../../assets/logo/wc_white_w.png');
const cardChip = require('../../assets/wc_chip.png');
const wpay = require('../../assets/logo/wpay_white_w.png');
const wpay_enabled = require('../../assets/images/wpay_enabled.png');
const wpay_disabled = require('../../assets/logo/w_3d.png');
const qr_button = require('../../assets/images/qr_button.png');
const qr_button_active = require('../../assets/images/qr_button_enabled.png');
const mexico_flag = require('../../assets/images/mexico_flag.png');
const close_icon = require('../../assets/images/close.png');
const other_payment = require('../../assets/images/long_btn_bg.png');

const ReceivePayment = ({
  navigation
}) => {

  const scrollViewRef = useRef();

  const [businessUser, setBusinessUser] = useState(store.getState().user?.account);
  const [business, setBusiness] = useState(store.getState().business);
  const [businessSite, setBusinessSite] = useState(store.getState().businessMember?.business_site);
  const [isNfcAvailable, setNfcAvailable] = useState(true);
  const [status, setStatus] = useState('normal');
  const [isUpdating, setLoading] = useState(false);

  const [amount, setAmount] = useState('0');
  const [tipPercent, setTipPercent] = useState(0);
  const [tipAmount, setTipAmount] = useState('');
  const [totalAmount, setTotalAmount] = useState('');

  const [balance, setBalance] = useState(0);
  const [payer, setPayer] = useState();
  const [reason, setReason] = useState('');
  const [found, setFound] = useState(false);

  useEffect(() => {
    setTipPercent(0);
    getBusinessInfo();
  }, []);

  const getBusinessInfo = async() => {
    setLoading(true);
    const businessResult = await businessApiService.getBusinessInfo();
    setLoading(false);
    if (!businessResult.error && businessResult.data) {
      const businessData = businessResult.data.data[0];
      if (businessData) {
        saveBusiness(businessData.business);
        saveBusinessMember(businessData);
        saveRole(businessData.role, businessData.position);
        setBusinessSite(businessData?.business_site);
      }
    }
  }

  const findUserByEmail = async (email) => {
    setLoading(true);
    const result = await businessApiService.getCustomerAccount(email);
    setLoading(false);

    const { error, data } = result;
    if (error) {
      showError(`User not found with ${email}.`);
      setPayer({ email: 'user not found' });
      return;
    } else {
      const users = result.data.data || [];
      if (users.length == 0) {
        showError('User not found.');
        return;
      }
      const user = users[0];
      setPayer(user);
      if (!user) {
        showError(`${email} has not been registered to any user`);
        setPayer({ email: 'user not found' });
        return;
      } else {
        await receivePayment(user);
      }
    }
  }

  const onFound = async (wandoTagId) => {
    console.log('found wristband id:', wandoTagId);

    setLoading(true);
    const user = await getUserProfileFromBraceletId(wandoTagId);
    setLoading(false);
    if (!user) {
      showError('wristband has not been registered to any user');
      setPayer({ email: 'user not found' });
      return;
    }
    setPayer(user);

    await receivePayment(user, wandoTagId);
  }

  const receivePayment = async (user, wandoTagId) => {

    setFound(true);
    setLoading(true);

    const params = {
      from: user?.wallet?.id,
      to: business?.wallet?.id,
      amount: totalAmount,
      type: 'payment',
      data: {
        description: `${businessUser?.email} receives ${amount} wandoOs from ${user?.email}`,
        amount: parseInt(amount),
        tip: parseInt(totalAmount) - parseInt(amount),
        type: wandoTagId ? 'Wristband' : 'QR',
        from: user?.email,
        to: businessUser?.email,
        wandoTagId: wandoTagId
      },
      site: businessSite?.id
    };

    const result = await businessApiService.receivePayment(params);

    if (result.error) {
      setBalance(result.data?.data?.from?.balance);
      showError(result.data?.error?.message);
      return;
    }

    setBalance(result.data?.data?.transaction?.fromAccount?.wallet?.balance);

    setStatus('scanned');
    setLoading(false);

  }

  const onSuccessQRScan = async (data) => {
    setStatus('normal');
    const email = data;
    await findUserByEmail(email);
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
    setTotalAmount('');
  }

  const getUserProfileFromBraceletId = async (braceletId) => {
    //@todo: need to integrate real API that Omar will provide
    console.log('search user who has this wristband ID:', braceletId)

    const result = await businessApiService.getBracelet(braceletId);

    if (result.error || !result.data) {
      return null;
    }

    const customer = result.data?.holder;
    return customer;
  }

  const addTipPercent = (percent) => {
    setTipPercent(percent);
    var amountNumber = 0;
    if (amount != '') amountNumber = parseInt(amount);
    const total = Math.floor(amountNumber + (amountNumber * percent / 100));
    setTotalAmount(total.toString());
    setTipAmount('');
  }

  const numberWithCommas = (x) => {
    if (x == undefined || x == '') return '0';
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const showBusinessSiteError = () => {
    Alert.alert(
      'Error',
      'Any business site does does not assigned to your account.',
      [
        { text: "Ok", onPress: () => { } }
      ],
      { cancelable: true }
    );
  }

  return (
    <>
      <BasicScreen
        scrollContainerStyle={styles.scrollView}
        scrollViewRef={scrollViewRef}
        hideBackground={status !== 'normal' && status !== 'scan'}
        style={{ marginTop: 0, backgroundColor: 'transparent' }}
      >
        {isUpdating &&
          <LoadingIndicator />
        }
        {(status !== 'qr_scan') &&
          <View style={{ alignItems: 'center' }}>
            <Text style={{ ...commonStyles.headerTitle, alignSelf: 'flex-start' }}>WPAY</Text>

            <View style={styles.boxContainer}>
              <View style={{ ...styles.amountContainer, ...styles.amountRow, paddingRight: 0 }}>
                <Text style={{ ...fontStyles.bold, fontSize: 17 }}>wandoO amount</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 4 }}>
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
                    setTipAmount('');
                    setTotalAmount('0')
                  }}
                  onChange={(event) => {
                    setTipPercent(0);
                    setTipAmount('');
                    const amountInt = parseInt(event.nativeEvent.text.trim()) || 0;
                    setAmount(amountInt.toString());
                    setTotalAmount(amountInt.toString());
                  }}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>tip amount</Text>
            <View style={styles.tipRow}>
              <TouchableOpacity onPress={() => addTipPercent(10)}>
                <View style={tipPercent == 10 ? styles.buttonTipSelected : styles.buttonTip}>
                  <Text style={tipPercent == 10 ? styles.buttonTipTextSelected : styles.buttonTipText}>10%</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => addTipPercent(15)}>
                <View style={tipPercent == 15 ? styles.buttonTipSelected : styles.buttonTip}>
                  <Text style={tipPercent == 15 ? styles.buttonTipTextSelected : styles.buttonTipText}>15%</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => addTipPercent(20)}>
                <View style={tipPercent == 20 ? styles.buttonTipSelected : styles.buttonTip}>
                  <Text style={tipPercent == 20 ? styles.buttonTipTextSelected : styles.buttonTipText}>20%</Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={{ ...styles.amountContainer, ...styles.amountRow, ...styles.totalAmountContainer }}>
              <Text style={{ ...fontStyles.bold, fontSize: 17 }}>Other TIP amount</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 4 }}>
                <Image source={mexico_flag} style={styles.flagIcon} />
                <Text style={{ ...fontStyles.bold, fontSize: 18 }}>MXW</Text>
              </View>

              <Input
                containerStyle={{ flex: 1, height: 40 }}
                inputContainerStyle={{ borderBottomColor: 'transparent' }}
                inputStyle={styles.inputAmount}
                placeholder='0'
                keyboardType='number-pad'
                returnKeyType='done'
                errorStyle={styles.inputErrorStyle}
                value={tipAmount}
                onChange={(event) => {
                  setTipPercent(0);
                  const tipAmountInt = parseInt(event.nativeEvent.text.trim()) || 0;
                  setTipAmount(tipAmountInt.toString());
                  const total = parseInt(amount) + tipAmountInt;
                  setTotalAmount(total.toString());
                }}
              />

            </View>

            <View style={styles.boxContainer}>
              <View style={{ ...styles.amountContainer, ...styles.amountRow, borderColor: theme.COLORS.SUCCESS, paddingVertical: 16, borderWidth: 5 }}>
                <Text style={{ ...fontStyles.bold, fontSize: 17 }}>Total amount</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
                  <Image source={mexico_flag} style={styles.flagIcon} />
                  <Text style={{ ...fontStyles.bold, fontSize: 18 }}>MXW</Text>
                </View>
                <Text style={{ ...styles.inputAmount, fontSize: 24, flex: 1 }}>
                  {totalAmount ? numberWithCommas(totalAmount) : '0'}
                </Text>
              </View>
            </View>

            <View style={{ ...styles.boxContainer, borderRadius: 32 }}>
              <View style={styles.buttonContainer}>

                <View style={{ width: 220, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <SquareButton
                    defaultIcon={wpay_disabled}
                    activeIcon={wpay_disabled}
                    enabled={(amount && parseInt(amount) > 0) ? true : false}
                    onPressListener={() => {
                      if (businessSite == undefined || businessSite == null) {
                        showBusinessSiteError();
                        return;
                      }
                      if (amount && parseInt(amount) > 0) {
                        setStatus('scan');
                        setNfcAvailable(true);
                      }
                    }}
                  />

                  <TouchableOpacity onPress={() => (amount && parseInt(amount) > 0) && setStatus('qr_scan')}>
                    <Image source={(amount && parseInt(amount) > 0) ? qr_button_active : qr_button} style={styles.scanQrImage}></Image>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => { navigation.navigate('OtherPayment') }}>
                  <ImageBackground source={other_payment} imageStyle={{ resizeMode: 'stretch' }} style={{ marginTop: 16, width: 220, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ ...fontStyles.semibold, fontSize: 17, color: 'white' }}>Other payment</Text>
                  </ImageBackground>
                </TouchableOpacity>

              </View>
            </View>

            <EmptyGap />
          </View>
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
        {
          status === 'scanned' &&
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


              <View style={{ ...styles.amountContainer, marginTop: 20, borderColor: theme.COLORS.BORDER_COLOR }}>
                <View style={styles.amountRow}>
                  <Text style={{ ...fontStyles.bold, fontSize: 18 }}>wandoO amount</Text>
                  <Text style={{ ...fontStyles.bold, flex: 1, fontSize: 18, marginLeft: 12, textAlign: 'right' }}>
                    {numberWithCommas(amount)}
                  </Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={{ ...fontStyles.semibold, fontSize: 18 }}>TIP</Text>
                  <Text style={{ ...fontStyles.semibold, flex: 1, fontSize: 18, marginLeft: 12, textAlign: 'right' }}>
                    {numberWithCommas(tipAmount)}
                  </Text>
                </View>
                <View style={{ ...styles.amountRow, marginTop: 12 }}>
                  <Text style={{ ...fontStyles.bold, fontSize: 18 }}>Total amount</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
                    <Image source={mexico_flag} style={styles.flagIcon} />
                    <Text style={{ ...fontStyles.bold, fontSize: 18 }}>MXW</Text>
                  </View>
                  <Text style={{ ...fontStyles.bold, flex: 1, fontSize: 24, color: theme.COLORS.SUCCESS, marginLeft: 12, textAlign: 'right' }}>
                    {numberWithCommas(totalAmount)}
                  </Text>
                </View>
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
                  <Text style={{ ...styles.memberDescription, marginLeft: 20 }}>{payer?.email}</Text>
                </View>
                <View style={styles.memberIdRow}>
                  <Text style={styles.memberTitle}>member ID: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 30 }}>{payer?.id}</Text>
                </View>
                <View style={styles.memberDateRow}>
                  <Text style={styles.memberTitle}>member since: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 8 }}>{moment(payer?.registerdate).format('LL')}</Text>
                </View>

                <Image source={wpay} style={styles.wpayIcon}></Image>
              </View>

              <BlueButton
                title='WPAY again'
                onPressListener={refresh}
                width={width * 0.75}
                style={{ marginTop: 30 }}
              />

            </View>
          </Dialog>
        }
        {
          status === 'error' &&
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

              <View style={{ ...styles.amountContainer, marginTop: 20, borderColor: theme.COLORS.BORDER_COLOR }}>
                <View style={{ ...styles.amountRow }}>
                  <Text style={{ ...fontStyles.bold, fontSize: 18 }}>Total amount</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
                    <Image source={mexico_flag} style={styles.flagIcon} />
                    <Text style={{ ...fontStyles.bold, fontSize: 18 }}>MXW</Text>
                  </View>
                  <Text style={{ ...fontStyles.bold, flex: 1, fontSize: 24, color: theme.COLORS.SUCCESS, marginLeft: 12, textAlign: 'right' }}>
                    {numberWithCommas(totalAmount)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardContainer}>
                <Image source={cardBg} style={styles.cardBgImage}></Image>
                <Image source={logo} style={styles.cardLogoImage}></Image>
                <Image source={cardChip} style={styles.cardChipImage}></Image>
                <View style={styles.balanceRow}>
                  <Text style={styles.subTitle}>wandoO balance: </Text>
                  <Text style={{ ...styles.subTitle, marginLeft: 12 }}>{balance}</Text>
                </View>

                <View style={styles.userRow}>
                  <Text style={styles.memberTitle}>user: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 20 }}>{payer?.email}</Text>
                </View>
                <View style={styles.memberIdRow}>
                  <Text style={styles.memberTitle}>member ID: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 30 }}>{payer?.id}</Text>
                </View>
                <View style={styles.memberDateRow}>
                  <Text style={styles.memberTitle}>member since: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 8 }}>{moment(payer?.registerdate).format('LL')}</Text>
                </View>

                <Image source={wpay} style={styles.wpayIcon}></Image>
              </View>

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
      </BasicScreen >

      {(status === 'scan' && isNfcAvailable) &&
        <View style={styles.scanLayout}>
          <ScanBracelet
            onFound={onFound}
            onFailed={() => { setNfcAvailable(false); }} />
          {Platform.OS === 'android' && found === false &&
            <Button
              title="Cancel"
              buttonStyle={styles.scanButton}
              titleStyle={{ ...fontStyles.semibold, color: 'black' }}
              containerStyle={styles.scanButtonContainer}
              onPress={() => {
                setStatus('normal');
                setFound(false);
              }}
            />
          }
          {Platform.OS === 'android' && found === true &&
            <View style={styles.logoContainer}>
              <Image source={logo_light} style={styles.logo} />
            </View>
          }
        </View>
      }
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    width: width,
    height: '100%'
  },
  scrollView: {
  },
  inputLabel: {
    ...fontStyles.semibold,
    alignSelf: 'flex-start',
    fontSize: 18,
    marginTop: 16
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
  qrButton: {
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: 'contain'
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: theme.COLORS.GREY_COLOR,
    borderRadius: 30,
    paddingVertical: 20,
  },
  scanQrImage: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
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
  boxContainer: {
    width: width * 0.85,
    borderColor: theme.COLORS.BORDER_COLOR,
    borderWidth: 2,
    borderStyle: 'solid',
    borderRadius: 18,
    marginTop: 24,
  },
  amountContainer: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderColor: theme.COLORS.GREY_COLOR,
    borderWidth: 5,
    borderStyle: 'solid',
    borderRadius: 16,
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
    paddingBottom: 0,
    paddingTop: 0
  },
  inputErrorStyle: {
    height: 0
  },
  inputAmountSelected: {
    width: width * 0.75,
    height: 45,
    backgroundColor: 'white',
    borderColor: '#8FD14F',
    borderWidth: 2,
    borderStyle: 'solid',
    borderRadius: 8,
    paddingLeft: 8,
    marginTop: 8,
    justifyContent: 'center'
  },
  tipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.85,
    marginTop: 8,
    marginBottom: 8
  },
  buttonTip: {
    height: 45,
    width: width * 0.25,
    backgroundColor: '#fff',
    borderColor: theme.COLORS.BORDER_COLOR,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonTipSelected: {
    height: 45,
    width: width * 0.25,
    backgroundColor: '#8FD14F',
    borderColor: theme.COLORS.BORDER_COLOR,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonTipText: {
    ...fontStyles.semibold,
    textAlign: 'center',
    fontSize: 17,
    color: 'grey'
  },
  buttonTipTextSelected: {
    ...fontStyles.semibold,
    textAlign: 'center',
    fontSize: 17,
  },
  totalAmountContainer: {
    width: width * 0.85,
    paddingRight: 0,
    paddingVertical: 6,
    borderColor: theme.COLORS.BORDER_COLOR,
    borderWidth: 2,
    marginTop: 12
  },
  totalText: {
    fontSize: 20,
    textAlign: 'center',
    color: 'grey',
  },
  totalTextAvailable: {
    fontSize: 20,
    textAlign: 'center',
  },
  logoContainer: {
    position: 'absolute',
    alignItems: 'center',
    bottom: 0,
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
    marginTop: 20,
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
    top: 54,
    left: 16,
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  balanceRow: {
    position: 'absolute',
    top: 62,
    left: 65,
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
    top: 125,
    left: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  memberTitle: {
    ...fontStyles.semibold,
    fontSize: 12,
    color: 'white'
  },
  memberDescription: {
    fontSize: 12,
    color: 'white'
  },
  memberDateRow: {
    position: 'absolute',
    top: 145,
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
});

export default ReceivePayment;