import React from 'react';
import {
    StyleSheet, TouchableOpacity, ImageBackground, Image
} from 'react-native';
import { Text } from 'react-native-elements';
import { fontStyles } from '../styles/styles';

const buttonBackground = require('../assets/images/button_bg.png');

const CustomButton = ({
    title,
    icon,
    onPressListener,
    width = 200,
    height = 50,
    iconSize = 25,
    fontSize = 18,
    paddingLeft = 20,
    iconSpace = 30,
    containerStyle
}) => {

    return (
        <TouchableOpacity
            style={{ width: width, marginTop: 36, ...containerStyle }}
            onPress={onPressListener}>
            {icon == null ? (
                <ImageBackground source={buttonBackground} style={{ ...styles.buttonBg, justifyContent: 'center', width: width, height: height }}
                    imageStyle={{ resizeMode: 'stretch' }}>
                    <Text style={{ ...styles.buttonTitle, fontSize: fontSize }}>{title}</Text>
                </ImageBackground>
            ) : (
                <ImageBackground source={buttonBackground} style={{ ...styles.buttonBg, width: width, height: height, paddingLeft: paddingLeft }}
                    imageStyle={{ resizeMode: 'stretch' }}>
                    <Image source={icon} style={{ ...styles.buttonIcon, width: iconSize, height: iconSize, marginRight: iconSpace }}></Image>
                    <Text style={{ ...styles.buttonTitle, fontSize: fontSize }}>{title}</Text>
                </ImageBackground>
            )}

        </TouchableOpacity>
    );

}

const styles = StyleSheet.create({
    buttonBg: {
        alignItems: 'center',
        flexDirection: 'row',
    },
    buttonIcon: {
        resizeMode: 'contain',
    },
    buttonTitle: {
        ...fontStyles.bold,
        color: 'white'
    },
});

export default CustomButton;