import React, { useRef } from 'react';
import {
  View, Image, StyleSheet, ScrollView, StatusBar,
  Dimensions, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback,
  useColorScheme
} from 'react-native';
import { withTheme } from 'react-native-elements';
import Footer from '../components/Footer';

const { width, height } = Dimensions.get('screen');
const bg = require('../assets/bg.png');
const bg_light = require('../assets/bg_light.png');

const BasicScreen = ({
  header,
  children,
  style,
  scrollContainerStyle,
  scrollViewRef,
  hideBackground = false,
  lightBg = true,
  disabledScroll = false,
  showBottomLogo = false
}) => {

  const innerScrollViewRef = useRef();
  const colorScheme = useColorScheme();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : null}
      style={{ ...styles.contentView, ...(style || []) }}
      enabled
    >
      {hideBackground == false ?
        <View style={styles.bgContainer}>
          {/* <Image source={colorScheme === 'light' ? bg_light : bg} style={styles.bgImage} /> */}
          <Image source={lightBg ? bg_light : bg} style={styles.bgImage} />
        </View> : null
      }

      {!!header && header}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {disabledScroll == true ?

          <View style={{ ...styles.scrollView, ...styles.innerView, ...(scrollContainerStyle || []) }}>
            {children}
            {showBottomLogo && <Footer light={true} />}
          </View>
          :
          <ScrollView
            ref={scrollViewRef || innerScrollViewRef}
            style={{ ...styles.scrollView, ...(scrollContainerStyle || []) }}
            contentContainerStyle={styles.innerView}
          >

            {children}

            {showBottomLogo && <Footer light={true} />}

          </ScrollView>
        }

      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contentView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 90,
  },
  bgContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  bgImage: {
    width: '100%',
    height: '100%'
  },
  title: {
    textAlign: 'left', alignSelf: 'flex-start', marginLeft: 32
  },
  scrollView: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 0,
    // flexGrow: 1,
  },
  innerView: {
    width: '100%',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20
  },
});

export default withTheme(BasicScreen, '');