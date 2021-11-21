import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, Image } from 'react-native';
import { Text } from 'react-native-elements';
import Flag from 'react-native-round-flags';
import parsePhoneNumber from 'libphonenumber-js'
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';
import RNCountry from "react-native-countries";

import { store } from '../redux/Store';
import EmptyGap from '../components/EmptyGap';
import BasicScreen from '../components/BasicScreen';
import theme from '../constants/Theme';
import LoadingIndicator from '../components/LoadingIndicator';
import { fontStyles } from '../styles/styles';
import BusinessHeader from '../components/BusinessHeader';
import BlueButton from '../components/BlueButton';

const { width, height } = Dimensions.get('screen');

const cardBg = require('../assets/card_bg.png');
const logo = require('../assets/logo/wc_white_w.png');
const cardChip = require('../assets/wc_chip.png');
const wpay = require('../assets/logo/wpay_white_w.png');

const BusinessProfile = ({
	navigation
}) => {

	const [business, setBusiness] = useState(store.getState().business);
	const [account, setAccount] = useState(store.getState().user?.account);
	const [countryName, setCountryName] = useState('');

	const [isLoading, setLoading] = useState(false);

	const isFocused = useIsFocused();

	useEffect(() => {
		setBusiness(store.getState().business);
		setAccount(store.getState().user?.account);
		
		const countryNamesWithCodes = RNCountry.getCountryNamesWithCodes;
		const businessCountry = countryNamesWithCodes.find(element => (element.code == business?.country));
		setCountryName(businessCountry?.name);
	}, [isFocused])

	return (
		<BasicScreen
			style={{ paddingTop: 50 }}
			header={<BusinessHeader title={business?.name} description={account?.email} />}
		>
			{isLoading &&
				<LoadingIndicator />
			}

			<View style={styles.cardContainer}>
				<Image source={cardBg} style={styles.cardBgImage}></Image>
				<Image source={logo} style={styles.cardLogoImage}></Image>
				<Image source={cardChip} style={styles.cardChipImage}></Image>
				<View style={styles.businessNameRow}>
					<Text style={styles.subTitle}>{business?.name}</Text>
				</View>

				<View style={styles.userRow}>
					<Text style={styles.memberTitle}>user: </Text>
					<Text style={{ ...styles.memberDescription, marginLeft: 20 }}>{account?.firstName} {account?.lastName}</Text>
				</View>
				<View style={styles.memberIdRow}>
					<Text style={styles.memberTitle}>business ID: </Text>
					<Text style={{ ...styles.memberDescription, marginLeft: 26 }}>{business?.id}</Text>
				</View>
				<View style={styles.memberDateRow}>
					<Text style={styles.memberTitle}>business since: </Text>
					<Text style={{ ...styles.memberDescription, marginLeft: 6 }}>{moment(business?.createdAt).format('MMM Do, YYYY')}</Text>
				</View>

				<Image source={wpay} style={styles.wpayIcon}></Image>
			</View>

			<Text style={{ ...fontStyles.semibold, fontSize: 15, alignSelf: 'flex-start', marginTop: 12 }}>Business information</Text>
			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Owner name</Text>
				<Text style={styles.rowDescription}>{account?.firstName} {account?.lastName}</Text>
			</View>

			<View style={{flexDirection: 'row', marginTop: 10}}>
				{(account?.phone && parsePhoneNumber(account?.phone)?.country) &&
					<View style={{ ...styles.rowItem, marginTop: 0, width: 100 }}>
						<Flag code={parsePhoneNumber(account?.phone)?.country} style={{width: 20, height: 20}}/>
						<Text style={{ ...styles.rowDescription, marginLeft: 12 }}>+{parsePhoneNumber(account?.phone)?.countryCallingCode}</Text>
					</View>
				}
				{(account?.phone && parsePhoneNumber(account?.phone)?.country) &&
					<View style={{ ...styles.rowItem, marginTop: 0, flex: 1, marginLeft: 8, justifyContent: 'flex-end' }}>
						<Text style={{ ...styles.rowDescription, marginLeft: 12 }}>{parsePhoneNumber(account?.phone)?.formatNational()}</Text>
					</View>
				}
			</View>
			
			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Street</Text>
				<Text style={styles.rowDescription}>{business?.address}</Text>
			</View>

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>City/Location</Text>
				<Text style={styles.rowDescription}>{business?.city}</Text>
			</View>

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>City/Location</Text>
				<Text style={styles.rowDescription}>{business?.city}</Text>
			</View>

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Country</Text>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					{(business?.country || business?.country == '') && <Flag code={business?.country} style={{width: 20, height: 20}}/>}
					<Text style={{ ...styles.rowDescription, marginLeft: 12 }}>{countryName}</Text>
				</View>
			</View>
			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Postal Code / Zip code</Text>
				<Text style={styles.rowDescription}>{business?.postalCode}</Text>
			</View>

			<Text style={{ ...fontStyles.semibold, fontSize: 15, alignSelf: 'flex-start', marginTop: 20 }}>Payout details</Text>
			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Bank/Financial institution</Text>
				<Text style={styles.rowDescription}>Name</Text>
			</View>
			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Payment type</Text>
				<Text style={styles.rowDescription}>Bank/Card</Text>
			</View>
			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Country</Text>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Flag code={'US'} style={{width: 20, height: 20}}/>
					<Text style={{ ...styles.rowDescription, marginLeft: 12 }}>United States</Text>
				</View>
			</View>
			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Beneficiary</Text>
				<Text style={styles.rowDescription}>Name</Text>
			</View>
			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Account</Text>
				<Text style={styles.rowDescription}>Account number</Text>
			</View>
			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>IBAN/SWIFT</Text>
				<Text style={styles.rowDescription}>Number</Text>
			</View>
			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Business</Text>
				<Text style={styles.rowDescription}>Business number</Text>
			</View>

			<EmptyGap />

			<BlueButton
				title="Business Settings"
				style={{ marginTop: 20, width: width * 0.8 }}
				onPressListener={() => { navigation.navigate('BusinessSettings') }}
			/>
		</BasicScreen>
	);
}

