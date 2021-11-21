import React, { useState, useEffect } from 'react';
import {
  Alert, View, Image, StyleSheet,
  Dimensions, Platform
} from 'react-native';
import { Text } from 'react-native-elements';
import NfcManager, { NfcEvents } from 'react-native-nfc-manager';
import NfcProxy from '../NfcProxy';
import { commonStyles, fontStyles } from '../styles/styles';

const Sound = require('react-native-sound');

const { width, height } = Dimensions.get('screen');
const scanImage = require('../assets/scan-ready.gif');
const scanedImage = require('../assets/scan-success.gif');

const ScanBracelet = ({
  onFound,
  onFailed,
}) => {

  const [sound, setSound] = useState();
  const [found, setFound] = useState(false);

  async function playSound() {
    const sound = new Sound('../assets/sound/diong.mp3', Sound.MAIN_BUNDLE);
    setSound(sound);
    await sound.play();
  }

  useEffect(() => {
    return sound
      ? () => {
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  useEffect(() => {
    async function initNfc() {
      try {
        const success = await NfcProxy.init();
        if (!success) {
          Alert.alert(
            'wcashless',
            "\nYour device does not support NFC.".toLowerCase(),
            [
              { text: "ok", onPress: () => onFailed() }
            ],
            { cancelable: false }
          );
          return;
        }

        readNFC();

      } catch (ex) {
        console.warn(ex);
        Alert.alert(
          'wcashless',
          "\nYour device is failed to init NFC.".toLowerCase(),
          [
            { text: "ok", onPress: () => onFailed() }
          ],
          { cancelable: false }
        );
      }
    }

    initNfc();

    return () => {
      NfcManager.setEventListener(NfcEvents.SessionClosed, () => {
        NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
        NfcManager.setEventListener(NfcEvents.SessionClosed, null);
      });
    }
  }, [])

  const readNFC = async () => {
    const enabled = await NfcProxy.isEnabled()
    if (!enabled) {
      Alert.alert(
        'wcashless',
        "\nNFC is not available. Please active it on your phone and allow NFC permission for the app.".toLowerCase(),
        [
          { text: "ok", onPress: () => onFailed() }
        ],
        { cancelable: false }
      );
      return;
    }
    const tag = await NfcProxy.readTag();

    // Alert.alert(
    //   'wcashless',
    //   JSON.stringify(tag),
    //   [
    //     { text: "ok", onPress: () => onFailed() }
    //   ],
    //   { cancelable: false }
    // );
    // return;

    const rawTagId = tag?.id || tag;
    if (rawTagId) {
      const tagId = `${rawTagId}`
      onReadNFC(tagId);
    } else {
      // setStatus('error');
    }
  }

  const onReadNFC = (tagId) => {
    playSound();
    const wandoTagId = `${tagId}`;
    onFound && onFound(wandoTagId);
    setFound(true);
  }

  const setScanText = () => {
    if (found) {
      return 'Success'
    } else {
      return 'Please tap NFC tags.';
    }
  }

  return (
    <View style={{ width: '100%', height: '100%', backgroundColor: '#484848ee' }}>
      <Text style={{ ...fontStyles.bold, fontSize: 32, textAlign: 'center', color: 'white', marginTop: 120, paddingHorizontal: 50 }}>
        Place digital wristband, wallet or card near NFC reader on your phone
      </Text>
      {Platform.OS === 'android' &&
        <View style={styles.scanContainer}>
          {found === false &&
            <Text style={styles.titleText}>Ready to Scan</Text>
          }
          <Image source={found === false ? scanImage : scanedImage} style={styles.scanImage} />
          <Text style={{ ...fontStyles.semibold, textAlign: 'center', marginTop: 20, color: 'black' }}>
            {setScanText()}
          </Text>
        </View>
      }
    </View >
  );
}

const styles = StyleSheet.create({
  scanContainer: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    width: '100%',
    paddingTop: 24,
    paddingBottom: 100,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderColor: '#ccc',
    borderWidth: 1
  },
  titleText: {
    textAlign: 'center',
    color: 'grey',
    fontSize: 20,
  },
  scanImage: {
    marginTop: 20,
    width: width * 0.5,
    marginLeft: width * 0.01,
    height: 150,
    resizeMode: 'contain',
  },
});

export default ScanBracelet;