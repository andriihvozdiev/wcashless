import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, Dimensions, Alert
} from 'react-native';
import { Text } from 'react-native-elements';

import EmptyGap from '../../components/EmptyGap';
import BasicScreen from '../../components/BasicScreen';
import LoadingIndicator from '../../components/LoadingIndicator';
import { businessApiService } from '../../service';
import RoundButton from '../../components/RoundButton';
import { fontStyles, textStyles } from '../../styles/styles';
import theme from '../../constants/Theme';

const { width, height } = Dimensions.get('screen');

const close_icon = require('../../assets/images/close_w.png');


const PairedDevices = ({
  navigation, route
}) => {

  const scrollViewRef = useRef();

  const [customer, setCustomer] = useState(route?.params?.user);
  const [braceletId, setBraceletId] = useState('');
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    console.log(customer)
  }, []);

  const deleteBracelet = async (bracelet) => {
    setLoading(true);
    const braceletId = bracelet?.uid;
    setBraceletId(braceletId);
    const response = await businessApiService.deleteBracelet(braceletId);
    setLoading(false);

    if (response.error) {
      const message = response.data;
      Alert.alert(
        'Unpair failed',
        message,
        [
          { text: "ok", onPress: () => { } },
        ],
        { cancelable: true }
      );
      return;
    }

    const message = braceletId + ' was un-paired successfully.'
    Alert.alert(
      'Unpair success',
      message,
      [
        { text: "ok", onPress: () => { loadBracelets() } },
      ],
      { cancelable: true }
    );

  }

  const loadBracelets = async () => {
    setLoading(true);
    const result = await businessApiService.getCustomerAccount(customer?.email);
    setLoading(false);

    if (result.error) {
      setCustomer();
    } else {
      const users = result.data.data || [];
      if (users.length == 0) {
        showError('User not found.');
        return;
      }
      setCustomer(users[0]);
    }
  }

  return (
    <BasicScreen
      scrollContainerStyle={styles.scrollView}
      scrollViewRef={scrollViewRef}
      style={{ marginTop: 0, paddingTop: 96, backgroundColor: 'transparent' }}
    >

      {isLoading &&
        <LoadingIndicator />
      }

      <View style={styles.nameRow}>
        <Text style={{ ...fontStyles.bold, fontSize: 17 }}>
          User Name
        </Text>
        <Text numberOfLines={1} style={{ ...fontStyles.regular, fontSize: 16, marginLeft: 10, color: theme.COLORS.BLUE, flex: 1 }}>
          {customer?.email}
        </Text>
      </View>

      <Text style={{ ...fontStyles.regular, fontSize: 17, alignSelf: 'flex-start', marginLeft: 12, marginTop: 30 }}>
        All paired devices
      </Text>

      {customer?.bracelets?.length == 0 &&
        <Text style={{ ...fontStyles.regular, fontSize: 17, marginTop: 50 }}>There is no paired devices.</Text>
      }

      {customer?.bracelets?.map(bracelet => (
        <View key={bracelet.id} style={styles.rowItem}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }} >
                <Text style={{ ...textStyles.mediumText }}>Type : </Text>
                <Text style={styles.descriptionText}>Wristband</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <Text style={{ ...textStyles.mediumText }}>ID : </Text>
                <Text style={styles.descriptionText}>{bracelet?.uid}</Text>
              </View>
            </View>

            <RoundButton icon={close_icon} onPressListener={() => { deleteBracelet(bracelet); }} />
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Text style={{ ...textStyles.mediumText }}>Paired At : </Text>
            <Text style={styles.descriptionText}>{bracelet?.business?.name}</Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <Text style={{ ...textStyles.mediumText }}>Date paired : </Text>
            <Text style={styles.descriptionText}>{bracelet?.pairedAt}</Text>
          </View>

        </View>
      ))}

      <EmptyGap />

    </BasicScreen>
  );
}

const styles = StyleSheet.create({
  nameRow: {
    width: width * 0.85,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#C7C9E8',
    borderColor: '#1A1A1A',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 10
  },
  scrollView: {},
  rowItem: {
    width: width * 0.85,
    marginTop: 12,
    backgroundColor: '#F7F7F7',
    borderColor: '#1A1A1A',
    borderWidth: 1,
    borderRadius: 12,
    padding: 8
  },
  descriptionText: {
    ...fontStyles.regular,
    fontSize: 15,
    color: theme.COLORS.BLUE
  }
});

export default PairedDevices;