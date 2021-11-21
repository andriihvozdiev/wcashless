import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import moment from 'moment';
import { Dialog } from 'react-native-simple-dialogs';

import LoadingIndicator from '../../components/LoadingIndicator';
import BasicScreen from '../../components/BasicScreen';
import { businessApiService } from '../../service';
import theme from '../../constants/Theme';
import { textStyles, commonStyles, fontStyles } from '../../styles/styles';
import EmptyGap from '../../components/EmptyGap';
import QRScanDialog from '../../components/QRScanDialog';
import BlueButton from '../../components/BlueButton';
import ScanBracelet from '../../components/ScanBracelet';
import { store } from '../../redux/Store';

const { width, height } = Dimensions.get('screen');

const search_disabled = require('../../assets/images/search_disabled.png');
const search_enabled = require('../../assets/images/search_enabled.png');
const qr_button = require('../../assets/images/qr_button.png');
const qr_button_active = require('../../assets/images/qr_button_enabled.png');
const wpay_enabled = require('../../assets/images/wpay_enabled.png');
const wpay_disabled = require('../../assets/images/wpay_disabled.png');
const mexico_flag = require('../../assets/images/mexico_flag.png');
const logo_light = require('../../assets/logo/wc_black_db.png');
const cardBg = require('../../assets/card_bg.png');
const logo = require('../../assets/logo/wc_white_w.png');
const cardChip = require('../../assets/wc_chip.png');
const wpay = require('../../assets/logo/wpay_white_w.png');
const close_icon = require('../../assets/images/close.png');

