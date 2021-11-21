import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View, TouchableOpacity, Image, Linking, Alert, FlatList } from 'react-native';
import { withTheme, Text } from 'react-native-elements';
import { store } from '../../redux/Store';
import { businessApiService } from '../../service';
import { Searchbar } from 'react-native-paper';
import { Dialog } from 'react-native-simple-dialogs';
import DropDownPicker from 'react-native-dropdown-picker';

import LoadingIndicator from '../../components/LoadingIndicator';
import BasicScreen from '../../components/BasicScreen';
import { logoutUser } from '../../redux/actions/UserActions';
import { commonStyles, fontStyles } from '../../styles/styles';
import theme from '../../constants/Theme';
import BlueButton from '../../components/BlueButton';

const { width, height } = Dimensions.get('screen');

const header_logo = require('../../assets/logo/logo_bg.png');
const email_icon = require('../../assets/images/email.png');
const download_icon = require('../../assets/images/download.png');
const arrow_next = require('../../assets/images/arrow_next.png');
const dropdown_icon = require('../../assets/images/dropdown.png');
const close_icon = require('../../assets/images/close.png');

const ManageVenues = ({
	navigation
}) => {
	const scrollViewRef = useRef();

	const [isLoading, setLoading] = useState(false);
	const [venues, setVenues] = useState([]);
	const [allVenues, setAllVenues] = useState([]);

	const [search, setSearch] = useState('');

	const [selectedVenue, setSelectedVenue] = useState();
	const [selectedVenueType, setSelectedVenueType] = useState();
	const [isTypeDialog, showTypeDialog] = useState(false);
	const [isDeleteDialog, showDeleteDialog] = useState(false);

	const [open, setOpen] = useState(false);

	const [venueTypeItems, setVenueTypeItems] = useState([
		{ label: 'Bar, Restaurant, Food & Beverage', value: 'venu_bar' },
		{ label: 'Events, Venue, Festival', value: 'venu_festival' },
		{ label: 'Hotel, Hostel, Resort & Residency, Retreats', value: 'venu_multiple' },
		{ label: 'Professional Sevices', value: 'venu_services' },
		{ label: 'Retail & Shopping', value: 'venu_shopping' },
		{ label: 'Health & Wellbeing', value: 'venu_health' },
		{ label: 'Travel & Transportation', value: 'venu_travel' },
		{ label: 'Event Space, Exhibition', value: 'venu_exhibition' },
		{ label: 'Co-working', value: 'venu_co_working' },
		{ label: 'Historic, Local Culture', value: 'venu_histoic' },
		{ label: 'Tours & Experiences', value: 'venu_tours' },
		{ label: 'Art & Galleries', value: 'venu_art' },
		{ label: 'Sports & Arena', value: 'venu_sports' },
	]);

	const [venueCategoryItems, setVenueCategoryItems] = useState([
		{ label: 'Bar & Restaurant', value: 'category_bar', icon: () => <Image source={category_bar} style={styles.categoryIcon} /> },
		{ label: 'Excursions & Tour', value: 'category_excursions', icon: () => <Image source={category_excursions} style={styles.categoryIcon} /> },
		{ label: 'Shopping', value: 'category_shopping', icon: () => <Image source={category_shopping} style={styles.categoryIcon} /> },
		{ label: 'Groceries', value: 'category_groceries', icon: () => <Image source={category_groceries} style={styles.categoryIcon} /> },
		{ label: 'Entertainment', value: 'category_entertainment', icon: () => <Image source={category_entertainment} style={styles.categoryIcon} /> },
		{ label: 'General', value: 'category_general', icon: () => <Image source={category_general} style={styles.categoryIcon} /> },
		{ label: 'Services', value: 'category_services', icon: () => <Image source={category_services} style={styles.categoryIcon} /> },
		{ label: 'Events & Festivals', value: 'category_events_festivals', icon: () => <Image source={category_events_festivals} style={styles.categoryIcon} /> },
		{ label: 'Transportation', value: 'category_transportation', icon: () => <Image source={category_transportation} style={styles.categoryIcon} /> },
		{ label: 'Stays', value: 'category_stays', icon: () => <Image source={category_stays} style={styles.categoryIcon} /> },
		{ label: 'Health & Wellbeing', value: 'category_health', icon: () => <Image source={category_health} style={styles.categoryIcon} /> },
		{ label: 'Live & Concerts', value: 'category_live', icon: () => <Image source={category_live} style={styles.categoryIcon} /> },
		{ label: 'Arts & Exhibitions', value: 'category_arts', icon: () => <Image source={category_arts} style={styles.categoryIcon} /> },
	]);

	useEffect(() => {
		getVenues();
	}, []);

	const getVenues = async () => {
		setLoading(true);

		const business = store.getState().business;
		const result = await businessApiService.getBusinessSites(business?.id, 'Venue');
		setLoading(false);
		if (!result.error && result.data) {
			setAllVenues(result.data.data);
			onChangeSearch(search);
		} else {
			if (result.data?.error?.status == 401) {
				showNormalAlert('Invalid User', 'You account session has been expired. Please login again', () => {
					logoutUser();
					navigation.replace('Login');
				});
			} else {
				showNormalAlert('Fetch failed', result.data?.error?.message);
			}
		}
	}

	const getVenueType = (value) => {
		const result = venueTypeItems.filter(item => item.value == value);
		return result[0]?.label;
	}

	const showNormalAlert = (title, message, okClicked) => {
		Alert.alert(
			title,
			message,
			[
				{ text: "ok", onPress: () => { okClicked ? okClicked() : null } }
			],
			{ cancelable: true }
		);
	}

	const onChangeSearch = async (query) => {
		setSearch(query);

		if (!query || query == '') {
			setVenues(allVenues);
		} else {
			const searchQuery = query.toLowerCase();

			const searched = allVenues.filter(item => (
				item.name?.toLowerCase().includes(searchQuery) ||
				item.id?.toString().includes(searchQuery) ||
				getVenueType(item.subtype)?.toLowerCase().includes(searchQuery) ||
				item.location?.toLowerCase().includes(searchQuery) ||
				item.country?.toLowerCase().includes(searchQuery)
			));
			setVenues(searched);
		}
	}

	const updateVenueType = async (venue, venueType) => {
		const params = {
			subtype: venueType,
		}

		setLoading(true);
		const result = await businessApiService.updateBusinessSite(venue?.id, params);
		setLoading(false);

		if (!result.error) {
			await getVenues();
		}
	}

	const deleteVenue = async (venue) => {
		setLoading(true);
		const result = await businessApiService.deleteBusinessSite(venue?.id);
		setLoading(false);

		if (!result.error) {
			await getVenues();
		}
	}

	const getVenueCategory = (value) => {
		var result = venueCategoryItems.filter(item => item.value == value);
		return result[0]?.label;
	}

	const renderItem = ({ item }) => {
		const venue = item;

		return (
			<TouchableOpacity style={styles.itemContainer} key={venue.name}
				onPress={() => { navigation.navigate('VenueDetails', { venue }) }}>

				<Image source={venue.photo?.url ? { uri: venue.photo?.url } : header_logo} style={styles.venuePhoto} />

				<View style={styles.itemContent}>

					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							Venue name
						</Text>
						<Text style={styles.rowDescription}>
							{venue.name}
						</Text>
					</View>

					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							Venue ID
						</Text>
						<Text style={styles.rowDescription}>
							{venue.id}
						</Text>
					</View>

					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							Country
						</Text>
						<Text style={styles.rowDescription}>
							{venue.country}
						</Text>
					</View>

					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							Location
						</Text>
						<Text style={styles.rowDescription}>
							{venue.location}
						</Text>
					</View>

					<View style={{ ...styles.rowItem, marginTop: 8, alignItems: 'flex-start' }}>
						<Text style={styles.rowTitle}>
							Manage venue
						</Text>
						<TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'flex-end', marginLeft: 12, flex: 1 }}
							onPress={() => {
								setSelectedVenue(venue);
								setSelectedVenueType(venue?.subtype);
								showTypeDialog(true);
							}}>
							<Text style={{ ...styles.rowDescription, textAlign: 'right', maxWidth: '80%' }}>
								{getVenueType(venue.subtype)}
							</Text>
						</TouchableOpacity>
					</View>

					<View style={{ ...styles.rowItem, alignItems: 'flex-start' }}>
						<Text style={styles.rowTitle}>
							Manage category
						</Text>
						<TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'flex-end', marginLeft: 8, flex: 1 }}
							onPress={() => { }}>
							<Text style={{ ...styles.rowDescription, textAlign: 'right', maxWidth: '80%' }}>
								{venue?.category ? getVenueCategory(venue?.category) : ''}
							</Text>
						</TouchableOpacity>
					</View>

				</View>

			</TouchableOpacity>
		);
	}

	return (
		<BasicScreen
			scrollContainerStyle={styles.scrollView}
			scrollViewRef={scrollViewRef}
			disabledScroll
		>

			{isLoading &&
				<LoadingIndicator />
			}

			<Searchbar
				placeholder="Type Here..."
				onChangeText={onChangeSearch}
				value={search}
				style={commonStyles.searchbar}
				iconColor={theme.COLORS.BORDER_COLOR}
				inputStyle={commonStyles.searchbarInputStyle}
			/>

			<Text style={{ ...fontStyles.semibold, fontSize: 17, alignSelf: 'flex-start', marginTop: 20 }}>venues</Text>

			<FlatList
				data={(!search || search == '') ? allVenues : venues}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				style={{ flex: 1, marginTop: 12 }}
			/>

			<View style={styles.bottomContainer}>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
					<Text style={{ ...fontStyles.regular, fontSize: 15 }}>Choose an option</Text>

					<View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>

						<BlueButton
							title="Add venue"
							width={80}
							height={22}
							fontSize={12}
							titleStyle={{ ...fontStyles.semibold, color: 'white' }}
							onPressListener={() => { navigation.navigate('CreateVenue') }}
							style={{ marginBottom: 10 }}
						/>

						<TouchableOpacity style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center' }} onPress={() => { }}>
							<Image source={download_icon} style={{ width: 15, height: 15, marginEnd: 8 }}></Image>
							<Text style={{ ...fontStyles.regular, fontSize: 15, color: theme.COLORS.BLUE }}>Download</Text>
						</TouchableOpacity>

						<TouchableOpacity style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', marginTop: 6 }} onPress={() => { }}>
							<Image source={email_icon} style={{ width: 18, height: 13, marginEnd: 8, resizeMode: 'stretch' }}></Image>
							<Text style={{ ...fontStyles.regular, fontSize: 15, color: theme.COLORS.BLUE }}>Email</Text>
						</TouchableOpacity>
					</View>

				</View>

				<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
					<Text style={{ ...fontStyles.regular, fontSize: 15 }}>Report an issue</Text>
					<TouchableOpacity style={{ paddingVertical: 6, paddingStart: 10 }} onPress={() => Linking.openURL('https://wcashless.com/support-ticket')}>
						<Image source={arrow_next} style={{ width: 12, height: 12 }}></Image>
					</TouchableOpacity>
				</View>
			</View>

			{isTypeDialog &&
				<Dialog
					visible={true}
					overlayStyle={{ padding: 0 }}
					dialogStyle={{
						backgroundColor: theme.COLORS.WHITE,
						borderColor: theme.COLORS.ERROR,
						borderWidth: 1,
						borderRadius: 50,
						width: '90%',
						alignSelf: 'center'
					}}>

					<View style={{ width: '100%', ...styles.rowItem }}>
						<Text style={{ ...fontStyles.bold, fontSize: 24, alignSelf: 'flex-start' }}>
							Manage venue
						</Text>
						<TouchableOpacity style={styles.closeButton} onPress={() => {
							setOpen(false);
							showTypeDialog(false);
						}}>
							<Image source={close_icon} style={styles.closeIcon} />
						</TouchableOpacity>
					</View>

					<View style={{ ...styles.rowItem, justifyContent: 'flex-start', marginTop: 20 }}>
						<Image source={selectedVenue?.photo?.uri ? { uri: selectedVenue?.photo?.url } : header_logo} style={styles.venuePictureStyle} />
						<Text style={{ ...fontStyles.bold, fontSize: 20, marginStart: 12 }}>
							{selectedVenue?.name}
						</Text>
					</View>


					<View style={styles.venuetypeContainer}>
						<Text style={{ ...fontStyles.regular, fontSize: 14 }}>
							Venue type
						</Text>
					</View>

					<DropDownPicker
						placeholder='venue type'
						placeholderStyle={{ color: 'grey', textAlign: 'right' }}
						open={open}
						value={selectedVenueType}
						items={venueTypeItems}
						setOpen={setOpen}
						setValue={setSelectedVenueType}
						setItems={setVenueTypeItems}
						listMode="SCROLLVIEW"
						scrollViewProps={{ nestedScrollEnabled: true }}
						style={{ width: width * 0.6, backgroundColor: 'transparent', borderWidth: 0 }}
						labelStyle={{ textAlign: 'right', color: theme.COLORS.BLUE, ...fontStyles.semibold, fontSize: 14 }}
						containerStyle={{ width: width * 0.6, alignSelf: 'flex-end', marginTop: -45 }}
						dropDownContainerStyle={{ height: 120 }}
						onChangeValue={(value) => {
							updateVenueType(selectedVenue, value);
						}}
					/>

					<BlueButton
						title="Delete venue"
						style={{ marginTop: 50, height: 35, width: 220, alignSelf: 'center', backgroundColor: theme.COLORS.ERROR }}
						titleStyle={{ ...fontStyles.semibold }}
						onPressListener={() => {
							setOpen(false);
							showTypeDialog(false);
							showDeleteDialog(true);
						}}
					/>

				</Dialog>
			}

			{isDeleteDialog &&
				<Dialog
					visible={true}
					overlayStyle={{ padding: 0 }}
					dialogStyle={{
						backgroundColor: theme.COLORS.WHITE,
						borderColor: theme.COLORS.ERROR,
						borderWidth: 1,
						borderRadius: 50,
						width: '90%',
						alignSelf: 'center'
					}}>

					<View style={{ width: '100%', ...styles.rowItem }}>
						<Text style={{ ...fontStyles.bold, fontSize: 24, alignSelf: 'flex-start' }}>
							Delete venue
						</Text>
						<TouchableOpacity style={styles.closeButton} onPress={() => {
							setSelectedVenue();
							showDeleteDialog(false);
						}}>
							<Image source={close_icon} style={styles.closeIcon} />
						</TouchableOpacity>
					</View>

					<View style={{ ...styles.rowItem, justifyContent: 'flex-start', marginTop: 20 }}>
						<Text style={{ ...fontStyles.bold, fontSize: 20, marginStart: 12 }}>
							{selectedVenue?.name}
						</Text>
					</View>

					<View style={{ ...styles.itemContainer, width: '100%' }}>

						<Image
							source={selectedVenue?.photo?.url ? { uri: selectedVenue?.photo?.url } : header_logo}
							style={styles.venuePictureStyle}
						/>

						<View style={styles.itemContent}>
							<View style={styles.rowItem}>
								<Text style={styles.rowTitle}>
									Business
								</Text>
								<Text style={styles.rowDescription}>
									{selectedVenue?.business?.name}
								</Text>
							</View>

							<View style={styles.rowItem}>
								<Text style={styles.rowTitle}>
									Venue ID
								</Text>
								<Text style={styles.rowDescription}>
									{selectedVenue?.id}
								</Text>
							</View>

							<View style={styles.rowItem}>
								<Text style={styles.rowTitle}>
									Country
								</Text>
								<Text style={styles.rowDescription}>
									{selectedVenue?.country}
								</Text>
							</View>

							<View style={styles.rowItem}>
								<Text style={styles.rowTitle}>
									Location
								</Text>
								<Text style={styles.rowDescription}>
									{selectedVenue?.location}
								</Text>
							</View>

						</View>

					</View>

					<View style={{ ...styles.rowItem, justifyContent: 'space-around', marginTop: 20 }}>
						<BlueButton
							title="Cancel"
							style={{ height: 35, width: 120 }}
							titleStyle={{ ...fontStyles.semibold, color: 'white' }}
							onPressListener={() => {
								setSelectedVenue();
								showDeleteDialog(false);
							}}
						/>

						<BlueButton
							title="Yes"
							style={{ height: 35, width: 120, backgroundColor: theme.COLORS.SUCCESS }}
							titleStyle={{ ...fontStyles.semibold, color: 'white' }}
							onPressListener={() => {
								setSelectedVenue();
								showDeleteDialog(false);
								deleteVenue(selectedVenue);
							}}
						/>
					</View>

				</Dialog>
			}

		</BasicScreen>
	);
}

