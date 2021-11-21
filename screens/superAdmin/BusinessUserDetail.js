import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View, Image, ImageBackground, TouchableOpacity, Alert } from 'react-native';
import { Input, Text } from 'react-native-elements';
import DropDownPicker from 'react-native-dropdown-picker';
import CountryPicker from 'react-native-country-picker-modal'
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js'
import * as RNLocalize from "react-native-localize";
import RNCountry from "react-native-countries";

import BasicScreen from '../../components/BasicScreen';
import theme from '../../constants/Theme';
import { commonStyles, fontStyles } from '../../styles/styles';
import LoadingIndicator from '../../components/LoadingIndicator';
import { businessApiService } from '../../service';
import ImagePickerDialog from '../../components/ImagePickerDialog';
import EmptyGap from '../../components/EmptyGap';
import BlueButton from '../../components/BlueButton';

const avatar = require('../../assets/images/avatar.png');
const camera_w = require('../../assets/images/camera_w.png');
const dropdown_icon = require('../../assets/images/dropdown.png');
const site_logo = require('../../assets/logo/logo_bg.png');

const { width, height } = Dimensions.get('screen');

const BusinessUserDetail = ({
	navigation, route
}) => {
	const scrollViewRef = useRef();

	const [businessMember, setBusinessMember] = useState(route.params?.businessMember);
	const [role, setRole] = useState(route.params?.businessMember?.role);
	const [businessSite, setBusinessSite] = useState(route.params?.businessMember?.business_site?.id);
	const [account, setAccount] = useState(route.params?.businessMember?.account);
	const [formErrors, setFormErrors] = useState({});
	const [photoUrl, setPhotoUrl] = useState();
	const [newAsset, setNewAsset] = useState();
	const [imagePicker, setImagePicker] = useState(false);

	const [countryName, setCountryName] = useState('');
	const [isCountryPicker, showCountryPicker] = useState(false);

	const [countryCode, setCountryCode] = useState((account?.phone && isValidPhoneNumber(account?.phone)) ? parsePhoneNumber(account?.phone)?.country : 'US');
	const [callingCode, setCallingCode] = useState((account?.phone && isValidPhoneNumber(account?.phone)) ? parsePhoneNumber(account?.phone)?.countryCallingCode : '1');
	const [phoneNumber, setPhoneNumber] = useState((account?.phone && isValidPhoneNumber(account?.phone)) ? parsePhoneNumber(account?.phone)?.nationalNumber : '');

	const [open, setOpen] = useState(false);
	const [roleItems, setRoleItems] = useState([
		{ label: 'Owner', value: 'Owner' },
		{ label: 'Manager', value: 'Manager' },
		{ label: 'Staff', value: 'Staff' },
	]);

	const [openBusinessSite, setOpenBusinessSite] = useState(false);
	const [businessSiteItems, setBusinessSiteItems] = useState([]);

	const [isLoading, setLoading] = useState(false);

	useEffect(() => {
		setPhotoUrl(account?.profilePicture?.url);
		setNewAsset();

		const countryNamesWithCodes = RNCountry.getCountryNamesWithCodes;
		const countryCode = account?.country ? account.country : RNLocalize.getCountry();
		const country = countryNamesWithCodes.find(element => (element.code == countryCode));
		setCountryName(country?.name);

		setBusinessSite(route.params?.businessMember?.business_site?.id);

		getBusinessSites();
	}, []);

	const getBusinessSites = async () => {
		setLoading(true);
		
		const business = businessMember?.business;
		const result = await businessApiService.getBusinessSitesInBusiness(business?.id);
		setLoading(false);
		if (!result.error && result.data) {
			const businessSites = result.data.data;
			var sites = [];
			businessSites?.forEach(element => {
				const site = {
					value: element.id,
					label: element.name,
					icon: () => <Image source={element.photo?.url? {uri: element.photo.url} : site_logo } style={styles.businessSiteIcon} />
				}
				sites.push(site);
			});
			setBusinessSiteItems(sites);
		}
	}

	const onUpdate = async () => {
		setLoading(true);
		if (validate()) {
			var photo = null;

			const updateRoleResult = await businessApiService.updateBusinessMember(businessMember?.id, {
				business_site: businessSite,
				position: role,
				role, role
			});
			console.log('----------', updateRoleResult);

			if (newAsset != null) {
				// upload image
				const file = {
					uri: newAsset.uri,
					name: newAsset.fileName,
					type: newAsset.type
				}
				const result = await businessApiService.uploadFile(file);
				if (!result.error && result.data != null) {
					photo = result.data;
				}
			}

			var params = {
				data: {
					firstName: account.firstName,
					lastName: account.lastName,
					phone: account.phone,
					address: account.address,
					city: account.city,
					country: account.country,
					postalCode: account.postalCode,
				}
			}
			if (photo) {
				params = {
					data: {
						firstName: account.firstName,
						lastName: account.lastName,
						phone: account.phone,
						address: account.address,
						city: account.city,
						country: account.country,
						postalCode: account.postalCode,
						profilePicture: photo?.id
					}
				}
			}

			const response = await businessApiService.updateAccount(account?.id, params);
			const { error, data } = response;
			if (updateRoleResult.error || error) {
				setLoading(false);
				if (updateRoleResult.error?.status === 401 || error.status === 401) {
					showAuthError();
				} else {
					showNormalAlert('Failed', 'Account details were not updated.')
				}
				return;
			} else {
				showNormalAlert('Success', 'Account details were updated successfully.')
			}
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

	const showNormalAlert = (title, message) => {
		Alert.alert(
			title,
			message,
			[{ text: "close", onPress: () => { } }],
			{ cancelable: true }
		);
	}

	const validate = () => {
		let errors = {};

		if (!account.firstName) {
			errors.firstName = "Please enter your First Name";
		} else if (account.firstName.length < 3) {
			errors.firstName = "First Name must be at least 3 characters long!";
		}

		if (!account?.lastName) {
			errors.lastName = "Please enter your Last Name";
			if (marginBottom == 0) marginBottom = 24;
		} else if (account?.lastName.length < 3) {
			errors.lastName = "Last Name must be at least 3 characters long!";
			marginBottom = 40;
		}

		if (!account?.phone) {
			errors.phone = "Please enter your phone number";
		}

		if (!account?.address || account.address.trim() == '') {
			errors.address = "Please enter your street address";
		}

		setFormErrors(errors);
		if (Object.keys(errors).length === 0) return true;

		return false;
	}

	const handleAccountChange = (name, value) => {
		setAccount({ ...account, [name]: value });
	}

	const selectImageAsset = async (asset) => {
		setImagePicker(false);

		if (!asset) return;
		// upload image
		setNewAsset(asset);
		setPhotoUrl(asset.uri);
	}

	const onCountrySelect = (country) => {
		showCountryPicker(false);
		handleAccountChange('country', country.cca2);
		setCountryName(country?.name);
	}

	const onCallingCodeSelect = (country) => {
		setCountryCode(country.cca2);

		const code = country.callingCode[0];
		setCallingCode(code);
		handleAccountChange('phone', `+${code}${phoneNumber}`);
	}

	const buildHeader = () => {
		return (
			<>
				<View style={{ width: '95%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
					<View style={{ flexDirection: 'column', marginTop: 24 }}>
						<Text style={{ ...commonStyles.headerTitle, alignSelf: 'flex-start', marginStart: 12 }}>
							{account?.firstName} {account?.lastName}
						</Text>
						<Text style={{ ...fontStyles.semibold, fontSize: 15, alignSelf: 'flex-start', marginStart: 12, color: theme.COLORS.BLUE }}>
							{account?.email}
						</Text>
					</View>

					<ImageBackground source={photoUrl ? { uri: photoUrl } : avatar} style={styles.avatarContainer} imageStyle={styles.avatar}>
						<TouchableOpacity style={styles.cameraButtonContainer} onPress={() => { setImagePicker(true) }}>
							<Image source={camera_w} style={styles.cameraIcon}></Image>
						</TouchableOpacity>
					</ImageBackground>
				</View>
			</>
		)
	}

	return (
		<>
			<BasicScreen
				scrollViewRef={scrollViewRef}
				style={{ paddingTop: 50 }}
				header={buildHeader()}
			>
				{isLoading &&
					<LoadingIndicator />
				}

				<Text style={styles.subTitle}>Business details: </Text>
				<View style={styles.rowItem}>
					<Text style={styles.rowTitle}>Business name</Text>
					<Text style={styles.rowDescription}>{businessMember?.business?.name}</Text>
				</View>

				<View style={styles.rowItem}>
					<Text style={styles.rowTitle}>Role</Text>
				</View>
				<DropDownPicker
					placeholder='Business role'
					placeholderStyle={{ color: 'grey' }}
					open={open}
					value={role}
					items={roleItems}
					setOpen={setOpen}
					onSelectItem={(item) => { setRole(item.value); }}
					setItems={setRoleItems}
					listMode="SCROLLVIEW"
					scrollViewProps={{ nestedScrollEnabled: true }}
					style={{ width: width * 0.4, backgroundColor: 'transparent', borderWidth: 0 }}
					labelStyle={{ textAlign: 'right', color: theme.COLORS.BLUE }}
					containerStyle={{ width: width * 0.4, alignSelf: 'flex-end', marginTop: -45 }}
					zIndex={2}
				/>

				<View style={{...styles.rowItem, marginTop: 6}}>
					<Text style={styles.rowTitle}>Venue or Event</Text>
				</View>
				<DropDownPicker
					placeholder='Venue or Event'
					placeholderStyle={{ color: 'grey', textAlign: 'right' }}
					open={openBusinessSite}
					value={businessSite}
					items={businessSiteItems}
					setOpen={setOpenBusinessSite}
					onSelectItem={(item) => { setBusinessSite(item.value); }}
					setItems={setBusinessSiteItems}
					listMode="SCROLLVIEW"
					scrollViewProps={{ nestedScrollEnabled: true }}
					style={{ width: width * 0.5, backgroundColor: 'transparent', borderWidth: 0 }}
					labelStyle={{ textAlign: 'right', color: theme.COLORS.BLUE }}
					containerStyle={{ width: width * 0.5, alignSelf: 'flex-end', marginTop: -45 }}
					zIndex={1}
				/>

				<Text style={{ ...styles.subTitle, marginTop: 16 }}>User details: </Text>
				<View style={styles.rowItem}>
					<Text style={styles.rowTitle}>First name</Text>
					<Input
						containerStyle={styles.subInputContainer}
						inputContainerStyle={styles.subInput}
						inputStyle={styles.rowDescription}
						keyboardType='ascii-capable'
						placeholder='First name'
						returnKeyType='next'
						textAlign='right'
						errorStyle={{ height: 0 }}
						value={account?.firstName}
						clearButtonMode='while-editing'
						onChange={(event) => {
							handleAccountChange('firstName', event.nativeEvent.text.trim());
						}}
					/>
				</View>
				{(formErrors.firstName != undefined && formErrors.firstName != '') &&
					<Text style={styles.errorStyle}>{formErrors.firstName}</Text>
				}

				<View style={styles.rowItem}>
					<Text style={styles.rowTitle}>Last name</Text>
					<Input
						containerStyle={styles.subInputContainer}
						inputContainerStyle={styles.subInput}
						inputStyle={styles.rowDescription}
						keyboardType='ascii-capable'
						placeholder='Last name'
						returnKeyType='next'
						textAlign='right'
						errorStyle={{ height: 0 }}
						value={account?.lastName}
						clearButtonMode='while-editing'
						onChange={(event) => {
							handleAccountChange('lastName', event.nativeEvent.text.trim());
						}}
					/>
				</View>
				{(formErrors.lastName != undefined && formErrors.lastName != '') &&
					<Text style={styles.errorStyle}>{formErrors.lastName}</Text>
				}

				<View style={styles.rowItem}>
					<Text style={styles.rowTitle}>Email</Text>
					<Text style={styles.rowDescription}>{account?.email}</Text>
				</View>

				<View style={{ flexDirection: 'row', width: '100%', marginTop: 10 }}>
					<View style={{ ...styles.rowItem, width: 120, marginTop: 0 }}>
						<TouchableOpacity style={{ height: 40, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
							<CountryPicker
								countryCode={countryCode}
								withFilter
								withFlag
								onSelect={onCallingCodeSelect}
								containerButtonStyle={{
									height: 40,
									justifyContent: 'center',
									color: 'blue',
									fontSize: 15
								}}
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
				{(formErrors.phone != undefined && formErrors.phone != '') && <Text style={styles.errorStyle}>{formErrors.phone}</Text>}

				<Text style={{ ...styles.subTitle, marginTop: 16 }}>Address details: </Text>
				<View style={styles.rowItem}>
					<Text style={styles.rowTitle}>Stree address</Text>
					<Input
						containerStyle={styles.subInputContainer}
						inputContainerStyle={styles.subInput}
						inputStyle={styles.rowDescription}
						keyboardType='ascii-capable'
						placeholder='Street address'
						returnKeyType='next'
						textAlign='right'
						errorStyle={{ height: 0 }}
						value={account?.address}
						clearButtonMode='while-editing'
						onChange={(event) => {
							handleAccountChange('address', event.nativeEvent.text);
						}}
					/>
				</View>
				{(formErrors.address != undefined && formErrors.address != '') &&
					<Text style={styles.errorStyle}>{formErrors.address}</Text>
				}

				<View style={styles.rowItem}>
					<Text style={styles.rowTitle}>City/Location</Text>
					<Input
						containerStyle={styles.subInputContainer}
						inputContainerStyle={styles.subInput}
						inputStyle={styles.rowDescription}
						keyboardType='ascii-capable'
						placeholder='City'
						returnKeyType='next'
						textAlign='right'
						errorStyle={{ height: 0 }}
						value={account?.city}
						clearButtonMode='while-editing'
						onChange={(event) => {
							handleAccountChange('city', event.nativeEvent.text);
						}}
					/>
				</View>
				{(formErrors.city != undefined && formErrors.city != '') &&
					<Text style={styles.errorStyle}>{formErrors.city}</Text>
				}

				<View style={styles.rowItem}>
					<Text style={styles.rowTitle}>Country</Text>
					<TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => { showCountryPicker(true) }}>
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
					/>
				</View>

				<EmptyGap />
				<BlueButton
					title="Update"
					style={{ marginTop: 20 }}
					onPressListener={onUpdate}
				/>

			</BasicScreen>
			{
				imagePicker &&
				<ImagePickerDialog
					closeDialog={() => setImagePicker(false)}
					onImageAsset={(asset) => { selectImageAsset(asset) }}
				/>
			}
		</>
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
	avatarContainer: {
		width: 90,
		height: 90,
		justifyContent: 'flex-end',
		alignItems: 'flex-end'
	},
	avatar: {
		borderRadius: 50,
		borderColor: 'grey',
		borderWidth: 1,
	},
	cameraButtonContainer: {
		width: 25,
		height: 25,
		borderRadius: 15,
		backgroundColor: theme.COLORS.BLUE,
		alignItems: 'center',
		justifyContent: 'center'
	},
	cameraIcon: {
		width: 12,
		height: 12,
	},
	businessSiteIcon: {
		width: 20,
		height: 20,
		borderWidth: 1,
		borderColor: theme.COLORS.GREY_COLOR,
		borderRadius: 10
	}
});

export default BusinessUserDetail;