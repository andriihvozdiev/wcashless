import React, { useState, useEffect, useRef } from 'react';
import {
  View, Image, StyleSheet, Dimensions, TouchableOpacity, Platform, ImageBackground
} from 'react-native';
import { Button, Input, Text } from 'react-native-elements';
import { Dialog } from 'react-native-simple-dialogs';
import moment from 'moment';

import EmptyGap from '../../components/EmptyGap';
import BasicScreen from '../../components/BasicScreen';
import ScanBracelet from '../../components/ScanBracelet';
import LoadingIndicator from '../../components/LoadingIndicator';
import { businessApiService } from '../../service';
import { commonStyles, fontStyles } from '../../styles/styles';
import BlueButton from '../../components/BlueButton';
import theme from '../../constants/Theme';

const { width, height } = Dimensions.get('screen');

const logo_light = require('../../assets/logo/wc_black_db.png');

const cardBg = require('../../assets/card_bg.png');
const logo = require('../../assets/logo/wc_white_w.png');
const cardChip = require('../../assets/wc_chip.png');
const wpay = require('../../assets/logo/wpay_white_w.png');
const button_background = require('../../assets/images/sq_button.png');
const pair_icon = require('../../assets/images/pair_wristband_r.png')
const search_disabled = require('../../assets/images/search_disabled.png');
const search_enabled = require('../../assets/images/search_enabled.png');
const close_icon = require('../../assets/images/close.png');
const qr_button = require('../../assets/images/qr_button.png');
const qr_button_active = require('../../assets/images/qr_button_enabled.png');

