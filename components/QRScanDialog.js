import React from 'react';
import { Text, StyleSheet, Dimensions } from 'react-native';
import { Overlay } from 'react-native-elements';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

import { textStyles } from '../styles/styles';
import CustomButton from './CustomButton';


const { height, width } = Dimensions.get('screen');

const QRScanDialog = ({
  onSuccess,
  onCancel
}) => {

  const onQrScan = (event) => {
    onSuccess(event.data);
  }

  return (
    <Overlay
      backdropStyle={{ backgroundColor: '#48484888' }}
      overlayStyle={styles.overlayStyle}
    >
      <QRCodeScanner
        onRead={(e) => onQrScan(e)}
        flashMode={RNCamera.Constants.FlashMode.auto}
        cameraStyle={styles.cameraStyle}
        // topContent={
        //   <Text style={textStyles.smallText}>
        //     Test
        //   </Text>
        // }
        bottomContent={
          <CustomButton
            title='Cancel'
            onPressListener={() => onCancel()}
          />
        }
        bottomViewStyle={styles.bottomViewStyle}
        showMarker={true}
      />
    </Overlay>
  );
}

const styles = StyleSheet.create({
  overlayStyle: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent'
  },
  cameraStyle: {
    height: '100%',
    width: '100%'
  },
  bottomViewStyle: {
    position: 'absolute',
    bottom: 80
  },
});

export default QRScanDialog;