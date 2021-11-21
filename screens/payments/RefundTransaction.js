import React, { useState, useEffect, useRef } from 'react';
import {
  View, Image, StyleSheet, Dimensions, TouchableOpacity, Platform, ImageBackground, Linking
} from 'react-native';
import { Button, Input, Text } from 'react-native-elements';
import { Dialog } from 'react-native-simple-dialogs';
import moment from 'moment';

import { store } from '../../redux/Store';

import BasicScreen from '../../components/BasicScreen';
import LoadingIndicator from '../../components/LoadingIndicator';
import { businessApiService } from '../../service';
import BlueButton from '../../components/BlueButton';
import { fontStyles } from '../../styles/styles';
import EmptyGap from '../../components/EmptyGap';
import theme from '../../constants/Theme';

const { width, height } = Dimensions.get('screen');

const cardBg = require('../../assets/card_bg.png');
const logo = require('../../assets/logo/wc_white_w.png');
const cardChip = require('../../assets/wc_chip.png');
const wpay = require('../../assets/logo/wpay_white_w.png');
const mexico_flag = require('../../assets/images/mexico_flag.png');
const close_icon = require('../../assets/images/close.png');
const pencil_icon = require('../../assets/images/pencil.png');
const arrow_next = require('../../assets/images/arrow_next.png');