const UnpairBracelet = ({
  navigation, route
}) => {

  const scrollViewRef = useRef();

  const [isNfcAvailable, setNfcAvailable] = useState(true);
  const [status, setStatus] = useState('normal');
  const [isLoading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState();
  const [bracelets, setBracelets] = useState();
  const [traveler, setTraveler] = useState();
  const [reason, setReason] = useState('');
  const [braceletId, setBraceletId] = useState('');
  const [found, setFound] = useState(false);


  useEffect(() => {

  }, []);

  const showError = (message) => {
    setStatus('error');
    setErrorMessage(message);
  }

  const findUserByEmail = async () => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email || !email.trim()) {
      return showError('Enter user email.');
    } else if (!re.test(email)) {
      return showError('Enter a valid email.');
    }

    setLoading(true);
    const result = await businessApiService.getCustomerAccount(email);
    setLoading(false);

    if (result.error) {
      showError('Hmmmm! Something went wrong, Please try again.');
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
        showError('User not found.');
        return;
      } else {
        navigation.navigate('PairedDevices', { user: user });
      }
    }
  }

  const onFound = async (braceletId) => {
    console.log('found wristband id:', braceletId);
    setFound(true);
    setLoading(true);
    setBraceletId(braceletId);

    const user = await getUserProfileFromBraceletId(braceletId);
    if (!user) {
      showError('wristband has not been registered to any user');
      setLoading(false);
      return;
    }

    setTraveler(user);

    const response = await businessApiService.deleteBracelet(braceletId);

    if (response.error) {
      showError(response.data?.error?.message);
      setLoading(false);
      return;
    }

    showScanned();
    setLoading(false);
  }

  const showScanned = () => {
    setStatus('scanned');
  }

  const getUserProfileFromBraceletId = async (braceletId) => {

    const result = await businessApiService.getBracelet(braceletId);

    if (result.error || !result.data) {
      return null;
    }

    const customer = result.data?.holder;
    return customer;
  }

  const searchIcon = () => {
    return (
      <TouchableOpacity onPress={findUserByEmail}>
        <Image source={email ? search_enabled : search_disabled} style={styles.searchButton}></Image>
      </TouchableOpacity>
    )
  }

  const refresh = () => {
    setTraveler();
    setStatus('normal');
    setFound(false);
  }

  return (
    <>
      {isLoading &&
        <LoadingIndicator />
      }
      <BasicScreen
        scrollContainerStyle={styles.scrollView}
        scrollViewRef={scrollViewRef}
        hideBackground={status !== 'normal' && status !== 'scan'}
        style={{ backgroundColor: 'transparent' }}
      >
        <Text style={{ ...commonStyles.headerTitle, alignSelf: 'flex-start' }}>Un-Pair</Text>

        <>

          <View style={styles.blockContainer}>
            <Input
              containerStyle={styles.inputContainerStyle}
              inputContainerStyle={styles.input}
              label={<Text style={{ ...styles.inputTitle }}>Search and un-pair by email</Text>}
              placeholder='user@email.com'
              rightIcon={searchIcon}
              keyboardType='email-address'
              returnKeyType='search'
              value={email}
              clearButtonMode='while-editing'
              onChange={(event) => {
                setEmail(event.nativeEvent.text.trim())
              }}
              onSubmitEditing={findUserByEmail}
            />
          </View>

          <View style={{ ...styles.blockContainer, marginTop: 40, borderRadius: 52 }}>
            <View style={{ ...styles.blockInContainer, borderRadius: 50 }}>
              <Text style={{ ...fontStyles.bold, fontSize: 20 }}>Un-pair via wristband or search Digital wallet QR</Text>
              <Text style={{ ...fontStyles.semibold, fontSize: 16, marginTop: 16 }}>If the device is present just activate and Un-Pair here.</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>

                <TouchableOpacity onPress={() => { }}>
                  <Image source={qr_button} style={styles.scanButtonBg} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => {
                  setStatus('scan');
                  setNfcAvailable(true);
                }}>
                  <ImageBackground source={button_background} style={{ ...styles.scanButtonBg, marginLeft: 20 }}>
                    <Image source={pair_icon} style={styles.scanImage}></Image>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <EmptyGap />
        </>
        {status === 'scanned' &&
          <Dialog
            visible={true}
            overlayStyle={{ padding: 0 }}
            dialogStyle={{ backgroundColor: theme.COLORS.SUCCESS, borderColor: 'white', borderWidth: 1, borderRadius: 50, marginLeft: 0, marginRight: 0 }}>

            <View style={{ alignItems: 'center' }}>

              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ ...fontStyles.bold, fontSize: 28, color: 'white', alignSelf: 'flex-start', marginLeft: 8 }}>
                  UN-PAIR success
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={refresh}>
                  <Image source={close_icon} style={styles.closeIcon} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardContainer}>
                <Image source={cardBg} style={styles.cardBgImage}></Image>
                <Image source={logo} style={styles.cardLogoImage}></Image>
                <Image source={cardChip} style={styles.cardChipImage}></Image>
                <View style={styles.balanceRow}>
                  <Text style={styles.subTitle}>{traveler?.firstName} {traveler?.lastName}</Text>
                </View>

                <View style={styles.userRow}>
                  <Text style={styles.memberTitle}>user: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 30 }}>{traveler?.email}</Text>
                </View>
                <View style={styles.wristbandIdRow}>
                  <Text style={styles.memberTitle}>wristband ID: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 18 }}>{braceletId}</Text>
                </View>
                <View style={styles.memberIdRow}>
                  <Text style={styles.memberTitle}>member ID: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 28 }}>{traveler?.id}</Text>
                </View>
                <View style={styles.memberDateRow}>
                  <Text style={styles.memberTitle}>member since: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 8 }}>{moment(traveler?.registerdate).format('LL')}</Text>
                </View>

                <Image source={wpay} style={styles.wpayIcon}></Image>
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

        {status === 'error' &&
          <Dialog
            visible={true}
            overlayStyle={{ padding: 0 }}
            dialogStyle={{ backgroundColor: theme.COLORS.ERROR, borderColor: 'white', borderWidth: 1, borderRadius: 50, marginLeft: 0, marginRight: 0 }}>

            <View style={{ alignItems: 'center' }}>

              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ ...fontStyles.bold, fontSize: 28, color: 'white', alignSelf: 'flex-start', marginLeft: 8 }}>
                  UN-PAIR fail
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={refresh}>
                  <Image source={close_icon} style={styles.closeIcon} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardContainer}>
                <Image source={cardBg} style={styles.cardBgImage}></Image>
                <Image source={logo} style={styles.cardLogoImage}></Image>
                <Image source={cardChip} style={styles.cardChipImage}></Image>
                <View style={styles.balanceRow}>
                  <Text style={styles.subTitle}>{traveler ? `${traveler.firstName} ${traveler.lastName}` : 'User not found'}</Text>
                </View>

                <View style={styles.userRow}>
                  <Text style={styles.memberTitle}>user: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 30 }}>{traveler?.email}</Text>
                </View>
                <View style={styles.wristbandIdRow}>
                  <Text style={styles.memberTitle}>wristband ID: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 18 }}>{braceletId}</Text>
                </View>
                <View style={styles.memberIdRow}>
                  <Text style={styles.memberTitle}>member ID: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 28 }}>{traveler?.id}</Text>
                </View>
                <View style={styles.memberDateRow}>
                  <Text style={styles.memberTitle}>member since: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 8 }}>{traveler && moment(traveler?.registerdate).format('MMM Do, YYYY')}</Text>
                </View>

                <Image source={wpay} style={styles.wpayIcon}></Image>
              </View>

              <Text style={{ ...fontStyles.bold, fontSize: 20, alignSelf: 'flex-start', marginStart: 8, marginTop: 16, color: 'white' }}>ERROR with UN-PAIRING</Text>
              <Text style={{ ...fontStyles.regular, alignSelf: 'flex-start', marginStart: 12, marginTop: 8, color: 'white' }}>{errorMessage || ''}</Text>

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
  inputContainerStyle: {
    paddingHorizontal: 20,
    borderWidth: 5,
    borderColor: theme.COLORS.GREY_COLOR,
    borderRadius: 27,
  },
  input: {
    backgroundColor: 'white',
    borderColor: theme.COLORS.BORDER_COLOR,
    borderWidth: 2,
    borderBottomWidth: 2,
    borderStyle: 'solid',
    borderRadius: 8,
    paddingLeft: 8,
    marginTop: 20,
    marginBottom: 8,
  },
  inputTitle: {
    ...fontStyles.bold,
    fontSize: 20,
    textAlign: 'left',
    alignSelf: 'flex-start',
    marginTop: 20
  },
  searchButton: {
    width: 40,
    height: 40
  },
  scanButtonBg: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    justifyContent: 'center',
    alignItems: 'center'
  },
  blockContainer: {
    width: '100%',
    borderWidth: 2,
    borderColor: theme.COLORS.BORDER_COLOR,
    borderRadius: 30,
    marginTop: 16
  },
  blockInContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderWidth: 5,
    borderColor: theme.COLORS.GREY_COLOR,
    borderRadius: 27
  },
  scanImage: {
    width: 60,
    height: 60,
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
  wave: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: 1000,
    backgroundColor: '#000000'
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
    height: 190,
    marginTop: 30,
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
    top: 50,
    left: 24,
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  balanceRow: {
    position: 'absolute',
    top: 58,
    left: 80,
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

export default UnpairBracelet;