const RemoveWandoos = ({
  navigation
}) => {

  const scrollViewRef = useRef();

  const [isLoading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [businessUser, setBusinessUser] = useState(store.getState().user?.business);

  const [status, setStatus] = useState('normal'); // normal, scan, completed, failed
  const [isNfcAvailable, setNfcAvailable] = useState(true);
  const [traveler, setTraveler] = useState();
  const [found, setFound] = useState(false);
  const [amount, setAmount] = useState('0');
  const [balance, setBalance] = useState(0);
  const [scanedTag, setScanedTag] = useState();

  useEffect(() => {

  }, []);

  const showError = (message) => {
    setStatus('failed');
    setErrorMessage(message);
  }

  const findWandooer = async () => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email || !email.trim()) {
      return showError('Enter user email.');
    } else if (!re.test(email)) {
      return showError('Enter a valid email.');
    }

    setLoading(true);

    {
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
          navigation.navigate('RemoveWandoosByEmail', { user: user });
        }
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

      if (!user) {
        showError(`${email} has not been registered to any user`);
        return;
      } else {
        setTraveler(user);
        await removeWandoOs(user);
      }
    }
  }

  const onFound = async (wandoTagId) => {
    setFound(true);
    setLoading(true);
    setScanedTag(wandoTagId);

    const user = await getUserProfileFromBraceletId(wandoTagId);

    if (!user) {
      showError('wristband has not been registered to any user');
      setTraveler();
      setLoading(false);
      return;
    }
    setTraveler(user);
    await removeWandoOs(user, wandoTagId);
  }

  const getUserProfileFromBraceletId = async (braceletId) => {

    const result = await businessApiService.getBracelet(braceletId);

    if (result.error || !result.data) {
      return null;
    }

    const customer = result.data?.holder;
    return customer;
  }

  const removeWandoOs = async (user, wandoTagId) => {
    setLoading(true);

    const params = {
      wallet: user?.wallet?.id,
      amount: -parseInt(amount),
      body: {
        description: `${businessUser?.email} removed ${amount} wandoOs from ${user?.email}.`,
        braceletId: `${wandoTagId}`,
        amount: -parseInt(amount),
        type: wandoTagId ? 'Wristband' : 'QR',
        from: user?.email
      },
    }

    console.log(params)

    const result = await businessApiService.addBalance(params);
    setLoading(false);

    console.log(result)

    if (result.error) {
      showError(result.data?.error?.message);
      return;
    }

    setBalance(result.data?.data?.transaction?.toAccount?.wallet?.balance || 0);

    setStatus('completed');
  }

  const refresh = () => {
    setEmail('');
    setStatus('normal');
    setFound(false);
    setAmount('0');
  }

  const numberWithCommas = (x) => {
    if (x == undefined || x == '') return '0';
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const searchIcon = () => {
    return (
      <TouchableOpacity onPress={findWandooer}>
        <Image source={email ? search_enabled : search_disabled} style={styles.searchButton}></Image>
      </TouchableOpacity>
    )
  }

  const showTravelerInfo = () => (
    <View style={styles.cardContainer}>
      <Image source={cardBg} style={styles.cardBgImage}></Image>
      <Image source={logo} style={styles.cardLogoImage}></Image>
      <Image source={cardChip} style={styles.cardChipImage}></Image>
      <View style={styles.balanceRow}>
        <Text style={styles.subTitle}>wandoO balance: </Text>
        <Text style={{ ...styles.subTitle, width: 60, textAlign: 'right' }}>{balance}</Text>
      </View>

      <View style={styles.userRow}>
        <Text style={styles.memberTitle}>user: </Text>
        <Text style={{ ...styles.memberDescription, marginLeft: 30 }}>{traveler ? traveler?.email : 'User not found'}</Text>
      </View>
      <View style={styles.wristbandIdRow}>
        <Text style={styles.memberTitle}>wristband ID: </Text>
        <Text style={{ ...styles.memberDescription, marginLeft: 18 }}>{scanedTag}</Text>
      </View>
      <View style={styles.memberIdRow}>
        <Text style={styles.memberTitle}>member ID: </Text>
        <Text style={{ ...styles.memberDescription, marginLeft: 26 }}>{traveler?.id}</Text>
      </View>
      <View style={styles.memberDateRow}>
        <Text style={styles.memberTitle}>member since: </Text>
        <Text style={{ ...styles.memberDescription, marginLeft: 8 }}>{traveler && moment(traveler?.registerdate).format('LL')}</Text>
      </View>

      <Image source={wpay} style={styles.wpayIcon}></Image>
    </View>
  )

  return (
    <>
      <BasicScreen
        scrollContainerStyle={styles.scrollView}
        scrollViewRef={scrollViewRef}
      >
        {isLoading && <LoadingIndicator />}
        <>
          <Text style={{ ...commonStyles.headerTitle, alignSelf: 'flex-start', marginLeft: 12 }}>Remove wandoOs</Text>

          <View style={styles.boxContainer}>
            <Input
              containerStyle={{ ...styles.boxInContainer, paddingBottom: 10 }}
              inputContainerStyle={styles.input}
              label={<Text style={textStyles.subTitle}>Search and refund by email</Text>}
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

          <View style={{ ...styles.boxContainer, borderRadius: 42 }}>
            <View style={{ ...styles.boxInContainer, borderRadius: 40 }}>
              <Text style={{ ...fontStyles.bold, fontSize: 17, textAlign: 'center' }}>By wristband, card or wallet</Text>

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

        {status === 'qr_scan' &&
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

        {status === 'completed' &&
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

              <View style={{ ...styles.amountContainer, ...styles.amountRow, marginTop: 16, borderColor: theme.COLORS.BORDER_COLOR, paddingVertical: 16 }}>
                <Text style={{ ...fontStyles.bold, fontSize: 17 }}>Total amount</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 24 }}>
                  <Image source={mexico_flag} style={styles.flagIcon} />
                  <Text style={{ ...fontStyles.bold, fontSize: 18 }}>MXW</Text>
                </View>

                <Text style={{ ...styles.inputAmount, flex: 1 }}>{numberWithCommas(amount)}</Text>
              </View>

              {showTravelerInfo()}

              <BlueButton
                title='WPAY again'
                width={width * 0.75}
                style={{ marginTop: 30 }}
                onPressListener={refresh}
              />

            </View>
          </Dialog>
        }

        {status === 'failed' &&
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

              <View style={{ ...styles.amountContainer, ...styles.amountRow, marginTop: 16, borderColor: theme.COLORS.BORDER_COLOR, paddingVertical: 16 }}>
                <Text style={{ ...fontStyles.bold, fontSize: 17 }}>Total amount</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 24 }}>
                  <Image source={mexico_flag} style={styles.flagIcon} />
                  <Text style={{ ...fontStyles.bold, fontSize: 18 }}>MXW</Text>
                </View>

                <Text style={{ ...styles.inputAmount, flex: 1, color: theme.COLORS.ERROR, }}>{numberWithCommas(amount)}</Text>
              </View>

              {showTravelerInfo()}

              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 16 }}>
                <Text style={{ ...fontStyles.semibold, fontSize: 18, color: 'white' }}>Reason: </Text>
                <Text style={{ ...fontStyles.regular, fontSize: 17, color: 'white', marginLeft: 12, flex: 1 }}>{errorMessage}</Text>
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

      {(status === 'scan' && isNfcAvailable) &&
        <View style={styles.scanLayout}>
          <ScanBracelet onFound={onFound} onFailed={() => { setNfcAvailable(false) }} />
          {Platform.OS === 'android' && found === false &&
            <Button
              title="Cancel"
              buttonStyle={styles.scanButton}
              titleStyle={{ ...fontStyles.semibold, color: 'black' }}
              containerStyle={styles.scanButtonContainer}
              onPress={refresh}
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
    top: 48,
    left: 18,
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  balanceRow: {
    position: 'absolute',
    top: 56,
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
    top: 90,
    left: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  wristbandIdRow: {
    position: 'absolute',
    top: 110,
    left: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  memberIdRow: {
    position: 'absolute',
    top: 130,
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
    top: 150,
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

export default RemoveWandoos;