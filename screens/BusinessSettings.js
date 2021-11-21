import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View, Alert, Animated, Image, TouchableOpacity } from 'react-native';
import { Input, Text } from 'react-native-elements';
import { businessApiService } from '../service';
import CountryPicker from 'react-native-country-picker-modal'
import * as RNLocalize from "react-native-localize";
import RNCountry from "react-native-countries";
import DropDownPicker from 'react-native-dropdown-picker';
import Flag from 'react-native-round-flags';

import { store } from '../redux/Store';
import { logoutUser, saveUser, saveBusiness, saveRole, saveBusinessMember } from '../redux/actions/UserActions';
import EmptyGap from '../components/EmptyGap';
import BasicScreen from '../components/BasicScreen';
import theme from '../constants/Theme';
import LoadingIndicator from '../components/LoadingIndicator';
import { fontStyles } from '../styles/styles';
import BlueButton from '../components/BlueButton';
import BusinessHeader from '../components/BusinessHeader';

const dropdown_icon = require('../assets/images/dropdown.png');

const { width, height } = Dimensions.get('screen');
const IMAGE_HEIGHT_SMALL = 48;
const IMAGE_HEIGHT = 96;

const BusinessSettings = ({
	navigation
}) => {
	const scrollViewRef = useRef();

	const firstNameRef = useRef();
	const lastNameRef = useRef();
	const businessNameRef = useRef();
	const streetAddressRef = useRef();
	const cityRef = useRef();
	const postalCodeRef = useRef();

	const [business, setBusiness] = useState(store.getState().business);
	const [account, setAccount] = useState(store.getState().user?.account);
	const [payoutDetails, setPayoutDetails] = useState({});
	const [countryName, setCountryName] = useState('');
	const [isCountryPicker, showCountryPicker] = useState(false);

	const [payoutCountryName, setPayoutCountryName] = useState('');
	const [isPayoutCountryPicker, showPayoutCountryPicker] = useState(false);

	const [currency, setCurrency] = useState('');
	const [open, setOpen] = useState(false);
	const [currencyItems, setCurrencyItems] = useState([
		{ label: '$MXN', value: 'MXN', icon: () => <Flag code='MX' style={{width: 15, height: 15}}/> },
		{ label: '$USD', value: 'USD', icon: () => <Flag code='US' style={{width: 15, height: 15}}/> },
		{ label: '$GBP', value: 'GBP', icon: () => <Flag code='GB' style={{width: 15, height: 15}}/> },
		{ label: '$EUR', value: 'EUR', icon: () => <Flag code='EU' style={{width: 15, height: 15}}/> },
	]);

	const [errorBusinessName, setErrorBusinessName] = useState();
	const [errorFN, setErrorFN] = useState();
	const [errorLN, setErrorLN] = useState();
	const [errorStreetAddress, setErrorStreetAddress] = useState();
	const [errorCity, setErrorCity] = useState();
	const [errorPostalCode, setErrorPostalCode] = useState();

	const [isLoading, setLoading] = useState(false);

	const imageHeight = useRef(new Animated.Value(IMAGE_HEIGHT)).current;
	const imagePadding = useRef(new Animated.Value(IMAGE_HEIGHT_SMALL)).current;

	useEffect(() => {
		setErrorBusinessName('');
		setErrorFN('');
		setErrorLN('');

		const countryNamesWithCodes = RNCountry.getCountryNamesWithCodes;
		const businessCountryCode = business?.country ? business.country : RNLocalize.getCountry();
		const businessCountry = countryNamesWithCodes.find(element => (element.code == businessCountryCode));
		setCountryName(businessCountry?.name);

		const payoutCountryCode = payoutDetails?.country ? payoutDetails.country : RNLocalize.getCountry();
		const payoutCountry = countryNamesWithCodes.find(element => (element.code == payoutCountryCode));
		setPayoutCountryName(payoutCountry?.name);
	}, [])

	const handleAccountChange = (name, value) => {
		setAccount({ ...account, [name]: value });
	}

	const handleBusinessChange = (name, value) => {
		setBusiness({ ...business, [name]: value });
	}

	const handlePayoutChange = (name, value) => {
		setPayoutDetails({ ...payoutDetails, [name]: value });
	}

	const onSubmit = async () => {
		if (!business?.name) {
			scrollViewRef.current.scrollTo({ y: 0, animated: true })
			businessNameRef.current.focus();
			return setErrorBusinessName(`Business name required`);
		} else {
			setErrorBusinessName();
		}
		if (!account?.firstName) {
			scrollViewRef.current.scrollTo({ y: height * 0.2, animated: true })
			firstNameRef.current.focus();
			return setErrorFN(`Owner first name required`);
		} else {
			setErrorFN();
		}
		if (!account?.lastName) {
			scrollViewRef.current.scrollTo({ y: height * 0.4, animated: true })
			lastNameRef.current.focus();
			return setErrorLN(`Owner last name required`);
		} else {
			setErrorLN();
		}
		if (!business?.address) {
			scrollViewRef.current.scrollTo({ y: height * 0.6, animated: true })
			streetAddressRef.current.focus();
			return setErrorStreetAddress(`Street Address required`);
		} else {
			setErrorStreetAddress();
		}
		if (!business?.city) {
			scrollViewRef.current.scrollTo({ y: height * 0.8, animated: true })
			cityRef.current.focus();
			return setErrorCity(`City required`);
		} else {
			setErrorCity();
		}

		setLoading(true);

		try {
			const params = {
				data: {
					firstName: account.firstName,
					lastName: account.lastName
				}
			}

			const response = await businessApiService.updateAccount(account?.id, params);
			const { error, data } = response;
			if (error) {
				setLoading(false);
				if (error.status === 401) {
					showAuthError();
				}
				return;
			}

			const result = await businessApiService.updateBusiness(business?.id, { data: business });
			if (result.error) {
				setLoading(false);
				return;
			}

			// scroll up
			scrollViewRef.current.scrollTo({ y: 0, animated: true });

			await getUserProfile();

		} catch (error) {
			console.log(error);
			// setErrorPassword(error.message || 'Error occured. Please try again.');
		}
		setLoading(false);
	}

	const showAuthError = () => {
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

	const getUserProfile = async () => {
		setLoading(true);
		const result = await businessApiService.getUser();

		if (result.error || result.data === null) {
			console.log(result.error);
		} else {
			console.log(result);
			saveUser(result.data);

			const businessResult = await businessApiService.getBusinessInfo();
			if (!businessResult.error && businessResult.data) {
				const businessData = businessResult.data.data[0];
				if (businessData) {
					saveBusiness(businessData.business);
					saveBusinessMember(businessData);
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
				{ text: "ok", onPress: () => { navigation.goBack(); } }
			],
			{ cancelable: true }
		);
	}

	const onCountrySelect = (country) => {
		showCountryPicker(false);
		setCountryName(country?.name)
		handleBusinessChange('country', country.cca2);
	}

	const onPayoutCountrySelect = (country) => {
		showPayoutCountryPicker(false);
		setPayoutCountryName(country?.name)
		handlePayoutChange('country', country.cca2);
	}

	return (
		<BasicScreen
			scrollViewRef={scrollViewRef}
			style={{ paddingTop: 50 }}
			header={<BusinessHeader title="Edit business" description={account?.email} />}
		>
			{isLoading &&
				<LoadingIndicator />
			}

			<Text style={styles.subTitle}>Business information</Text>

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Business</Text>
				<Input
					ref={businessNameRef}
					containerStyle={styles.subInputContainer}
					inputContainerStyle={styles.subInput}
					inputStyle={styles.rowDescription}
					textAlign='right'
					keyboardType='ascii-capable'
					returnKeyType='next'
					value={business?.name}
					clearButtonMode='while-editing'
					errorStyle={{ height: 0 }}
					onChange={(event) => {
						handleBusinessChange('name', event.nativeEvent.text);
					}}
					onSubmitEditing={() => lastNameRef.current.focus()}
				/>
			</View>
			{(errorBusinessName != undefined && errorBusinessName != '') &&
				<Text style={styles.errorStyle}>{errorBusinessName}</Text>
			}

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>First name</Text>
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
						handleAccountChange('firstName', event.nativeEvent.text);
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
					value={business?.address}
					clearButtonMode='while-editing'
					onChange={(event) => {
						handleBusinessChange('address', event.nativeEvent.text)
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
					value={business?.city}
					clearButtonMode='while-editing'
					onChange={(event) => {
						handleBusinessChange('city', event.nativeEvent.text)
					}}
				/>
			</View>
			{(errorCity != undefined && errorCity != '') && <Text style={styles.errorStyle}>{errorCity}</Text>}

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Country</Text>
				<TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => {showCountryPicker(true); }}>
					<Text style={{...styles.rowDescription, marginRight: 12}}>{countryName}</Text>
					<CountryPicker
						countryCode={business?.country ? business?.country : RNLocalize.getCountry()}
						withFlagButton={false}
						onSelect={onCountrySelect}
						containerButtonStyle={{
							height: 40,
							justifyContent: 'center',
							color: 'blue',
							fontSize: 15,
						}}
						withFilter={true}
						visible={isCountryPicker}
					/>
					<Image source={dropdown_icon} style={{ width: 12, height: 10 }} />	
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
					value={business?.postalCode}
					clearButtonMode='while-editing'
					onChange={(event) => {
						handleBusinessChange('postalCode', event.nativeEvent.text)
					}}
					onSubmitEditing={onSubmit}
				/>
			</View>
			{(errorPostalCode != undefined && errorPostalCode != '') && <Text style={styles.errorStyle}>{errorPostalCode}</Text>}

			<Text style={styles.subTitle}>Payout details</Text>

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Bank/Financial institution</Text>
				<Input
					ref={cityRef}
					containerStyle={styles.subInputContainer}
					inputContainerStyle={styles.subInput}
					inputStyle={styles.rowDescription}
					textAlign='right'
					keyboardType='ascii-capable'
					returnKeyType='next'
					placeholder='Name'
					errorStyle={{ height: 0 }}
					value={payoutDetails?.institution}
					clearButtonMode='while-editing'
					onChange={(event) => {
						handlePayoutChange('institution', event.nativeEvent.text)
					}}
				/>
			</View>

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>My currency</Text>
				
			</View>
			<DropDownPicker
				placeholder='$MXN'
				placeholderStyle={{ color: 'grey', textAlign: 'right' }}
				open={open}
				value={currency}
				items={currencyItems}
				setOpen={setOpen}
				setValue={setCurrency}
				setItems={setCurrencyItems}
				listMode="SCROLLVIEW"
				scrollViewProps={{ nestedScrollEnabled: true }}
				style={{ width: 120, backgroundColor: 'transparent', borderWidth: 0 }}
				labelStyle={{ textAlign: 'right', color: theme.COLORS.BLUE }}
				containerStyle={{ width: 120, alignSelf: 'flex-end', marginTop: -45 }}
			/>

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Beneficiary</Text>
				<Input
					ref={cityRef}
					containerStyle={styles.subInputContainer}
					inputContainerStyle={styles.subInput}
					inputStyle={styles.rowDescription}
					textAlign='right'
					keyboardType='ascii-capable'
					returnKeyType='next'
					placeholder='Name'
					errorStyle={{ height: 0 }}
					value={payoutDetails?.beneficiary}
					clearButtonMode='while-editing'
					onChange={(event) => {
						handlePayoutChange('beneficiary', event.nativeEvent.text)
					}}
				/>
			</View>

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Account</Text>
				<Input
					ref={cityRef}
					containerStyle={styles.subInputContainer}
					inputContainerStyle={styles.subInput}
					inputStyle={styles.rowDescription}
					textAlign='right'
					keyboardType='ascii-capable'
					returnKeyType='next'
					placeholder='Account number'
					errorStyle={{ height: 0 }}
					value={payoutDetails?.account}
					clearButtonMode='while-editing'
					onChange={(event) => {
						handlePayoutChange('account', event.nativeEvent.text)
					}}
				/>
			</View>

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>IBAN/SWIFT</Text>
				<Input
					ref={cityRef}
					containerStyle={styles.subInputContainer}
					inputContainerStyle={styles.subInput}
					inputStyle={styles.rowDescription}
					textAlign='right'
					keyboardType='number-pad'
					returnKeyType='next'
					placeholder='Number'
					errorStyle={{ height: 0 }}
					value={payoutDetails?.iban}
					clearButtonMode='while-editing'
					onChange={(event) => {
						handlePayoutChange('iban', event.nativeEvent.text)
					}}
				/>
			</View>

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Business</Text>
				<Input
					ref={cityRef}
					containerStyle={styles.subInputContainer}
					inputContainerStyle={styles.subInput}
					inputStyle={styles.rowDescription}
					textAlign='right'
					keyboardType='ascii-capable'
					returnKeyType='next'
					placeholder='Business name'
					errorStyle={{ height: 0 }}
					value={payoutDetails?.business}
					clearButtonMode='while-editing'
					onChange={(event) => {
						handlePayoutChange('business', event.nativeEvent.text)
					}}
				/>
			</View>

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Country</Text>
				<TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => {showPayoutCountryPicker(true); }}>
					<Text style={{...styles.rowDescription, marginRight: 12}}>{payoutCountryName}</Text>
					<CountryPicker
						countryCode={payoutDetails?.country ? payoutDetails?.country : RNLocalize.getCountry()}
						withFlagButton={false}
						onSelect={onPayoutCountrySelect}
						containerButtonStyle={{
							height: 40,
							justifyContent: 'center',
							color: 'blue',
							fontSize: 15,
						}}
						withFilter={true}
						visible={isPayoutCountryPicker}
					/>
					<Image source={dropdown_icon} style={{ width: 12, height: 10 }} />	
				</TouchableOpacity>				
			</View>

			<EmptyGap />

			<BlueButton
				title="Submit"
				style={{ marginTop: 20, width: width * 0.8 }}
				onPressListener={onSubmit}
			/>

		</BasicScreen>
	);
}

const styles = StyleSheet.create({
	subTitle: {
		...fontStyles.semibold,
		alignSelf: 'flex-start',
		marginStart: 10,
		marginTop: 24,
		fontSize: 16,
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
	errorStyle: {
		alignSelf: 'flex-end',
		color: theme.COLORS.ERROR,
		fontSize: 14,
		marginEnd: 12,
	},
});

export default BusinessSettings;