const RefundTransaction = ({
  navigation, route
}) => {

  const scrollViewRef = useRef();

  const [businessUser, setBusinessUser] = useState(store.getState().user?.account);

  const [oldTransaction, setOldTransaction] = useState(route.params?.transaction);
  const [amount, setAmount] = useState('');
  const [availableAmount, setAvailableAmount] = useState(0);
  const [toEmail, setToEmail] = useState();

  const [status, setStatus] = useState('normal');
  const [isLoading, setLoading] = useState(false);

  const [balance, setBalance] = useState(0);
  const [traveler, setTraveler] = useState();
  const [reason, setReason] = useState('');
  const [found, setFound] = useState(false);

  const [isEditNote, setEditNote] = useState(false);
  const [note, setNote] = useState('');

  const [isReportDialog, setReportDialog] = useState(false);
  const [reportNote, setReportNote] = useState('');

  useEffect(() => {
    if (oldTransaction.refer_tx?.amount) {
      const availableAmount = parseInt(oldTransaction?.amount) - parseInt(oldTransaction?.refer_tx?.amount);
      setAvailableAmount(availableAmount);
      setAmount(availableAmount.toString());
    } else {
      setAvailableAmount(parseInt(oldTransaction.amount));
      setAmount(oldTransaction.amount);
    }

    setToEmail(oldTransaction.data?.from);
    setNote(oldTransaction.data?.note);
  }, []);

  const refund = async () => {
    if (parseInt(amount) > availableAmount) return;

    setLoading(true);
    const result = await businessApiService.getCustomerAccount(toEmail);
    setLoading(false);

    const { error, data } = result;
    if (error) {
      showError(`User not found with ${toEmail}.`);
      setTraveler({ email: 'user not found' });
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
        showError(`${toEmail} has not been registered to any user`);
        setTraveler({ email: 'user not found' });
        return;
      } else {
        await refundPayment(user);
      }
    }
  }

  const refundPayment = async (user) => {

    setFound(true);
    setLoading(true);

    var businessBalance = 0;
    businessBalance = parseInt(oldTransaction?.business?.wallet?.balance);
    if (businessBalance < amount) {
      showError('insufficient wandoO balance in our business.');
      return;
    }

    setBalance(user?.wallet?.balance);

    const params = {
      amount: amount,
      data: {
        description: `${businessUser?.email} refunded ${amount} wandoOs to ${user?.email}`,
        amount: parseInt(amount),
        type: '',
        from: businessUser?.email,
        to: user?.email,
        transactionId: oldTransaction?.id
      }
    };

    const result = await businessApiService.refundTransaction(oldTransaction?.id, params);

    if (result.error || !result.data) {
      showError(result.data?.error?.message);
      return;
    }

    setBalance(result.data?.data?.transaction?.toAccount?.wallet?.balance);

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
  }

  const numberWithCommas = (x) => {
    if (x == undefined || x == '') return '0';
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  const onAddNote = () => {
    setEditNote(true);
  }

  const saveNote = async () => {
    setEditNote(false);

    const param = {
      data: {
        ...oldTransaction.data,
        note: note
      }
    }

    setLoading(true);
    const result = await businessApiService.updateTransaction(oldTransaction.id, param);
    setLoading(false);

    if (result?.error && result?.data?.data) {
      setOldTransaction(result.data.data);
    }

  }

  return (
    <>
      <BasicScreen
        scrollContainerStyle={styles.scrollView}
        scrollViewRef={scrollViewRef}
        hideBackground={status !== 'normal' && status !== 'scan'}
        style={{ marginTop: 0, backgroundColor: 'transparent' }}
      >
        {isLoading &&
          <LoadingIndicator />
        }

        <View style={styles.mainContainer}>
          <Text style={{ ...fontStyles.bold, fontSize: 20, alignSelf: 'flex-start', marginLeft: 16 }}>+MXW {oldTransaction?.amount}</Text>
          <Text style={{ ...fontStyles.regular, fontSize: 16, alignSelf: 'flex-start', marginLeft: 16 }}>{`(MXW) ${oldTransaction?.data?.tip} TIP amount`}</Text>

          <Text style={{ ...fontStyles.bold, fontSize: 18, alignSelf: 'flex-start', marginLeft: 16, marginTop: 12 }}>{oldTransaction?.business?.name}</Text>
          <Text style={{ ...fontStyles.regular, fontSize: 16, alignSelf: 'flex-start', marginLeft: 16 }}>{moment(oldTransaction?.createdAt).format('YY-MM-DD HH:mm')}</Text>

          <View style={parseInt(amount) > availableAmount ? { ...styles.refundAmountContainerInvalid } : { ...styles.refundAmountContainer }}>
            <Text style={{ ...fontStyles.bold, fontSize: 17 }}>Refund amount</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
              <Image source={mexico_flag} style={styles.flagIcon} />
              <Text style={{ ...fontStyles.bold, fontSize: 18 }}>MXW</Text>
            </View>

            <Input
              containerStyle={{ flex: 1, height: 40 }}
              inputContainerStyle={{ borderBottomColor: 'transparent' }}
              inputStyle={styles.inputAmount}
              keyboardType='number-pad'
              value={amount}
              errorStyle={{ height: 0 }}
              onChange={(event) => {
                var amountInt = parseInt(event.nativeEvent.text.trim()) || 0;
                setAmount(amountInt.toString());
              }}
            />
          </View>

          <View style={styles.groupContainer}>
            <View style={styles.rowItem}>
              <Text style={styles.rowTitle}>Transaction ID</Text>
              <Text style={styles.rowDescription}>{oldTransaction?.id}</Text>
            </View>
            <View style={styles.rowItem}>
              <Text style={styles.rowTitle}>wcashless device type</Text>
              <Text style={styles.rowDescription}>{oldTransaction?.data?.type}</Text>
            </View>
            {oldTransaction?.data?.wandoTagId &&
              <View style={styles.rowItem}>
                <Text style={styles.rowTitle}>Wristband ID</Text>
                <Text style={styles.rowDescription}>{oldTransaction?.data?.wandoTagId}</Text>
              </View>
            }
            <View style={styles.rowItem}>
              <Text style={styles.rowTitle}>Customer email</Text>
              <Text style={styles.rowDescription}>{toEmail}</Text>
            </View>
          </View>

          <Text style={{ ...fontStyles.semibold, fontSize: 14, alignSelf: 'flex-start', marginLeft: 12, marginTop: 20 }}>Any transaction notes</Text>
          <View style={{ ...styles.groupContainer, marginTop: 8, minHeight: 80 }}>
            <Text style={styles.rowTitle}>Customer notes</Text>
          </View>

          <View style={{ ...styles.groupContainer, flexDirection: 'column' }}>
            <View style={styles.rowItem}>
              <Text style={{ ...styles.rowTitle, flex: 1 }} numberOfLines={1}>Business Note</Text>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={isEditNote ? saveNote : onAddNote}>
                {!isEditNote && <Image source={pencil_icon} style={{ width: 20, height: 20, marginRight: 8 }} />}
                <Text style={styles.rowDescription}>{isEditNote ? 'Save': 'Add note'}</Text>
              </TouchableOpacity>
            </View>
            <Input
              inputContainerStyle={{borderBottomColor: 'transparent'}}
              style={{ textAlignVertical: 'top', ...fontStyles.regular, fontSize: 16, }}
              multiline={true}
              numberOfLines={2}
              value={note}
              onChange={(event) => {
                setNote(event.nativeEvent.text)
              }}
              errorStyle={{height: 0}}
              editable={isEditNote}
            />
          </View>

          <View style={{ ...styles.rowItem, paddingHorizontal: 14, marginTop: 16 }}>
            <Text style={styles.rowTitle}>Report an issue</Text>
            <TouchableOpacity style={{ paddingVertical: 6, paddingStart: 10 }} onPress={() => {setReportDialog(true)}}>
              <Image source={arrow_next} style={{ width: 12, height: 12 }}></Image>
            </TouchableOpacity>
          </View>

          <EmptyGap />
          <BlueButton
            title="Refund"
            style={parseInt(amount) > availableAmount ? styles.refundButtonDisabled : styles.refundButton}
            onPressListener={refund}
          />

        </View>

        {status === 'scanned' &&
          <Dialog
            visible={true}
            overlayStyle={{ padding: 0 }}
            dialogStyle={{ backgroundColor: theme.COLORS.SUCCESS, borderColor: 'white', borderWidth: 1, borderRadius: 50, marginLeft: 0, marginRight: 0 }}>

            <View style={{ alignItems: 'center' }}>
              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ ...fontStyles.bold, fontSize: 28, color: 'white', alignSelf: 'flex-start', marginLeft: 8 }}>
                  Refund success
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={() => { navigation.goBack() }}>
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
                  <Text style={{ ...styles.memberDescription, marginLeft: 20 }}>{traveler?.email}</Text>
                </View>
                <View style={styles.memberIdRow}>
                  <Text style={styles.memberTitle}>member ID: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 30 }}>{traveler?.id}</Text>
                </View>
                <View style={styles.memberDateRow}>
                  <Text style={styles.memberTitle}>member since: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 8 }}>{moment(traveler?.registerdate).format('LL')}</Text>
                </View>

                <Image source={wpay} style={styles.wpayIcon}></Image>
              </View>

              <BlueButton
                title='Back'
                onPressListener={() => { navigation.goBack() }}
                style={{ marginTop: 20 }}
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
                <TouchableOpacity style={styles.closeButton} onPress={refresh}>
                  <Image source={close_icon} style={styles.closeIcon} />
                </TouchableOpacity>
              </View>

              <View style={{ ...styles.amountContainer, marginTop: 20 }}>
                <View style={{ ...styles.amountRow }}>
                  <Text style={{ ...fontStyles.bold, fontSize: 18 }}>Refund amount</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 20 }}>
                    <Image source={mexico_flag} style={styles.flagIcon} />
                    <Text style={{ ...fontStyles.bold, fontSize: 18 }}>MXW</Text>
                  </View>
                  <Text style={{ ...fontStyles.bold, flex: 1, fontSize: 24, color: theme.COLORS.SUCCESS, marginLeft: 12, textAlign: 'right' }}>
                    {numberWithCommas(amount)}
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
                  <Text style={{ ...styles.memberDescription, marginLeft: 20 }}>{traveler?.email}</Text>
                </View>
                <View style={styles.memberIdRow}>
                  <Text style={styles.memberTitle}>member ID: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 30 }}>{traveler?.id}</Text>
                </View>
                <View style={styles.memberDateRow}>
                  <Text style={styles.memberTitle}>member since: </Text>
                  <Text style={{ ...styles.memberDescription, marginLeft: 8 }}>{moment(traveler?.registerdate).format('LL')}</Text>
                </View>

                <Image source={wpay} style={styles.wpayIcon}></Image>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 16 }}>
                <Text style={{ ...fontStyles.semibold, fontSize: 18, color: 'white' }}>Reason: </Text>
                <Text style={{ ...fontStyles.regular, fontSize: 17, color: 'white', marginLeft: 12, flex: 1 }}>{reason}</Text>
              </View>

              <BlueButton
                title='Try again'
                style={{ marginTop: 20 }}
                onPressListener={refresh}
              />
            </View>
          </Dialog>
        }

        {isReportDialog &&
          <Dialog
            visible={true}
            overlayStyle={{ padding: 0 }}
            dialogStyle={styles.dialogStyle}>

            <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ ...fontStyles.bold, fontSize: 28, alignSelf: 'flex-start', marginLeft: 8 }}>
                Support
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => { setReportDialog(false) }}>
                <Image source={close_icon} style={styles.closeIcon} />
              </TouchableOpacity>
            </View>

            <Input
              inputContainerStyle={styles.noteInputContainerStyle}
              style={{ textAlignVertical: 'top', ...fontStyles.regular, fontSize: 17, }}
              multiline={true}
              numberOfLines={4}
              placeholder='Note'
              value={reportNote}
              onChange={(event) => {
                setReportNote(event.nativeEvent.text)
              }}
            />

            <View style={{ alignSelf: 'center' }}>
              <BlueButton
                title="Send"
                onPressListener={() => {setReportDialog(false)}}
                style={{ marginTop: 30 }}
              />
            </View>

          </Dialog>
        }
      </BasicScreen>
    </>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: 0
  },
  mainContainer: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 20
  },
  refundAmountContainer: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderColor: theme.COLORS.ERROR,
    borderWidth: 3,
    borderStyle: 'solid',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 0,
    marginTop: 20
  },
  refundAmountContainerInvalid: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderColor: '#808080',
    borderWidth: 3,
    borderStyle: 'solid',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 0,
    marginTop: 20
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
  inputAmount: {
    ...fontStyles.bold,
    fontSize: 22,
    color: theme.COLORS.ERROR,
    textAlign: 'right',
    paddingTop: 0,
    paddingBottom: 0
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
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  balanceRow: {
    position: 'absolute',
    top: 58,
    left: 65,
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
  groupContainer: {
    width: '100%',
    backgroundColor: '#F7F7F7',
    borderWidth: 0.5,
    borderColor: theme.COLORS.BORDER_COLOR,
    borderRadius: 16,
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  rowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2
  },
  rowTitle: {
    ...fontStyles.regular,
    fontSize: 14
  },
  rowDescription: {
    ...fontStyles.regular,
    fontSize: 14,
    color: theme.COLORS.BLUE
  },
  dialogStyle: {
    backgroundColor: theme.COLORS.WHITE,
    borderColor: theme.COLORS.BORDER_COLOR,
    borderWidth: 1,
    borderRadius: 50,
    marginLeft: 0,
    marginRight: 0
  },
  noteInputContainerStyle: {
    marginTop: 20,
    backgroundColor: '#C7C9E8',
    borderColor: theme.COLORS.BORDER_COLOR,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  refundButton: {
    marginTop: 20,
    alignSelf: 'center'
  },
  refundButtonDisabled: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: '#808080'
  }
});

export default RefundTransaction;