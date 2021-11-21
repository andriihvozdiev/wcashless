import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { Button, Input, Text } from 'react-native-elements';
import { Dialog } from 'react-native-simple-dialogs';
import moment from 'moment';
import LoadingIndicator from '../../components/LoadingIndicator';
import BasicScreen from '../../components/BasicScreen';
import { businessApiService } from '../../service';
import EmptyGap from '../../components/EmptyGap';
import ScanBracelet from '../../components/ScanBracelet';
import { commonStyles, fontStyles } from '../../styles/styles';
import BlueButton from '../../components/BlueButton';
import theme from '../../constants/Theme';
import { store } from '../../redux/Store';

const { width, height } = Dimensions.get('screen');

const button_bg_enabled = require('../../assets/images/sq_button_active.png');
const button_bg_disabled = require('../../assets/images/sq_button.png');
const qr_button = require('../../assets/images/qr_button.png');
const qr_button_active = require('../../assets/images/qr_button_enabled.png');
const email_icon = require('../../assets/images/email_w.png')
const pair_icon = require('../../assets/images/pair_w.png')
const pair_icon_r = require('../../assets/images/pair_r.png')
const logo_light = require('../../assets/logo/wc_black_db.png');
const cardBg = require('../../assets/card_bg.png');
const logo = require('../../assets/logo/wc_white_w.png');
const cardChip = require('../../assets/wc_chip.png');
const wpay = require('../../assets/logo/wpay_white_w.png');
const close_icon = require('../../assets/images/close.png');

