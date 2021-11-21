import React from 'react';
import {
    StyleSheet, TouchableOpacity, ImageBackground, Image
} from 'react-native';

const buttonBackground = require('../assets/images/round_bg.png');

const RoundButton = ({
    icon,
    onPressListener,
    width = 25,
    height = 25,
    iconSize = 10,
}) => {

    return (
        <TouchableOpacity
            style={{ width: width }}
            onPress={onPressListener}>
            <ImageBackground source={buttonBackground} style={{ ...styles.buttonBg, width: width, height: height }}
                imageStyle={{ resizeMode: 'stretch' }}>
                <Image source={icon} style={{ ...styles.buttonIcon, width: iconSize, height: iconSize }}></Image>
            </ImageBackground>

        </TouchableOpacity>
    );

}

const styles = StyleSheet.create({
    buttonBg: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    buttonIcon: {
        resizeMode: 'contain',
    },
});

export default RoundButton;