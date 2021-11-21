import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, PermissionsAndroid } from 'react-native';
import { Overlay } from 'react-native-elements';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { fontStyles } from '../styles/styles';
import CustomButton from './CustomButton';

const camera_w = require('../assets/images/camera_w.png');
const gallery_w = require('../assets/images/gallery_w.png');

const { height, width } = Dimensions.get('screen');
const ImagePickerDialog = ({
  closeDialog,
  onImageAsset
}) => {

  useEffect(() => {
    requestCameraPermission();
  }, []);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "App Camera Permission",
          message: "App needs access to your camera ",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("Camera permission given");
      } else {
        console.log("Camera permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const selectGalleryImage = async () => {
    closeDialog();
    const options = {
      mediaType: 'photo',
      maxWidth: 500,
      maxHeight: 300
    }
    const result = await launchImageLibrary(options);
    if (result) {
      var asset;
      if (result.assets) {
        asset = result.assets[0];
      }
      onImageAsset(asset);
    }
  }

  const takePhoto = async () => {
    closeDialog();
    const options = {
      mediaType: 'photo',
      maxWidth: 500,
      maxHeight: 300
    }
    const result = await launchCamera(options);
    if (result) {
      var asset;
      if (result.assets) {
        asset = result.assets[0];
      }
      onImageAsset(asset);
    }
  }

  return (
    <Overlay
      backdropStyle={{ backgroundColor: '#48484888' }}
      overlayStyle={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
    >
      <View style={styles.imagePicker}>
        <Text style={{ ...fontStyles.bold, fontSize: 18, marginTop: 30 }}>Add Photo</Text>

        <CustomButton
          title="Camera"
          icon={camera_w}
          iconSize={20}
          iconSpace={20}
          width={150}
          onPressListener={takePhoto} />

        <CustomButton
          title="Gallery"
          icon={gallery_w}
          iconSize={20}
          iconSpace={20}
          width={150}
          onPressListener={selectGalleryImage} />

        <CustomButton
          title="Cancel"
          width={150}
          onPressListener={() => closeDialog()} />
      </View>
    </Overlay>
  );
}

const styles = StyleSheet.create({
  imagePicker: {
    backgroundColor: 'white',
    position: 'absolute',
    top: (height - 350) / 2.0,
    left: width * 0.15,
    width: width * 0.7,
    height: 350,
    alignItems: 'center',
    borderRadius: 20,
    borderColor: 'grey',
    borderWidth: 1
  }
});

export default ImagePickerDialog;