const PairBracelet = ({
  navigation
}) => {

  const scrollViewRef = useRef();

  const [business, setBusiness] = useState(store.getState().business);

  const [status, setStatus] = useState('normal'); // pairing, completed, failed

  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState();
  const [user, setUser] = useState();
  const [isLoading, setLoading] = useState(false);

  const [found, setFound] = useState(false);
  const [scanedTag, setScanedTag] = useState('');

  useEffect(() => {

  }, []);

  const showError = (message) => {
    setStatus('failed');
    setErrorMessage(message);
  }

  const findCustomer = async () => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email || !email.trim()) {
      return showError('email required');
    } else if (!re.test(email)) {
      return showError('Enter a valid email.');
    }

    setLoading(true);

    const result = await businessApiService.getCustomerAccount(email);
    const { error, data } = result;
    setLoading(false);

    if (error) {
      showError('Hmmmm! Something went wrong, Please try again.');
      return;
    } else {
      const users = data.data || [];
      const user = users[0];

      setUser(user);
      if (!user) {
        showError('User not found.');
        return;
      } else {
        setStatus('pairing');
      }
    }

  }

  const onScanFailed = () => {
    setFound(false);
  }

  const onFound = async (wandoTagId) => {
    setFound(true);

    setScanedTag(wandoTagId);

    const toDate = new Date();
    toDate.setDate(toDate.getDate() + 365);

    const params = {
      uid: wandoTagId,
      business: business?.id,
      holder: user?.id,
      expireAt: formatDate(toDate, '-', false),
    }

    setLoading(true);
    const result = await businessApiService.registerBracelet(params)
    setLoading(false);

    if (!result?.error) {
      setStatus('completed');
    } else {
      showError(result?.data?.error?.message)
    }
  }

  const formatDate = (date, delimiter = '-', isReverse = false) => {
    let d = date,
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return isReverse ? [day, month, year].join(delimiter) : [year, month, day].join(delimiter);
  }

  const refresh = () => {
    setStatus('normal');
    setEmail('');
    setFound(false);
  }

  return (
    <>
      <BasicScreen
        scrollContainerStyle={styles.scrollView}
        scrollViewRef={scrollViewRef}
      >
        {isLoading && <LoadingIndicator />}
        <>
          <Text style={{ ...commonStyles.headerTitle, alignSelf: 'flex-start', marginStart: 8 }}>
            WPAIR
          </Text>

          <View style={{ ...styles.boxContainer, borderRadius: 52 }}>
            <View style={{ ...styles.boxInContainer, borderRadius: 50, paddingHorizontal: 12 }}>
              <Input
                inputContainerStyle={styles.input}
                label={<Text style={{ ...styles.subtitle, marginBottom: 12 }}>Search and pair by email or QR on Digital wallet</Text>}
                placeholder='user@email.com'
                errorStyle={{ height: 0 }}
                keyboardType='email-address'
                returnKeyType='search'
                value={email}
                clearButtonMode='while-editing'
                onChange={(event) => {
                  setErrorMessage('');
                  setEmail(event.nativeEvent.text.trim());
                }}
                onSubmitEditing={findCustomer}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
                <TouchableOpacity onPress={() => { email && findCustomer(); }}>
                  <ImageBackground source={email ? button_bg_enabled : button_bg_disabled} style={styles.pairButtonBg}>
                    <Image source={email_icon} style={{ ...styles.pairImage, width: 40, height: 40 }}></Image>
                  </ImageBackground>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { }} style={{ marginLeft: 16 }}>
                  <Image source={email ? qr_button_active : qr_button} style={styles.pairButtonBg} />
                </TouchableOpacity>
              </View>

            </View>
          </View>

          <View style={{ ...styles.boxContainer, marginTop: 30 }}>
            <View style={styles.boxInContainer}>
              <Text style={{ ...styles.subtitle }}>Unpair a wristband</Text>
              <View style={{ alignItems: 'center', marginTop: 16 }}>
                <TouchableOpacity onPress={() => { navigation.navigate('UnpairBracelet') }}>
                  <ImageBackground source={button_bg_enabled} style={styles.pairButtonBg}>
                    <Image source={pair_icon_r} style={styles.pairImage}></Image>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <EmptyGap />

        </>

        {status === 'completed' &&
          <Dialog
            visible={true}
            overlayStyle={{ padding: 0 }}
            dialogStyle={{ backgroundColor: theme.COLORS.SUCCESS, borderColor: 'white', borderWidth: 1, borderRadius: 50, marginLeft: 0, marginRight: 0 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ ...fontStyles.bold, fontSize: 28, color: 'white', alignSelf: 'flex-start', marginLeft: 8 }}>
                  WPAIR success
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={refresh}>
                  <Image source={close_icon} style={styles.closeIcon} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardContainer}>
                <Image source={cardBg} style={styles.cardBgImage}></Image>
                <Image source={logo} style={styles.cardLogoImage}></Image>
                <Image source={cardChip} style={styles.cardChipImage}></Image>
                <Text style={styles.userName}>{user ? user.name : 'User not found'}</Text>

                <View style={styles.userRow}>
                  <Text style={styles.memberTitle}>user: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 30 }}>{email}</Text>
                </View>
                <View style={styles.wristbandId}>
                  <Text style={styles.memberTitle}>wristband ID: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 18 }}>{scanedTag}</Text>
                </View>
                <View style={styles.memberIdRow}>
                  <Text style={styles.memberTitle}>member ID: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 28 }}>{user?.id}</Text>
                </View>
                <View style={styles.memberDateRow}>
                  <Text style={styles.memberTitle}>member since: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 8 }}>{user && moment(user?.registerdate).format('LL')}</Text>
                </View>

                <Image source={wpay} style={styles.wpayIcon}></Image>
              </View>

              <BlueButton
                title='WPAIR again'
                onPressListener={refresh}
                width={width * 0.75}
                style={{ marginTop: 50 }}
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
                  WPAIR fail
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={refresh}>
                  <Image source={close_icon} style={styles.closeIcon} />
                </TouchableOpacity>
              </View>

              <View style={styles.cardContainer}>
                <Image source={cardBg} style={styles.cardBgImage}></Image>
                <Image source={logo} style={styles.cardLogoImage}></Image>
                <Image source={cardChip} style={styles.cardChipImage}></Image>
                <Text style={styles.userName}>{user ? user.name : 'User not found'}</Text>

                <View style={styles.userRow}>
                  <Text style={styles.memberTitle}>user: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 30 }}>{email}</Text>
                </View>
                <View style={styles.wristbandId}>
                  <Text style={styles.memberTitle}>wristband ID: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 18 }}>{scanedTag}</Text>
                </View>
                <View style={styles.memberIdRow}>
                  <Text style={styles.memberTitle}>member ID: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 28 }}>{user?.id}</Text>
                </View>
                <View style={styles.memberDateRow}>
                  <Text style={styles.memberTitle}>member since: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 8 }}>{user && moment(user?.registerdate).format('LL')}</Text>
                </View>

                <Image source={wpay} style={styles.wpayIcon}></Image>
              </View>

              <Text style={{ ...fontStyles.bold, fontSize: 20, alignSelf: 'flex-start', marginStart: 8, marginTop: 16, color: 'white' }}>ERROR with PAIRING</Text>
              <Text style={{ ...fontStyles.regular, alignSelf: 'flex-start', marginStart: 12, marginTop: 8, color: 'white' }}>{errorMessage || ''}</Text>

              <BlueButton
                title='WPAIR again'
                onPressListener={refresh}
                width={width * 0.75}
                style={{ marginTop: 30 }}
              />

            </View>
          </Dialog>
        }

      </BasicScreen>

      {
        (status === 'pairing') &&
        <View style={styles.scanLayout}>
          <ScanBracelet onFound={onFound} onFailed={onScanFailed} />
          {Platform.OS === 'android' && found === false &&
            <Button
              title="Cancel"
              buttonStyle={styles.scanButton}
              titleStyle={{ ...fontStyles.bold, fontSize: 17, color: 'black' }}
              containerStyle={styles.scanButtonContainer}
              onPress={() => {
                setStatus('normal');
                setFound(false);
                setEmail('');
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
  subtitle: {
    ...fontStyles.bold,
    fontSize: 20,
    textAlign: 'left',
    alignSelf: 'flex-start',
  },
  scrollView: {
  },
  boxContainer: {
    width: '100%',
    borderWidth: 2,
    borderColor: theme.COLORS.BORDER_COLOR,
    borderRadius: 30,
    marginTop: 20
  },
  boxInContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 30,
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
    marginTop: 8,
  },
  searchButton: {
    width: 40,
    height: 40
  },
  pairButtonBg: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center'
  },
  pairImage: {
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
  logoContainer: {
    position: 'absolute',
    alignItems: 'center',
    bottom: 0,
    width: width * 0.9,
    paddingTop: 12,
    paddingBottom: 24
  },
  logo: {
    width: width * 0.7,
    height: 64,
    resizeMode: 'contain'
  },
  cardContainer: {
    position: 'relative',
    width: 300,
    height: 200,
    marginTop: 20,
  },
  cardBgImage: {
    width: 300,
    height: 200,
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
    left: 24,
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  userName: {
    ...fontStyles.bold,
    position: 'absolute',
    top: 62,
    left: 80,
    fontSize: 16,
    color: 'white'
  },
  userRow: {
    position: 'absolute',
    top: 105,
    left: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  wristbandId: {
    position: 'absolute',
    top: 130,
    left: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  memberIdRow: {
    position: 'absolute',
    top: 150,
    left: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  memberTitle: {
    ...fontStyles.bold,
    fontSize: 12,
    color: 'white'
  },
  memberDescription: {
    ...fontStyles.regular,
    fontSize: 12,
    color: 'white'
  },
  memberDateRow: {
    position: 'absolute',
    top: 170,
    left: 16,
    alignSelf: 'flex-start',
    flexDirection: 'row'
  },
  wpayIcon: {
    position: 'absolute',
    bottom: 14,
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

export default PairBracelet;