const styles = StyleSheet.create({
	scrollView: {

	},
	itemContainer: {
		width: width * 0.85,
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 8,
		marginBottom: 8,
	},
	itemContent: {
		flex: 1,
		borderWidth: 0.5,
		borderColor: theme.COLORS.BORDER_COLOR,
		borderRadius: 16,
		backgroundColor: '#F7F7F7',
		padding: 8,
		marginStart: 8
	},
	rowItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	rowTitle: {
		...fontStyles.semibold,
		fontSize: 13
	},
	rowDescription: {
		...fontStyles.regular,
		fontSize: 13,
		color: theme.COLORS.BLUE,
	},
	venuePhoto: {
		width: 45,
		height: 45,
		borderRadius: 25,
		overflow: 'hidden'
	},
	bottomContainer: {
		marginTop: 10,
		width: '100%',
		backgroundColor: '#B4C9E8',
		borderColor: theme.COLORS.BORDER_COLOR,
		borderWidth: 1,
		borderRadius: 16,
		paddingHorizontal: 12,
		paddingVertical: 8
	},
	closeButton: {
		width: 40,
		height: 40,
		justifyContent: 'center',
		alignItems: 'flex-end'
	},
	closeIcon: {
		width: 15,
		height: 15
	},
	venuePictureStyle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: 'grey'
	},
	venuetypeContainer: {
		height: 40,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: '#F7F7F7',
		borderWidth: 0.5,
		borderColor: theme.COLORS.BORDER_COLOR,
		borderRadius: 8,
		paddingHorizontal: 8,
		marginTop: 20
	}
});

export default ManageVenues;