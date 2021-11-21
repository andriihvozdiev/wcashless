import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  TouchableOpacity, StyleSheet, Platform, Dimensions,
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Header as HeaderRNE } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import theme from '../constants/Theme';

import { store } from '../redux/Store';
import { fontStyles } from '../styles/styles';

const { height, width } = Dimensions.get('window');
const iPhoneX = () => Platform.OS === 'ios' && (height === 812 || width === 812 || height === 896 || width === 896);

const avatar = require('../assets/images/avatar.png');

const Header = ({
  title, showProfile = false, back = false
}) => {

  const [profilePicture, setProfilePicture] = useState(store.getState().user?.account?.profilePicture);

  const navigation = useNavigation();

  useEffect(() => {
  }, [])

  const backPressed = () => {
    navigation.goBack()
  }

  const leftComponent = () => {
    return (
      back ?
        <TouchableOpacity
          onPress={() => { backPressed() }}
          style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
          <Icon name="chevron-left" size={20} color="#000"></Icon>
        </TouchableOpacity>
        :
        <></>
    );
  }

  const rightComponent = () => {
    if (showProfile) {
      return (
        <TouchableOpacity onPress={() => {
          navigation.navigate('MyProfile');
        }}>
          {profilePicture !== undefined && profilePicture !== null ?
            <Image source={{ uri: profilePicture?.url }} style={styles.avatar}></Image>
            :
            <Image source={avatar} style={styles.avatar}></Image>
          }
        </TouchableOpacity>
      );
    }
  }

  return (
    <HeaderRNE
      statusBarProps={{ barStyle: 'dark-content', backgroundColor: '#FFF' }}
      containerStyle={{ ...styles.navbar }}
      barStyle="dark-content"
      centerComponent={{ text: title, style: { ...styles.title }, numberOfLines: 2 }}
      rightComponent={rightComponent}
      leftComponent={leftComponent}
      centerContainerStyle={{ justifyContent: 'center' }}
      leftContainerStyle={{ marginRight: -30 }}
    />
  )

}

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: 'transparent',
    color: theme.COLORS.BLACK,
    paddingVertical: 0,
    // paddingBottom: theme.SIZES.BASE * 1.5,
    // paddingTop: iPhoneX ? theme.SIZES.BASE * 4 : theme.SIZES.BASE,
    height: 90,
    borderBottomWidth: 0,
  },
  title: {
    ...fontStyles.capitol,
    fontSize: 20,
    color: theme.COLORS.BLACK,
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderColor: 'grey',
    borderWidth: 1,
    overflow: 'hidden'
  },
});

export default Header;