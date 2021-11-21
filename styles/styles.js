import { StyleSheet } from 'react-native';
import theme from '../constants/Theme';

export const fontStyles = StyleSheet.create({
  regular: {
    fontFamily: 'SourceSansPro-Regular',
    color: 'black'
  },
  light: {
    fontFamily: 'SourceSansPro-Light',
    color: 'black'
  },
  bold: {
    fontFamily: 'SourceSansPro-Bold',
    color: 'black'
  },
  semibold: {
    fontFamily: 'SourceSansPro-SemiBold',
    color: 'black'
  },
  black: {
    fontFamily: 'SourceSansPro-Black',
    color: 'black'
  },
  capitol: {
    fontFamily: 'Capitol',
    color: 'black'
  }
});

export const textStyles = StyleSheet.create({
  subTitle: {
    ...fontStyles.semibold,
    alignSelf: 'flex-start',
    fontSize: 16
  },
  normalText: {
    ...fontStyles.regular,
    fontSize: 17
  },
  smallText: {
    ...fontStyles.light,
    fontSize: 15
  },
  mediumText: {
    ...fontStyles.semibold,
    fontSize: 17
  },
});

export const inputStyles = StyleSheet.create({
  container: {
    height: 50,
    marginTop: 12,
    marginBottom: 12,
    paddingStart: 0,
    paddingEnd: 0
  },
  inputContainer: {
    height: 50,
    marginStart: 'auto',
    marginRight: 'auto',
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    paddingLeft: 8,
  },
  labelStyle: {
    ...fontStyles.regular,
    marginStart: 8,
    fontSize: 15,
    color: '#888',
    marginTop: 4,
    marginBottom: 4,
    alignSelf: 'flex-start'
  },
  errorStyle: {
    color: theme.COLORS.ERROR,
    fontSize: 14,
    marginStart: 10
  },
});

export const commonStyles = StyleSheet.create({
  headerTitle: {
    ...fontStyles.bold,
    fontSize: 30,
    textAlign: 'center',
  },
  searchbar: {
    width: '100%',
		height: 40,
		borderRadius: 12,
		backgroundColor: 'white',
		borderWidth: 2,
		borderColor: theme.COLORS.BORDER_COLOR
  },
  searchbarInputStyle: {
    ...fontStyles.regular, 
    fontSize: 16, 
    paddingTop: 0, 
    paddingBottom: 0
  }
});

