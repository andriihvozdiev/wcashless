import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity, StyleSheet, View, Dimensions,
  Image, ImageBackground, Alert
} from 'react-native';
import { Text } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import theme from '../constants/Theme';

import { store } from '../redux/Store';
import { fontStyles, commonStyles } from '../styles/styles';
import ImagePickerDialog from './ImagePickerDialog';
import { logoutUser, saveBusiness, saveBusinessMember, saveUser } from '../redux/actions/UserActions';
import LoadingIndicator from './LoadingIndicator';
import { businessApiService } from '../service';

const { height, width } = Dimensions.get('window');

const business_logo = require('../assets/logo/logo_bg.png');
const camera_w = require('../assets/images/camera_w.png');

const BusinessHeader = ({
  title, description
}) => {

  const navigation = useNavigation();

  const [isLoading, setLoading] = useState(false);
  const [imagePicker, setImagePicker] = useState(false);

  const [business, setBusiness] = useState(store.getState().business);
  const [businessPhoto, setBusinessPhoto] = useState(store.getState().business?.photo);

  useEffect(() => {

  }, [])

  const getBusinessInfo = async () => {
    const businessResult = await businessApiService.getBusinessInfo();
    if (!businessResult.error && businessResult.data) {
      const businessData = businessResult.data.data[0];
      if (businessData) {
        saveBusinessMember(businessData);
        saveBusiness(businessData.business);
      }
    }
  }

  const selectImageAsset = async (asset) => {
    // upload image
    if (!asset) return;

    const file = {
      uri: asset.uri,
      name: asset.fileName,
      type: asset.type
    }
    setLoading(true);
    const uploadResult = await businessApiService.uploadFile(file);
    setLoading(false);
    if (!uploadResult.error && uploadResult.data != null) {
      const photo = uploadResult.data;
      await updateBusinessPhoto(photo);
    }
  }

  const updateBusinessPhoto = async (photo) => {
    const params = {
      data: {
        photo: photo?.id
      }
    }

    setLoading(true);
    const result = await businessApiService.updateBusiness(business?.id, params);
    setLoading(false);

    if (!result.error) {
      setBusinessPhoto(photo);
      getBusinessInfo();
    } else {
      if (result.data?.error?.status == 401) {
        showNormalAlert('Invalid User', 'You account session has been expired. Please login again', () => {
          logoutUser();
          navigation.replace('Login');
        });
      } else {
        showNormalAlert('Update failed', result.data?.error?.message);
      }
    }
  }

  const showNormalAlert = (title, message, okClicked) => {
    Alert.alert(
      title,
      message,
      [
        { text: "ok", onPress: () => { okClicked ? okClicked() : null } }
      ],
      { cancelable: true }
    );
  }

  return (
    <>
      {isLoading && <LoadingIndicator />}
      <View style={{ width: '95%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'column', marginTop: 24 }}>
          <Text style={{ ...commonStyles.headerTitle, alignSelf: 'flex-start', marginStart: 12 }}>
            {title}
          </Text>
          <Text style={{ ...fontStyles.semibold, fontSize: 15, alignSelf: 'flex-start', marginStart: 12, color: theme.COLORS.BLUE }}>
            {description}
          </Text>
        </View>

        <ImageBackground source={businessPhoto?.url ? { uri: businessPhoto?.url } : business_logo} style={styles.avatarContainer} imageStyle={styles.avatar}>
          <TouchableOpacity style={styles.cameraButtonContainer} onPress={() => { setImagePicker(true) }}>
            <Image source={camera_w} style={styles.cameraIcon}></Image>
          </TouchableOpacity>
        </ImageBackground>
      </View>
      {
        imagePicker &&
        <ImagePickerDialog
          closeDialog={() => setImagePicker(false)}
          onImageAsset={(asset) => { selectImageAsset(asset) }}
        />
      }
    </>
  )

}

const styles = StyleSheet.create({
  avatarContainer: {
    width: 90,
    height: 90,
    justifyContent: 'flex-end',
    alignItems: 'flex-end'
  },
  avatar: {
    borderRadius: 50,
    borderColor: 'grey',
    borderWidth: 1,
  },
  cameraButtonContainer: {
    width: 25,
    height: 25,
    borderRadius: 15,
    backgroundColor: theme.COLORS.BLUE,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cameraIcon: {
    width: 12,
    height: 12,
  },
});

export default BusinessHeader;