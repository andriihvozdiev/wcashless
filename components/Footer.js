import React from 'react';
import {
  Image, TouchableOpacity, StyleSheet, Platform, Dimensions,
  View
} from 'react-native';

import theme from '../constants/Theme';

const { height, width } = Dimensions.get('window');
const iPhoneX = () => Platform.OS === 'ios' && (height === 812 || width === 812 || height === 896 || width === 896);

const logo = require('../assets/logo/wc_black_lb.png');
const logo_light = require('../assets/logo/wc_white_lb.png');

class Footer extends React.Component {

  handleLeftPress = () => {
    const { back, navigation } = this.props;
    return (back && navigation.goBack());
  }

  handleRightPress = () => {
    const { right, onRightPress } = this.props;
    return (right && onRightPress && onRightPress());
  }

  render() {
    const { light } = this.props;

    return (
      <View style={styles.container}>
        <Image source={!!light ? logo_light : logo} style={styles.logo} />
      </View>
    );
  }
}

export default Footer;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: width * 0.9,
    marginTop: 20,
    marginBottom: 0
  },
  logo: {
    width: width * 0.6,
    height: 64,
    resizeMode: 'contain'
  },
});