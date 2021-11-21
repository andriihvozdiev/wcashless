import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, Dimensions, View, Image, TouchableOpacity, Linking } from 'react-native';
import { Input } from 'react-native-elements';
import moment from 'moment';
import { useIsFocused } from '@react-navigation/native';
import { LeafletView } from 'react-native-leaflet-view';
import parsePhoneNumber from 'libphonenumber-js'

import { store } from '../../redux/Store';
import LoadingIndicator from '../../components/LoadingIndicator';
import BasicScreen from '../../components/BasicScreen';
import { fontStyles } from '../../styles/styles';
import BlueButton from '../../components/BlueButton';
import { businessApiService } from '../../service';
import theme from '../../constants/Theme';

const { width, height } = Dimensions.get('screen');

const pencil_icon = require('../../assets/images/pencil.png');
const arrow_next = require('../../assets/images/arrow_next.png');
const email_icon = require('../../assets/images/email.png');
const download_icon = require('../../assets/images/download.png');
const rating_icon = require('../../assets/images/rating.png');
const rating_active_icon = require('../../assets/images/rating_yellow.png');

const category_bar = require('../../assets/category/category_bar.png');

const TransactionDetail = ({
  navigation, route
}) => {
  const scrollViewRef = useRef();

  const [isAdmin, setAdmin] = useState(store.getState().user?.role?.type == 'superadmin');
  const [role, setRole] = useState(store.getState().role?.role);

  const [isLoading, setLoading] = useState(false);
  const [transaction, setTransaction] = useState(route.params?.transaction);
  const [isRefundable, setRefundable] = useState(false);

  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [isEditNote, setEditNote] = useState(false);
  const [note, setNote] = useState('');

  const isFocused = useIsFocused();

  useEffect(() => {
    getTransactionDetail();    
  }, [isFocused]);

  const getTransactionDetail = async () => {
    setLoading(true);
    const result = await businessApiService.getTransaction(transaction.id);
    setLoading(false);
    if (result.error) {
      return;
    }
    if (result.data?.data) {
      const transaction = result.data?.data;
      setTransaction(transaction);
      setNote(transaction.data?.note);
      setRefundable(checkRefundable(transaction));

      setAddress(`${transaction?.business?.address}, ${transaction?.business?.city}, ${transaction?.business?.country}`);
      
      if (transaction?.author?.phone) {
        setPhoneNumber(parsePhoneNumber(transaction?.author?.phone)?.formatInternational());
      }      
    }
    
  }

  const checkRefundable = (transaction) => {
    if (transaction.type === 'payment') {
      
      if (transaction.refer_tx?.amount) {
        if (transaction?.refer_tx?.amount == transaction?.amount) {
          return false;
        }
      }
      
      if (isAdmin || role === 'Owner' || role === 'Manager') {
        return true;
      }
    }
    return false;
  }

  const onRefund = async () => {
    navigation.navigate('RefundTransaction', { transaction });
  }

  const onAddNote = () => {
    setEditNote(true);
  }

  const saveNote = async () => {
    setEditNote(false);
    const param = {
      data: {
        ...transaction.data,
        note: note
      }
    }
    setLoading(true);
    const result = await businessApiService.updateTransaction(transaction.id, param);
    setLoading(false);

    if (result?.error && result?.data?.data) {
      setTransaction(result.data.data);
    }

  }

  return (
    <BasicScreen
      scrollContainerStyle={{paddingHorizontal: 24}}
      scrollViewRef={scrollViewRef}
    >

      {isLoading &&
        <LoadingIndicator />
      }
      <View style={{width: '100%'}}>

        {/* {(transaction.type == 'payment') ?
          <Text style={styles.subTitle}>
            payment {(transaction.data?.refundId) && '(refunded)'}
          </Text>
          :
          <Text style={styles.subTitle}>
            {transaction.type} {(transaction.type == 'refund' && transaction.data?.transactionId) && `for #${transaction.data?.transactionId?.toString().padStart(5, '0')}`}
          </Text>
        } */}
        
        {(transaction.type == 'refund') ?
          <View style={{ flexDirection: 'column' }}>
            <Text style={{ ...fontStyles.bold, fontSize: 28, color: theme.COLORS.ERROR }}>-MXW {transaction?.amount}</Text>
          </View>
          :
          <View style={{ flexDirection: 'column' }}>
            <Text style={{ ...fontStyles.bold, fontSize: 28 }}>+MXW {transaction?.amount}</Text>
            <Text style={{ ...fontStyles.regular, fontSize: 17 }}>{`(MXW) ${transaction?.data?.tip || 0} TIP amount`}</Text>
          </View>
        }

        <View style={styles.rowItem}>
          <View style={{flexDirection: 'column'}}>
            <Text style={{ ...fontStyles.bold, fontSize: 20, marginTop: 12 }}>{transaction?.business?.name}</Text>
            <Text style={{ ...fontStyles.regular, fontSize: 16 }}>{moment(transaction?.createdAt).format('YY-MM-DD HH:mm')}</Text>
          </View>
          <Image source={category_bar} style={{width: 40, height: 40, resizeMode: 'contain'}}/>
        </View>
        
        <View style={{height: 100, marginTop: 20}}>
          <LeafletView />
        </View>

        <View style={{...styles.rowItem, marginTop: 10}}>
          <View style={{flexDirection: 'column'}}>
            <Text style={{...fontStyles.regular, fontSize: 16}}>{address}</Text>
            <Text style={{...fontStyles.regular, fontSize: 16}}>{phoneNumber}</Text>
          </View>
          <Image source={arrow_next} style={{ width: 12, height: 12 }}></Image>
        </View>
        

        <View style={styles.groupContainer}>
          <View style={styles.rowItem}>
            <Text style={styles.rowTitle}>Transaction ID</Text>
            <Text style={styles.rowDescription}>{transaction?.id}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowTitle}>wcashless device type</Text>
            <Text style={styles.rowDescription}>{transaction?.data?.type}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowTitle}>Wristband ID</Text>
            <Text style={styles.rowDescription}>{transaction?.data?.wandoTagId}</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowTitle}>Customer email</Text>
            <Text style={styles.rowDescription}>
              {(transaction?.type?.toLowerCase() == 'payment') ? transaction?.fromAccount?.email: transaction?.toAccount?.email}
            </Text>
          </View>
        </View>

        <View style={{ ...styles.groupContainer, height: 50, ...styles.rowItem }}>
          <Text style={styles.rowTitle}>Category</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* <Image source={pencil_icon} style={{ width: 20, height: 20, marginRight: 8 }} /> */}
            <Text style={styles.rowDescription}>Restaurant</Text>
          </View>
        </View>

        <View style={{ ...styles.groupContainer, paddingHorizontal: 0 }}>
          <View style={{...styles.rowItem, paddingHorizontal: 16}}>
            <Text style={{ ...styles.rowTitle, flex: 1 }} numberOfLines={1}>Note</Text>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={isEditNote ? saveNote : onAddNote}>
              {!isEditNote && <Image source={pencil_icon} style={{ width: 20, height: 20, marginRight: 8 }} />}
              <Text style={styles.rowDescription}>{isEditNote ? 'Save': 'Add note'}</Text>
            </TouchableOpacity>
          </View>
          
          <Input
            inputContainerStyle={{borderBottomColor: 'transparent', paddingHorizontal: 4}}
            style={{ textAlignVertical: 'top', ...fontStyles.regular, fontSize: 16 }}
            multiline={true}
            numberOfLines={2}
            placeholder='Any notes will be shown here...'
            value={note}
            errorStyle={{height: 0}}
            onChange={(event) => {
              setNote(event.nativeEvent.text)
            }}
            editable={isEditNote}
          />
        </View>

        <View style={{ ...styles.groupContainer, height: 50, ...styles.rowItem }}>
          <Text style={styles.rowTitle}>Your rating from user</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Image source={(transaction?.rating && transaction.rating > 0) ? rating_active_icon : rating_icon} style={styles.ratingImage}/>
            <Image source={(transaction?.rating && transaction.rating > 1) ? rating_active_icon : rating_icon} style={styles.ratingImage}/>
            <Image source={(transaction?.rating && transaction.rating > 2) ? rating_active_icon : rating_icon} style={styles.ratingImage}/>
            <Image source={(transaction?.rating && transaction.rating > 3) ? rating_active_icon : rating_icon} style={styles.ratingImage}/>
            <Image source={(transaction?.rating && transaction.rating > 4) ? rating_active_icon : rating_icon} style={styles.ratingImage}/>
          </View>
        </View>

        <Text style={{ ...fontStyles.regular, fontSize: 15, paddingHorizontal: 16, marginTop: 20}}>Customer review</Text>
        <View style={{...styles.groupContainer, paddingHorizontal: 0, marginTop: 4}}>
          <View style={{...styles.rowItem, alignItems: 'baseline', paddingHorizontal: 16}}>
            <Text style={{...styles.rowDescription}}>Customer Name</Text>
            <View style={{flexDirection: 'column', alignItems: 'flex-end'}}>
              <Text style={{...styles.rowDescription}}>MM,DD,YY - 10:00</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image source={(transaction?.rating && transaction.rating > 0) ? rating_active_icon : rating_icon} style={styles.ratingImage}/>
                <Image source={(transaction?.rating && transaction.rating > 1) ? rating_active_icon : rating_icon} style={styles.ratingImage}/>
                <Image source={(transaction?.rating && transaction.rating > 2) ? rating_active_icon : rating_icon} style={styles.ratingImage}/>
                <Image source={(transaction?.rating && transaction.rating > 3) ? rating_active_icon : rating_icon} style={styles.ratingImage}/>
                <Image source={(transaction?.rating && transaction.rating > 4) ? rating_active_icon : rating_icon} style={styles.ratingImage}/>
              </View>
            </View>
          </View>

          <Input
            inputContainerStyle={{borderBottomColor: 'transparent', paddingHorizontal: 4}}
            style={{ textAlignVertical: 'top', ...fontStyles.regular, fontSize: 16 }}
            multiline={true}
            numberOfLines={2}
            placeholder='Any customer review will be shown here...'
            value={transaction?.reviews}
            errorStyle={{height: 0}}
            editable={false}
          />
          <BlueButton
            title="Reply"
            width={80}
            height={22}
            titleStyle={{ ...fontStyles.semibold, fontSize: 12, color: 'white' }}
            style={{alignSelf: 'flex-end', marginEnd: 16}}
            onPressListener={() => {}}
          />
        </View>

        <View style={styles.bottomContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ ...fontStyles.regular, fontSize: 15 }}>Choose an option</Text>

            <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
              {isRefundable &&
                <BlueButton
                  title="Refund"
                  width={80}
                  height={22}
                  fontSize={12}
                  titleStyle={{ ...fontStyles.semibold, color: 'white' }}
                  onPressListener={onRefund}
                  style={{ marginBottom: 8, borderWidth: 0 }}

                />
              }
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

      </View>

    </BasicScreen>
  );
}

const styles = StyleSheet.create({
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
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2
  },
  rowTitle: {
    ...fontStyles.regular,
    fontSize: 14,
    color: 'black'
  },
  rowDescription: {
    ...fontStyles.regular,
    fontSize: 14,
    color: theme.COLORS.BLUE
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
  ratingImage: {
    width: 15, 
    height: 15, 
    marginLeft: 2,
    resizeMode: 'contain'
  }
});

export default TransactionDetail;