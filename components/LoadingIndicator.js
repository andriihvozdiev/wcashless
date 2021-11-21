import React from 'react';
import { View, StyleSheet, Text, Dimensions, ActivityIndicator } from 'react-native';
import { Overlay } from 'react-native-elements';

const { height, width } = Dimensions.get('screen');
export default class LoadingIndicator extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      error: false,
    };
  }

  render() {
    const { color, textColor, backgroundColor, backDropColor, text, children, width, ...props } = this.props;
    return (
      <Overlay
        backdropStyle={{ backgroundColor: '#48484888' }}
        overlayStyle={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
      >
        <ActivityIndicator
          animating = {true}
          size="large"
          color="#ffffff"
          style = {styles.activityIndicator}
        />
      </Overlay>
    );
  }
}

const styles = StyleSheet.create({
  activityIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 100
  }
});
