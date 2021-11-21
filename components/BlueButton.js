import React from 'react';
import {
    StyleSheet, TouchableOpacity
} from 'react-native';
import { Text } from 'react-native-elements';
import { fontStyles } from '../styles/styles';
import theme from '../constants/Theme';

const BlueButton = ({
    title,
    onPressListener,
    width = 280,
    height = 45,
    fontSize = 18,
    titleStyle = {},
    style
}) => {

    return (
        <TouchableOpacity
            style={{ ...styles.buttonBg, width: width, height: height, ...style }}
            onPress={onPressListener}>

            <Text style={{ ...styles.buttonTitle, fontSize: fontSize, ...titleStyle }}>{title}</Text>
        </TouchableOpacity>
    );

}

const styles = StyleSheet.create({
    buttonBg: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.COLORS.BLUE,
        borderRadius: 30,
    },
    buttonTitle: {
        ...fontStyles.bold,
        color: 'white'
    },
});

export default BlueButton;