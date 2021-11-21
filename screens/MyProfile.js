import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View, Image, ImageBackground } from 'react-native';
import { Text } from 'react-native-elements';
import EmptyGap from '../components/EmptyGap';
import BasicScreen from '../components/BasicScreen';
import moment from 'moment';
import Flag from 'react-native-round-flags';
import parsePhoneNumber from 'libphonenumber-js'
import RNCountry from "react-native-countries";

import { fontStyles } from '../styles/styles';
import { store } from '../redux/Store';
import CustomHeader from '../components/CustomHeader';
import BlueButton from '../components/BlueButton';
import theme from '../constants/Theme';

const { width, height } = Dimensions.get('screen');

const cardBg = require('../assets/card_bg.png');
const logo = require('../assets/logo/wc_white_w.png');
const cardChip = require('../assets/wc_chip.png');
const wpay = require('../assets/logo/wpay_white_w.png');

const MyProfile = ({
	navigation
}) => {
	const scrollViewRef = useRef();

	const [isAdmin, setAdmin] = useState(store.getState().user?.role?.type == 'superadmin');
	const [role, setRole] = useState(store.getState().role?.role);

	const [account, setAccount] = useState(store.getState().user?.account);
	const [photo, setPhoto] = useState();
	const [countryName, setCountryName] = useState('')

	useEffect(() => {
		const user = store.getState().user;
		setPhoto(user?.account?.profilePicture?.url);

		const countryNamesWithCodes = RNCountry.getCountryNamesWithCodes;
		const accountCountry = countryNamesWithCodes.find(element => (element.code == account?.country));
		setCountryName(accountCountry?.name);

	}, []);

	return (
		<BasicScreen
			scrollViewRef={scrollViewRef}
			style={{ paddingTop: 50 }}
			header={<CustomHeader title={`${account?.firstName} ${account?.lastName}`} description={account?.email} />}
		>

			<View style={styles.cardContainer}>
				<Image source={cardBg} style={styles.cardBgImage}></Image>
				<Image source={logo} style={styles.cardLogoImage}></Image>
				<Image source={cardChip} style={styles.cardChipImage}></Image>
				<View style={styles.userNameRow}>
					<Text style={styles.subTitle}>{account?.firstName} {account?.lastName}</Text>
				</View>

				<View style={styles.businessNameRow}>
					{isAdmin ?
						<Text style={styles.subTitle}>Super Admin</Text>
						:
						<Text style={styles.subTitle}>{`${role} of ${store.getState().business?.name}`}</Text>
					}

				</View>
				<View style={styles.emailRow}>
					<Text style={styles.memberTitle}>email: </Text>
					<Text style={{ ...styles.memberDescription, marginLeft: 20 }}>{account?.email}</Text>
				</View>
				<View style={styles.memberIdRow}>
					<Text style={styles.memberTitle}>member ID: </Text>
					<Text style={{ ...styles.memberDescription, marginLeft: 26 }}>{account?.id}</Text>
				</View>
				<View style={styles.memberDateRow}>
					<Text style={styles.memberTitle}>member since: </Text>
					<Text style={{ ...styles.memberDescription, marginLeft: 6 }}>{moment(account?.createdAt).format('MMM Do, YYYY')}</Text>
				</View>

				<Image source={wpay} style={styles.wpayIcon}></Image>
			</View>

			<Text style={{ ...fontStyles.semibold, fontSize: 15, alignSelf: 'flex-start' }}>Personal information</Text>
			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Name</Text>
				<Text style={styles.rowDescription}>{account?.firstName} {account?.lastName}</Text>
			</View>

			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Email</Text>
				<Text style={styles.rowDescription}>{account?.email}</Text>
			</View>

			<View style={{flexDirection: 'row', marginTop: 10}}>			
				{(account?.phone && parsePhoneNumber(account?.phone)?.country) &&
					<View style={{...styles.rowItem, marginTop: 0, width: 100}}>
						<Flag code={parsePhoneNumber(account?.phone)?.country} style={{width: 20, height: 20}}/>
						<Text style={{ ...styles.rowDescription, marginLeft: 12 }}>+{parsePhoneNumber(account?.phone)?.countryCallingCode}</Text>
					</View>
				}
				
				{(account?.phone && parsePhoneNumber(account?.phone)?.country) &&
					<View style={{ ...styles.rowItem, marginTop: 0, flex: 1, marginLeft: 8, justifyContent: 'flex-end' }}>
						<Text style={{ ...styles.rowDescription, marginLeft: 12 }}>{parsePhoneNumber(account?.phone)?.nationalNumber}</Text>
					</View>
				}
			</View>

			<Text style={{ ...fontStyles.semibold, fontSize: 15, alignSelf: 'flex-start', marginTop: 16 }}>Address details</Text>
			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Street</Text>
				<Text style={styles.rowDescription}>{account?.address}</Text>
			</View>
			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>City/Location</Text>
				<Text style={styles.rowDescription}>{account?.city}</Text>
			</View>
			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Country</Text>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					{(account?.country || account?.country == '') && <Flag code={account?.country} style={{width: 20, height: 20}}/>}
					<Text style={{ ...styles.rowDescription, marginLeft: 12 }}>{countryName}</Text>
				</View>
			</View>
			<View style={styles.rowItem}>
				<Text style={styles.rowTitle}>Postal Code / Zip code</Text>
				<Text style={styles.rowDescription}>{account?.postalCode}</Text>
			</View>

			<EmptyGap />

			<BlueButton
				title="Settings"
				style={{ marginTop: 30, width: width * 0.8 }}
				onPressListener={() => { navigation.navigate('MySettings'); }}
			/>
		</BasicScreen>
	);
}

const styles = StyleSheet.create({
	cardContainer: {
		position: 'relative',
		width: 300,
		height: 200,
		marginTop: 20,
		marginBottom: 20
	},
	cardBgImage: {
		width: 300,
		height: 200,
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
	userNameRow: {
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
	businessNameRow: {
		position: 'absolute',
		top: 100,
		left: 16,
		alignSelf: 'flex-start',
		flexDirection: 'row'
	},
	emailRow: {
		position: 'absolute',
		top: 130,
		left: 16,
		alignSelf: 'flex-start',
		flexDirection: 'row'
	},
	memberIdRow: {
		position: 'absolute',
		top: 150,
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
		top: 170,
		left: 16,
		alignSelf: 'flex-start',
		flexDirection: 'row'
	},
	wpayIcon: {
		position: 'absolute',
		bottom: 12,
		right: 12,
		width: 45,
		height: 45,
		resizeMode: 'contain'
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

});

export default MyProfile;