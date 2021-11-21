import React from 'react';
import {
    StyleSheet, TouchableOpacity, ImageBackground, Image
} from 'react-native';
import { Text } from 'react-native-elements';

const background = require('../assets/images/sq_button.png');
const activeBackground = require('../assets/images/sq_button_active.png');

const SquareButton = ({
    title,
    defaultIcon,
    activeIcon,
    enabled = false,
    onPressListener,
    width = 90,
    height = 90,
    iconSize = 70,
    fontSize = 15,
    iconSpace = 16,
    containerStyle = {}
}) => {

    return (
        <TouchableOpacity
            style={{ width: width, ...containerStyle }}
            disabled={!enabled}
            onPress={onPressListener}>
            {defaultIcon == null ? (
                <ImageBackground source={enabled ? activeBackground : background} style={{ ...styles.buttonBg, justifyContent: 'center', width: width, height: height }}
                    imageStyle={{ resizeMode: 'stretch' }}>
                    <Text style={{ ...styles.buttonTitle, fontSize: fontSize }}>{title}</Text>
                </ImageBackground>
            ) : (
                <ImageBackground source={enabled ? activeBackground : background} style={{ ...styles.buttonBg, width: width, height: height }}
                    imageStyle={{ resizeMode: 'stretch' }}>
                    <Image source={enabled ? activeIcon : defaultIcon} style={{ ...styles.buttonIcon, width: iconSize, height: iconSize }}></Image>
                    {title && <Text style={{ ...styles.buttonTitle, fontSize: fontSize, marginTop: iconSpace }}>{title}</Text>}
                </ImageBackground>
            )}

        </TouchableOpacity>
    );

}

const styles = StyleSheet.create({
    buttonBg: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    buttonIcon: {
        resizeMode: 'contain',
    },
    buttonTitle: {
        fontFamily: 'SourceSansPro-Bold',
        color: 'white'
    },
});

export default SquareButton;