import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View, TouchableOpacity, Image, Alert, Linking, FlatList } from 'react-native';
import { withTheme, Text } from 'react-native-elements';
import { Searchbar } from 'react-native-paper';
import { Dialog } from 'react-native-simple-dialogs';
import DropDownPicker from 'react-native-dropdown-picker';

import LoadingIndicator from '../../components/LoadingIndicator';
import BasicScreen from '../../components/BasicScreen';
import { businessApiService } from '../../service';
import { store } from '../../redux/Store';
import { logoutUser } from '../../redux/actions/UserActions';
import BlueButton from '../../components/BlueButton';
import { commonStyles, fontStyles } from '../../styles/styles';
import theme from '../../constants/Theme';

const { width, height } = Dimensions.get('screen');

const event_logo = require('../../assets/logo/event_logo.png');
const email_icon = require('../../assets/images/email.png');
const download_icon = require('../../assets/images/download.png');
const arrow_next = require('../../assets/images/arrow_next.png');
const dropdown_icon = require('../../assets/images/dropdown.png');
const close_icon = require('../../assets/images/close.png');

const ManageEvents = ({
	navigation
}) => {
	const scrollViewRef = useRef();

	const [isLoading, setLoading] = useState(false);
	const [allEvents, setAllEvents] = useState([]);
	const [events, setEvents] = useState([]);

	const [search, setSearch] = useState('');

	const [selectedEvent, setSelectedEvent] = useState();
	const [selectedEventType, setSelectedEventType] = useState();
	const [isTypeDialog, showTypeDialog] = useState(false);
	const [isDeleteDialog, showDeleteDialog] = useState(false);

	const [open, setOpen] = useState(false);
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

	useEffect(() => {
		getEvents();
	}, []);

	const getEvents = async () => {
		setLoading(true);

		const business = store.getState().business;
		const result = await businessApiService.getBusinessSites(business?.id, 'Event');
		setLoading(false);

		if (!result.error && result.data) {
			setAllEvents(result.data.data);
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
			setEvents(allEvents);
		} else {
			const searchQuery = query.toLowerCase();

			const searched = allEvents.filter(item => (
				item.id?.toString().includes(searchQuery) ||
				item.name?.toLowerCase().includes(searchQuery) ||
				item.country?.toLowerCase().includes(searchQuery) ||
				item.subtype?.toLowerCase().includes(searchQuery)
			));
			setEvents(searched);
		}
	}

	const updateEventType = async (event, eventType) => {
		const params = {
			subtype: eventType,
		}

		setLoading(true);
		const result = await businessApiService.updateBusinessSite(event?.id, params);
		setLoading(false);

		if (!result.error) {
			await getEvents();
		}
	}

	const deleteEvent = async (event) => {
		setLoading(true);
		const result = await businessApiService.deleteBusinessSite(event?.id);
		setLoading(false);

		if (!result.error) {
			await getEvents();
		}
	}

	const renderItem = ({ item }) => {
		const event = item;

		return (
			<TouchableOpacity style={styles.itemContainer} key={event.name}
				onPress={() => { navigation.navigate('EventDetails', { event }) }}>

				<Image source={event.photo?.url ? { uri: event.photo?.url } : event_logo} style={styles.eventPhoto} />

				<View style={styles.itemContent}>

					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							Event name
						</Text>
						<Text style={styles.rowDescription}>
							{event.name}
						</Text>
					</View>

					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							Event ID
						</Text>
						<Text style={styles.rowDescription}>
							{event.id}
						</Text>
					</View>

					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							Country
						</Text>
						<Text style={styles.rowDescription}>
							{event.country}
						</Text>
					</View>

					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							Location
						</Text>
						<Text style={styles.rowDescription}>
							{event.location}
						</Text>
					</View>

					<View style={{ ...styles.rowItem, marginTop: 8, alignItems: 'flex-start' }}>
						<Text style={styles.rowTitle}>
							Manage event
						</Text>
						<TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'flex-end', marginLeft: 12, flex: 1 }}
							onPress={() => {
								setSelectedEvent(event);
								setSelectedEventType(event?.subtype);
								showTypeDialog(true);
							}}>
							<Text style={{ ...styles.rowDescription, textAlign: 'right', maxWidth: '80%' }}>
								{event.subtype}
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
			lightBg={true}
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

			<Text style={{ ...fontStyles.semibold, fontSize: 17, alignSelf: 'flex-start', marginTop: 20 }}>events</Text>

			<FlatList
				data={(!search || search == '') ? allEvents : events}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				style={{ flex: 1, marginTop: 12 }}
			/>

			<View style={styles.bottomContainer}>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
					<Text style={{ ...fontStyles.regular, fontSize: 15 }}>Choose an option</Text>

					<View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>

						<BlueButton
							title="Add event"
							width={80}
							height={22}
							fontSize={12}
							titleStyle={{ ...fontStyles.semibold, color: 'white' }}
							onPressListener={() => { navigation.navigate('CreateEvent') }}
							style={{ marginBottom: 8 }}
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
							Manage event
						</Text>
						<TouchableOpacity style={styles.closeButton} onPress={() => {
							setOpen(false);
							showTypeDialog(false);
						}}>
							<Image source={close_icon} style={styles.closeIcon} />
						</TouchableOpacity>
					</View>

					<View style={{ ...styles.rowItem, justifyContent: 'flex-start', marginTop: 20 }}>
						<Image source={selectedEvent?.photo?.uri ? { uri: selectedEvent?.photo?.url } : event_logo} style={styles.eventPictureStyle} />
						<Text style={{ ...fontStyles.bold, fontSize: 20, marginStart: 12 }}>
							{selectedEvent?.name}
						</Text>
					</View>


					<View style={styles.eventtypeContainer}>
						<Text style={{ ...fontStyles.regular, fontSize: 14 }}>
							Event type
						</Text>
					</View>

					<DropDownPicker
						placeholder='venue type'
						placeholderStyle={{ color: 'grey', textAlign: 'right' }}
						open={open}
						value={selectedEventType}
						items={eventTypeItems}
						setOpen={setOpen}
						setValue={setSelectedEventType}
						setItems={setEventTypeItems}
						listMode="SCROLLVIEW"
						scrollViewProps={{ nestedScrollEnabled: true }}
						style={{ width: width * 0.6, backgroundColor: 'transparent', borderWidth: 0 }}
						labelStyle={{ textAlign: 'right', color: theme.COLORS.BLUE, ...fontStyles.semibold, fontSize: 14 }}
						containerStyle={{ width: width * 0.6, alignSelf: 'flex-end', marginTop: -45 }}
						dropDownContainerStyle={{ height: 120 }}
						onChangeValue={(value) => {
							updateEventType(selectedEvent, value);
						}}
					/>

					<BlueButton
						title="Delete event"
						style={{ marginTop: 50, height: 35, width: 220, alignSelf: 'center', backgroundColor: theme.COLORS.ERROR }}
						titleStyle={{ ...fontStyles.semibold, color: 'white' }}
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
							Delete event
						</Text>
						<TouchableOpacity style={styles.closeButton} onPress={() => {
							setSelectedEvent();
							showDeleteDialog(false);
						}}>
							<Image source={close_icon} style={styles.closeIcon} />
						</TouchableOpacity>
					</View>

					<View style={{ ...styles.rowItem, justifyContent: 'flex-start', marginTop: 20 }}>
						<Text style={{ ...fontStyles.bold, fontSize: 20, marginStart: 12 }}>
							{selectedEvent?.name}
						</Text>
					</View>

					<View style={{ ...styles.itemContainer, width: '100%' }}>

						<Image
							source={selectedEvent?.photo?.url ? { uri: selectedEvent?.photo?.url } : event_logo}
							style={styles.eventPictureStyle}
						/>

						<View style={styles.itemContent}>
							<View style={styles.rowItem}>
								<Text style={styles.rowTitle}>
									Business
								</Text>
								<Text style={styles.rowDescription}>
									{selectedEvent?.business?.name}
								</Text>
							</View>

							<View style={styles.rowItem}>
								<Text style={styles.rowTitle}>
									Event ID
								</Text>
								<Text style={styles.rowDescription}>
									{selectedEvent?.id}
								</Text>
							</View>

							<View style={styles.rowItem}>
								<Text style={styles.rowTitle}>
									Country
								</Text>
								<Text style={styles.rowDescription}>
									{selectedEvent?.country}
								</Text>
							</View>

							<View style={styles.rowItem}>
								<Text style={styles.rowTitle}>
									Location
								</Text>
								<Text style={styles.rowDescription}>
									{selectedEvent?.location}
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
								setSelectedEvent();
								showDeleteDialog(false);
							}}
						/>

						<BlueButton
							title="Yes"
							style={{ height: 35, width: 120, backgroundColor: theme.COLORS.SUCCESS }}
							titleStyle={{ ...fontStyles.semibold }}
							onPressListener={() => {
								setSelectedEvent();
								showDeleteDialog(false);
								deleteEvent(selectedEvent);
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
	eventPhoto: {
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
	eventPictureStyle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: 'grey'
	},
	eventtypeContainer: {
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

export default ManageEvents;