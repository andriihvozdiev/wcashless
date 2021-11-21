import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View, TouchableOpacity, Image, Linking, Alert, FlatList } from 'react-native';
import { Text } from 'react-native-elements';
import { Searchbar } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';
import { Dialog } from 'react-native-simple-dialogs';
import DropDownPicker from 'react-native-dropdown-picker';
import RNCountry from "react-native-countries";

import { businessApiService } from '../../service';
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

const AdminManageSites = ({
	navigation, route
}) => {
	const scrollViewRef = useRef();

	const [isLoading, setLoading] = useState(false);
	const [type, setType] = useState(route.params?.type);
	const [allSites, setAllSites] = useState([]);
	const [sites, setSites] = useState([]);
	const [search, setSearch] = useState('');

	const [page, setPage] = useState(1);
	const PageSize = 30;

	const [selectedBusinessSite, setSelectedBusinessSite] = useState();
	const [selectedBusinessSiteType, setSelectedBusinessSiteType] = useState();
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

	const [eventTypeItems, setEventTypeItems] = useState([
		{ label: 'Electronic music', value: 'event_e_music' },
		{ label: 'Live music', value: 'event_live_music' },
		{ label: 'Festival', value: 'event_fstival' },
		{ label: 'Daytime', value: 'event_day_time' },
		{ label: 'Night time', value: 'event_night_time' },
		{ label: 'Multi Day event', value: 'event_multi_day_event' },
		{ label: 'Beach Club', value: 'event_beach_club' },
		{ label: 'Bar/Venue', value: 'event_bar_venue' },
		{ label: 'Specialist Event Space', value: 'event_special' },
		{ label: 'Night Club', value: 'event_night_club' },
		{ label: 'Private Location', value: 'event_private_location' },
		{ label: 'Exhibition', value: 'event_exhibition' },
		{ label: 'Seminar', value: 'event_seminar' },
		{ label: 'Conference', value: 'event_conference' },
		{ label: 'Trade Show', value: 'event_trade_show' },
		{ label: 'Wellness', value: 'event_wellness' },
		{ label: 'Sports', value: 'event_sports' },
	]);

	const [venueCategoryItems, setVenueCategoryItems] = useState([
		{ label: 'Bar & Restaurant', value: 'category_bar', icon: () => <Image source={category_bar} style={styles.categoryIcon}/> },
		{ label: 'Excursions & Tour', value: 'category_excursions', icon: () => <Image source={category_excursions} style={styles.categoryIcon}/> },
		{ label: 'Shopping', value: 'category_shopping', icon: () => <Image source={category_shopping} style={styles.categoryIcon}/> },
		{ label: 'Groceries', value: 'category_groceries', icon: () => <Image source={category_groceries} style={styles.categoryIcon}/> },
		{ label: 'Entertainment', value: 'category_entertainment', icon: () => <Image source={category_entertainment} style={styles.categoryIcon}/> },
		{ label: 'General', value: 'category_general', icon: () => <Image source={category_general} style={styles.categoryIcon}/> },
		{ label: 'Services', value: 'category_services', icon: () => <Image source={category_services} style={styles.categoryIcon}/> },
		{ label: 'Events & Festivals', value: 'category_events_festivals', icon: () => <Image source={category_events_festivals} style={styles.categoryIcon}/> },
		{ label: 'Transportation', value: 'category_transportation', icon: () => <Image source={category_transportation} style={styles.categoryIcon}/> },
		{ label: 'Stays', value: 'category_stays', icon: () => <Image source={category_stays} style={styles.categoryIcon}/> },
		{ label: 'Health & Wellbeing', value: 'category_health', icon: () => <Image source={category_health} style={styles.categoryIcon}/> },
		{ label: 'Live & Concerts', value: 'category_live', icon: () => <Image source={category_live} style={styles.categoryIcon}/> },
		{ label: 'Arts & Exhibitions', value: 'category_arts', icon: () => <Image source={category_arts} style={styles.categoryIcon}/> },
	]);

	const isFocused = useIsFocused();

	useEffect(() => {
		setPage(1);
		setSites([]);
		setAllSites([]);

		getBusinessSites();
	}, [isFocused]);

	const getBusinessSites = async (isRefresh = false) => {
		var currentPage = page;
		if (isRefresh) {
			currentPage = 1;
		}
		setLoading(true);
		const result = await businessApiService.getAllBusinessSites(type, currentPage, PageSize);
		setLoading(false);
		if (!result.error && result.data) {
			const newData = result.data.data;
			if (isRefresh) {
				setAllSites(newData);
			} else {
				setAllSites([...allSites, ...newData]);
			}

			setPage(currentPage + 1);
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

	const onChangeSearch = async (query) => {
		setSearch(query);

		if (!query || query == '') {
			setSites(allSites);
		} else {
			const searchQuery = query.toLowerCase();

			const searched = allSites.filter(item => (
				item.name?.toLowerCase().includes(searchQuery) ||
				moment(item.createdAt).format('yyyy/MM/DD HH:mm').includes(searchQuery) ||
				moment(item.createdAt).format('yyyy/MMMM/DD HH:mm').toLowerCase().includes(searchQuery) ||
				item.business?.name?.toLowerCase().includes(searchQuery)
			));
			setSites(searched);
		}
	}

	const getBusinessSiteType = (value) => {

		if (type == 'Event') {
			const result = eventTypeItems.filter(item => item.value == value);
			return result[0]?.label;
		}
		if (type == 'Venue') {
			var result = venueTypeItems.filter(item => item.value == value);
			return result[0]?.label;
		}
		return ''
	}

	const getVenueCategory = (value) => {
		var result = venueCategoryItems.filter(item => item.value == value);
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

	const goDetail = (businessSite) => {
		if (type === 'Venue') {
			navigation.navigate('VenueDetails', { venue: businessSite })
		} else if (type === 'Event') {
			navigation.navigate('EventDetails', { event: businessSite })
		}

	}

	const loadMoreData = async () => {
		getBusinessSites();
	}

	const addBusinessSite = async () => {
		if (type === 'Venue') {
			navigation.navigate('CreateVenue')
		} else if (type === 'Event') {
			navigation.navigate('CreateEvent')
		}
	}

	const updateBusinessSiteType = async (businessSite, businessSiteType) => {
		const params = {
			subtype: businessSiteType,
		}

		setLoading(true);
		const result = await businessApiService.updateBusinessSite(businessSite?.id, params);
		setLoading(false);

		if (!result.error) {
			await getBusinessSites(true);
		}
	}

	const deleteBusinessSite = async (businessSite) => {
		setLoading(true);
		const result = await businessApiService.deleteBusinessSite(businessSite?.id);
		setLoading(false);

		if (!result.error) {
			setPage(1);
			setSites([]);
			setAllSites([]);

			await getBusinessSites(true);
		}
	}

	const renderItem = ({ item }) => {
		const businessSite = item;

		var photoUrl = businessSite.photo?.formats?.small?.url;
		if (!photoUrl) photoUrl = businessSite.photo?.url;

		const countryNamesWithCodes = RNCountry.getCountryNamesWithCodes;
		const country = countryNamesWithCodes.find(element => (element.code == businessSite?.country));
		const countryName = country?.name;

		return (
			<TouchableOpacity style={styles.itemContainer} key={businessSite?.name}
				onPress={() => { goDetail(businessSite); }}>

				<Image source={photoUrl ? { uri: photoUrl } : header_logo} style={styles.businessSitePicture} />

				<View style={styles.itemContent}>

					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							Business
						</Text>
						<Text style={styles.rowDescription}>
							{businessSite?.business?.name}
						</Text>
					</View>

					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							{type} name
						</Text>
						<Text style={styles.rowDescription}>
							{businessSite?.name}
						</Text>
					</View>

					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							{type} ID
						</Text>
						<Text style={styles.rowDescription}>
							{businessSite?.id}
						</Text>
					</View>

					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							Country
						</Text>
						<Text style={styles.rowDescription}>
							{countryName}
						</Text>
					</View>

					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							City / Location
						</Text>
						<Text style={styles.rowDescription}>
							{businessSite?.city}
						</Text>
					</View>

					<View style={{ ...styles.rowItem, marginTop: 8, alignItems: 'flex-start' }}>
						<Text style={styles.rowTitle}>
							Manage {type.toLowerCase()}
						</Text>
						<TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'flex-end', marginLeft: 8, flex: 1 }}
							onPress={() => {
								setSelectedBusinessSite(businessSite);
								setSelectedBusinessSiteType(businessSite?.subtype);
								showTypeDialog(true);
							}}>
							<Text style={{ ...styles.rowDescription, textAlign: 'right', maxWidth: '80%' }}>
								{getBusinessSiteType(businessSite?.subtype)}
							</Text>
						</TouchableOpacity>
					</View>
					
					{(type.toLowerCase() == 'venue') &&
						<View style={{ ...styles.rowItem, alignItems: 'flex-start' }}>
							<Text style={styles.rowTitle}>
								Manage category
							</Text>
							<TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'flex-end', marginLeft: 8, flex: 1 }}
								onPress={() => {
									// setSelectedBusinessSite(businessSite);
									// setSelectedBusinessSiteType(businessSite?.subtype);
									// showTypeDialog(true);
								}}>
								<Text style={{ ...styles.rowDescription, textAlign: 'right', maxWidth: '80%' }}>
									{businessSite?.category ? getVenueCategory(businessSite?.category) : 'Category'}
								</Text>
							</TouchableOpacity>
						</View>
					}
					

				</View>
			</TouchableOpacity>
		);
	}

	return (
		<BasicScreen
			scrollContainerStyle={styles.scrollView}
			scrollViewRef={scrollViewRef}
			disabledScroll
			lightBg
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

			<FlatList
				data={(!search || search == '') ? allSites : sites}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				style={{ flex: 1, marginTop: 20 }}
				onEndReachedThreshold={0.2}
				onEndReached={loadMoreData}
			/>

			<View style={styles.bottomContainer}>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
					<Text style={{ ...fontStyles.regular, fontSize: 15 }}>Choose an option</Text>

					<View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>

						<BlueButton
							title={`Add ${type.toLowerCase()}`}
							width={80}
							height={22}
							fontSize={12}
							titleStyle={{ ...fontStyles.semibold, color: 'white' }}
							onPressListener={addBusinessSite}
							style={{ marginBottom: 10 }}
						/>

						<TouchableOpacity style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center' }} onPress={() => { }}>
							<Image source={download_icon} style={{ width: 15, height: 15, marginEnd: 8 }}></Image>
							<Text style={{ ...fontStyles.regular, fontSize: 15, color: theme.COLORS.BLUE }}>Download</Text>
						</TouchableOpacity>

						<TouchableOpacity style={{ alignSelf: 'flex-end', flexDirection: 'row', alignItems: 'center', marginTop: 8 }} onPress={() => { }}>
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
							Manage {type.toLowerCase()}
						</Text>
						<TouchableOpacity style={styles.closeButton} onPress={() => {
							setOpen(false);
							showTypeDialog(false);
						}}>
							<Image source={close_icon} style={styles.closeIcon} />
						</TouchableOpacity>
					</View>

					<View style={{ ...styles.rowItem, justifyContent: 'flex-start', marginTop: 20 }}>
						<Image source={selectedBusinessSite?.photo?.uri ? { uri: selectedBusinessSite?.photo?.url } : header_logo} style={styles.businessSitePicture} />
						<Text style={{ ...fontStyles.bold, fontSize: 20, marginStart: 12 }}>
							{selectedBusinessSite?.name}
						</Text>
					</View>


					<View style={styles.businessSiteTypeContainer}>
						<Text style={{ ...fontStyles.regular, fontSize: 14 }}>
							{type} type
						</Text>
					</View>

					<DropDownPicker
						placeholder={`${type.toLowerCase()} type`}
						placeholderStyle={{ color: 'grey', textAlign: 'right' }}
						open={open}
						value={selectedBusinessSiteType}
						items={(type === 'Event') ? eventTypeItems : venueTypeItems}
						setOpen={setOpen}
						setValue={setSelectedBusinessSiteType}
						setItems={(type === 'Event') ? setEventTypeItems : setVenueTypeItems}
						listMode="SCROLLVIEW"
						scrollViewProps={{ nestedScrollEnabled: true }}
						style={{ width: width * 0.6, backgroundColor: 'transparent', borderWidth: 0 }}
						labelStyle={{ textAlign: 'right', color: theme.COLORS.BLUE, ...fontStyles.semibold, fontSize: 14 }}
						containerStyle={{ width: width * 0.6, alignSelf: 'flex-end', marginTop: -45 }}
						dropDownContainerStyle={{ height: 120 }}
						onChangeValue={(value) => {
							updateBusinessSiteType(selectedBusinessSite, value);
						}}
					/>

					<BlueButton
						title={`Delete ${type.toLowerCase()}`}
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
							Delete {type.toLowerCase()}
						</Text>
						<TouchableOpacity style={styles.closeButton} onPress={() => {
							setSelectedBusinessSite();
							showDeleteDialog(false);
						}}>
							<Image source={close_icon} style={styles.closeIcon} />
						</TouchableOpacity>
					</View>

					<View style={{ ...styles.rowItem, justifyContent: 'flex-start', marginTop: 20 }}>
						<Text style={{ ...fontStyles.bold, fontSize: 20, marginStart: 12 }}>
							{selectedBusinessSite?.name}
						</Text>
					</View>

					<View style={{ ...styles.itemContainer, width: '100%' }}>

						<Image
							source={selectedBusinessSite?.photo?.url ? { uri: selectedBusinessSite?.photo?.url } : header_logo}
							style={styles.businessSitePicture}
						/>

						<View style={styles.itemContent}>
							<View style={styles.rowItem}>
								<Text style={styles.rowTitle}>
									Business
								</Text>
								<Text style={styles.rowDescription}>
									{selectedBusinessSite?.business?.name}
								</Text>
							</View>

							<View style={styles.rowItem}>
								<Text style={styles.rowTitle}>
									{type} ID
								</Text>
								<Text style={styles.rowDescription}>
									{selectedBusinessSite?.id}
								</Text>
							</View>

							<View style={styles.rowItem}>
								<Text style={styles.rowTitle}>
									Country
								</Text>
								<Text style={styles.rowDescription}>
									{selectedBusinessSite?.country}
								</Text>
							</View>

							<View style={styles.rowItem}>
								<Text style={styles.rowTitle}>
									Location
								</Text>
								<Text style={styles.rowDescription}>
									{selectedBusinessSite?.location}
								</Text>
							</View>

						</View>

					</View>

					<View style={{ ...styles.rowItem, justifyContent: 'space-around', marginTop: 20 }}>
						<BlueButton
							title="Cancel"
							style={{ height: 35, width: 120 }}
							titleStyle={{ ...fontStyles.semibold }}
							onPressListener={() => {
								setSelectedBusinessSite();
								showDeleteDialog(false);
							}}
						/>

						<BlueButton
							title="Yes"
							style={{ height: 35, width: 120, backgroundColor: theme.COLORS.SUCCESS }}
							titleStyle={{ ...fontStyles.semibold }}
							onPressListener={() => {
								setSelectedBusinessSite();
								showDeleteDialog(false);
								deleteBusinessSite(selectedBusinessSite);
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
		paddingTop: 20,
		paddingBottom: 10,
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
	bottomContainer: {
		marginTop: 30,
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
	businessSitePicture: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: 'grey'
	},
	businessSiteTypeContainer: {
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

export default AdminManageSites;