import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View, Animated, Image, TouchableOpacity, Alert } from 'react-native';
import { Input, Text } from 'react-native-elements';
import CountryPicker from 'react-native-country-picker-modal'
import {parsePhoneNumber, isValidPhoneNumber} from 'libphonenumber-js'
import * as RNLocalize from "react-native-localize";
import RNCountry from "react-native-countries";

import { businessApiService } from '../service';
import EmptyGap from '../components/EmptyGap';
import BasicScreen from '../components/BasicScreen';
import theme from '../constants/Theme';
import LoadingIndicator from '../components/LoadingIndicator';
import { store } from '../redux/Store';
import { logoutUser, saveUser, saveBusiness, saveRole, saveBusinessMember } from '../redux/actions/UserActions';
import { fontStyles } from '../styles/styles';
import CustomHeader from '../components/CustomHeader';
import BlueButton from '../components/BlueButton';

const dropdown_icon = require('../assets/images/dropdown.png');

const { width, height } = Dimensions.get('screen');
const IMAGE_HEIGHT_SMALL = 48;
const IMAGE_HEIGHT = 96;

const MySettings = ({
	navigation
}) => {
	const scrollViewRef = useRef();

	const firstNameRef = useRef();
	const lastNameRef = useRef();
	const streetAddressRef = useRef();
	const cityRef = useRef();
	const postalCodeRef = useRef();

	const [account, setAccount] = useState(store.getState().user?.account);
	const [countryName, setCountryName] = useState('');
	const [isCountryPicker, showCountryPicker] = useState(false);

	const [countryCode, setCountryCode] = useState((account?.phone && isValidPhoneNumber(account?.phone)) ? parsePhoneNumber(account?.phone)?.country : 'US');
	const [callingCode, setCallingCode] = useState((account?.phone && isValidPhoneNumber(account?.phone)) ? parsePhoneNumber(account?.phone)?.countryCallingCode : '1');
	const [phoneNumber, setPhoneNumber] = useState((account?.phone && isValidPhoneNumber(account?.phone)) ? parsePhoneNumber(account?.phone)?.nationalNumber : '');

	const [errorFN, setErrorFN] = useState();
	const [errorLN, setErrorLN] = useState();
	const [errorPhone, setErrorPhone] = useState();
	const [errorStreetAddress, setErrorStreetAddress] = useState();
	const [errorCity, setErrorCity] = useState();
	const [errorPostalCode, setErrorPostalCode] = useState();

	const [isLoading, setLoading] = useState(false);

	const imageHeight = useRef(new Animated.Value(IMAGE_HEIGHT)).current;
	const imagePadding = useRef(new Animated.Value(IMAGE_HEIGHT_SMALL)).current;

	useEffect(() => {
		setErrorFN('');
		setErrorLN('');

		const countryNamesWithCodes = RNCountry.getCountryNamesWithCodes;
		const countryCode = account?.country ? account.country : RNLocalize.getCountry();
		const country = countryNamesWithCodes.find(element => (element.code == countryCode));
    	setCountryName(country?.name);
	}, [])

	const onSubmit = async () => {
		if (!account.firstName) {
			scrollViewRef.current.scrollTo({ y: 0, animated: true })
			firstNameRef.current.focus();
			return setErrorFN(`First name required`);
		} else {
			setErrorFN();
		}
		if (!account.lastName) {
			scrollViewRef.current.scrollTo({ y: height * 0.1, animated: true })
			lastNameRef.current.focus();
			return setErrorLN(`Last name required`);
		} else {
			setErrorLN();
		}
		if (!account.phone) {
			scrollViewRef.current.scrollTo({ y: height * 0.4, animated: true })
			return setErrorPhone(`Phone number required`);
		} else if (!isValidPhoneNumber(account.phone)) {
			scrollViewRef.current.scrollTo({ y: height * 0.4, animated: true })
			return setErrorPhone(`Phone number is not valid`);
		} else {

			setErrorPhone();
		}
		if (!account.city) {
			scrollViewRef.current.scrollTo({ y: height * 1, animated: true })
			cityRef.current.focus();
			return setErrorCity(`City required`);
		} else {
			setErrorCity();
		}

		setLoading(true);

		try {
			const params = {
				data: account
			}

			const response = await businessApiService.updateAccount(account?.id, params);
			const { error, data } = response;
			if (error) {
				setLoading(false);
				if (error.status === 401) {
					Alert.alert(
						'Failed',
						'Invalid User. Please login again',
						[
							{
								text: "ok",
								onPress: () => {
									logoutUser();
									navigation.replace('Login');
								}
							}
						],
						{ cancelable: true }
					);
				}
				return;
			}
			await getUserProfile();

			scrollViewRef.current.scrollTo({ y: 0, animated: true })

		} catch (error) {
			console.log(error);
		}
		setLoading(false);
	}

	const getUserProfile = async () => {
		setLoading(true);
		const result = await businessApiService.getUser();
		setLoading(false);

		if (result.error || result.data === null) {
			console.log(result.error);
		} else {
			saveUser(result.data);

			const businessResult = await businessApiService.getBusinessInfo();
			if (!businessResult.error && businessResult.data) {
				const businessData = businessResult.data.data[0];
				if (businessData) {
					saveBusinessMember(businessData);
					saveBusiness(businessData.business);
					saveRole(businessData.role, businessData.position);
				}
				showSuccess();
			}
		}
	}

	const showSuccess = () => {
		Alert.alert(
			'Success',
			'Your settings are updated successfully.',
			[
				{ text: "ok", onPress: () => { } }
			],
			{ cancelable: true }
		);
	}

	const handleAccountChange = (name, value) => {
		setAccount({ ...account, [name]: value });
	}

	const onCountrySelect = (country) => {
		showCountryPicker(false);
		handleAccountChange('country', country.cca2);
		setCountryName(country.name);
	}

	const onCallingCodeSelect = (country) => {
		setCountryCode(country.cca2);

		const code = country.callingCode[0];
		setCallingCode(code);
		handleAccountChange('phone', `+${code}${phoneNumber}`);
	}

	return (
		<BasicScreen
			scrollViewRef={scrollViewRef}
			style={{ paddingTop: 50 }}
			header={<CustomHeader title="Edit profile" description={account?.email} />}
		>
			{isLoading &&
				<LoadingIndicator />
			}

			<Text style={styles.subTitle}>Personal information</Text>

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>First Name</Text>
				<Input
					ref={firstNameRef}
					containerStyle={styles.subInputContainer}
					inputContainerStyle={styles.subInput}
					inputStyle={styles.rowDescription}
					keyboardType='ascii-capable'
					placeholder='first name'
					returnKeyType='next'
					textAlign='right'
					errorStyle={{ height: 0 }}
					value={account?.firstName}
					clearButtonMode='while-editing'
					onChange={(event) => {
						handleAccountChange('firstName', event.nativeEvent.text.trim());
					}}
					onSubmitEditing={() => lastNameRef.current.focus()}
				/>
			</View>
			{(errorFN != undefined && errorFN != '') &&
				<Text style={styles.errorStyle}>{errorFN}</Text>
			}

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Last Name</Text>
				<Input
					ref={lastNameRef}
					containerStyle={styles.subInputContainer}
					inputContainerStyle={styles.subInput}
					inputStyle={styles.rowDescription}
					keyboardType='ascii-capable'
					returnKeyType='next'
					textAlign='right'
					placeholder='last name'
					errorStyle={{ height: 0 }}
					value={account?.lastName}
					clearButtonMode='while-editing'
					onChange={(event) => {
						handleAccountChange('lastName', event.nativeEvent.text.trim())
					}}
				/>
			</View>
			{(errorLN != undefined && errorLN != '') && <Text style={styles.errorStyle}>{errorLN}</Text>}

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Email</Text>
				<Text style={styles.rowDescription}>{account?.email}</Text>
			</View>

			<View style={{ flexDirection: 'row', width: '100%', marginTop: 10 }}>
				<View style={{ ...styles.rowItem, width: 120, marginTop: 0 }}>
					<TouchableOpacity style={{ height: 40, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
						<CountryPicker
							countryCode={countryCode}
							withFlag
							onSelect={onCallingCodeSelect}
							containerButtonStyle={{
								height: 40,
								justifyContent: 'center',
								color: 'blue',
								fontSize: 15
							}}
							withFilter={true}
						/>
						<Image source={dropdown_icon} style={{ width: 12, height: 10 }} />
						<Text style={{ ...styles.rowDescription, marginLeft: 12 }}>+{callingCode}</Text>
					</TouchableOpacity>
				</View>

				<View style={{ ...styles.rowItem, marginLeft: 8, flex: 1, marginTop: 0 }}>
					<Input
						containerStyle={styles.subInputContainer}
						inputContainerStyle={styles.subInput}
						inputStyle={styles.rowDescription}
						placeholder='(000) 000 0000'
						keyboardType='phone-pad'
						returnKeyType='next'
						textAlign='right'
						errorStyle={{ height: 0 }}
						value={phoneNumber}
						onChange={(event) => {
							const number = event.nativeEvent.text.trim();
							setPhoneNumber(number)
							handleAccountChange('phone', `+${callingCode}${number}`);
						}}
					/>
				</View>
			</View>
			{(errorPhone != undefined && errorPhone != '') && <Text style={styles.errorStyle}>{errorPhone}</Text>}

			<Text style={styles.subTitle}>Address details</Text>

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Street</Text>
				<Input
					ref={streetAddressRef}
					containerStyle={styles.subInputContainer}
					inputContainerStyle={styles.subInput}
					inputStyle={styles.rowDescription}
					textAlign='right'
					keyboardType='ascii-capable'
					returnKeyType='next'
					placeholder='Address'
					errorStyle={{ height: 0 }}
					value={account?.address}
					clearButtonMode='while-editing'
					onChange={(event) => {
						handleAccountChange('address', event.nativeEvent.text)
					}}
					onSubmitEditing={() => cityRef.current.focus()}
				/>
			</View>
			{(errorStreetAddress != undefined && errorStreetAddress != '') && <Text style={styles.errorStyle}>{errorStreetAddress}</Text>}

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>City/Location</Text>
				<Input
					ref={cityRef}
					containerStyle={styles.subInputContainer}
					inputContainerStyle={styles.subInput}
					inputStyle={styles.rowDescription}
					textAlign='right'
					keyboardType='ascii-capable'
					returnKeyType='next'
					placeholder='City'
					errorStyle={{ height: 0 }}
					value={account?.city}
					clearButtonMode='while-editing'
					onChange={(event) => {
						handleAccountChange('city', event.nativeEvent.text)
					}}
				/>
			</View>
			{(errorCity != undefined && errorCity != '') && <Text style={styles.errorStyle}>{errorCity}</Text>}

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Country</Text>
				<TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={()=> {showCountryPicker(true)}}>
					<CountryPicker
						countryCode={account?.country ? account?.country : RNLocalize.getCountry()}
						withFilter
						withFlag
						onSelect={onCountrySelect}
						containerButtonStyle={{
							height: 40,
							justifyContent: 'center',
							color: 'blue',
							fontSize: 15
						}}
						visible={isCountryPicker}
					/>
					<Text style={styles.rowDescription}>{countryName}</Text>
					<Image source={dropdown_icon} style={{ width: 12, height: 10, marginLeft: 10 }} />
				</TouchableOpacity>
				
			</View>

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Postal Code/ZIP code</Text>
				<Input
					ref={postalCodeRef}
					containerStyle={styles.subInputContainer}
					inputContainerStyle={styles.subInput}
					inputStyle={styles.rowDescription}
					textAlign='right'
					keyboardType='ascii-capable'
					placeholder='Code'
					returnKeyType='next'
					errorStyle={{ height: 0 }}
					value={account?.postalCode}
					clearButtonMode='while-editing'
					onChange={(event) => {
						handleAccountChange('postalCode', event.nativeEvent.text)
					}}
					onSubmitEditing={onSubmit}
				/>
			</View>
			{(errorPostalCode != undefined && errorPostalCode != '') && <Text style={styles.errorStyle}>{errorPostalCode}</Text>}

			<EmptyGap />

			<BlueButton
				title="Submit"
				style={{ marginTop: 30, width: width * 0.8 }}
				onPressListener={onSubmit}
			/>

		</BasicScreen>
	);
}

const styles = StyleSheet.create({
	subTitle: {
		...fontStyles.semibold,
		alignSelf: 'flex-start',
		marginStart: 12,
		marginTop: 24,
		fontSize: 16,
	},
	scrollView: {
		paddingTop: 30
	},
	rowItem: {
		height: 40,
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: 'white',
		borderWidth: 0.5,
		borderColor: theme.COLORS.BORDER_COLOR,
		borderRadius: 8,
		paddingHorizontal: 12,
		marginTop: 10
	},
	rowTitle: {
		...fontStyles.regular,
		fontSize: 15
	},
	rowDescription: {
		...fontStyles.regular,
		fontSize: 15,
		color: theme.COLORS.BLUE
	},
	subInputContainer: {
		flex: 1,
		height: 40,
		paddingLeft: 0,
		paddingRight: 0,
	},
	subInput: {
		height: 40,
		paddingLeft: 8,
		borderBottomColor: 'transparent'
	},
	phoneInput: {
		width: width * 0.8,
		height: 50,
		marginBottom: 24,
		borderColor: '#ccc',
		borderWidth: 1,
		borderStyle: 'solid',
		borderRadius: 8,
		paddingLeft: 8
	},
	errorStyle: {
		alignSelf: 'flex-end',
		color: theme.COLORS.ERROR,
		fontSize: 14,
		marginEnd: 12,
	},
});

export default MySettings;