const styles = StyleSheet.create({
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
	cardContainer: {
		position: 'relative',
		width: 300,
		height: 170,
		marginTop: 20,
		marginBottom: 20
	},
	cardBgImage: {
		width: 300,
		height: 170,
		resizeMode: 'stretch',
		position: 'absolute',
	},
	cardLogoImage: {
		top: 12,
		left: 16,
		width: 130,
		height: 40,
		resizeMode: 'contain',
		position: 'absolute',
	},
	cardChipImage: {
		position: 'absolute',
		top: 54,
		left: 24,
		width: 40,
		height: 40,
		resizeMode: 'contain',
	},
	businessNameRow: {
		position: 'absolute',
		top: 62,
		left: 80,
		alignSelf: 'flex-start',
		flexDirection: 'row',
		alignItems: 'center'
	},
	subTitle: {
		...fontStyles.semibold,
		fontSize: 16,
		color: 'white'
	},
	userRow: {
		position: 'absolute',
		top: 100,
		left: 16,
		alignSelf: 'flex-start',
		flexDirection: 'row'
	},
	memberIdRow: {
		position: 'absolute',
		top: 120,
		left: 16,
		alignSelf: 'flex-start',
		flexDirection: 'row'
	},
	memberTitle: {
		...fontStyles.semibold,
		fontSize: 12,
		color: 'white'
	},
	memberDescription: {
		fontSize: 12,
		color: 'white'
	},
	memberDateRow: {
		position: 'absolute',
		top: 140,
		left: 16,
		alignSelf: 'flex-start',
		flexDirection: 'row'
	},
	wpayIcon: {
		position: 'absolute',
		bottom: 12,
		right: 12,
		width: 40,
		height: 40,
		resizeMode: 'contain'
	},
});

export default BusinessProfile;