import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View, TouchableOpacity, Image, Alert, Linking, FlatList } from 'react-native';
import { Text } from 'react-native-elements';
import { Searchbar } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import { Dialog } from 'react-native-simple-dialogs';

import { store } from '../../redux/Store';
import LoadingIndicator from '../../components/LoadingIndicator';
import BasicScreen from '../../components/BasicScreen';
import { businessApiService } from '../../service';
import { commonStyles, fontStyles } from '../../styles/styles';
import { logoutUser } from '../../redux/actions/UserActions';
import BlueButton from '../../components/BlueButton';
import theme from '../../constants/Theme';

const { width, height } = Dimensions.get('screen');

const email_icon = require('../../assets/images/email.png');
const download_icon = require('../../assets/images/download.png');
const arrow_next = require('../../assets/images/arrow_next.png');
const avatar = require('../../assets/images/avatar.png');
const dropdown_icon = require('../../assets/images/dropdown.png');
const close_icon = require('../../assets/images/close.png');

const ManageUsers = ({
	navigation
}) => {
	const scrollViewRef = useRef();

	const [isLoading, setLoading] = useState(false);
	const [business, setBusiness] = useState(store.getState().business);

	const [search, setSearch] = useState('');
	const [allBusinessMembers, setAllBusinessMembers] = useState([]);
	const [businessMembers, setBusinessMembers] = useState([]);

	const [selectedUser, setSelectedUser] = useState();
	const [isTypeDialog, showTypeDialog] = useState(false);
	const [isDeleteDialog, showDeleteDialog] = useState(false);

	const [open, setOpen] = useState(false);
	const [selectedUserType, setSelectedUserType] = useState();
	const [roleItems, setRoleItems] = useState([
		{ label: 'Manager', value: 'Manager' },
		{ label: 'Staff', value: 'Staff' },
	]);

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		setLoading(true);
		const result = await businessApiService.getBusinessMembers(store.getState().business?.id);
		setLoading(false);
		if (!result.error && result.data.data) {
			setAllBusinessMembers(result.data.data);
		} else {
			if (result.data?.error?.status == 401) {
				showAuthErrorAlert();
			}
		}
	}

	const showAuthErrorAlert = () => {
		Alert.alert(
			'Invalid User',
			'You account session has been expired. Please login again',
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

	const createBusinessUser = () => {
		navigation.navigate('BusinessUserSignup')
	}

	const deleteUser = async (businessMember) => {
		setLoading(true);

		const result = await businessApiService.deleteBusinessMember(businessMember?.id);
		setLoading(false);

		if (result.error) {
			return;
		}

		// reload
		await fetchUsers();
	}

	const updateUserType = async (businessMember, role) => {
		setLoading(true);
		const params = {
			position: role,
			role: role,
		}
		const result = await businessApiService.updateBusinessMember(businessMember?.id, params);
		setLoading(false);

		if (result.error) {
			return;
		}

		// reload
		await fetchUsers();
	}

	const onChangeSearch = async (query) => {
		setSearch(query);

		if (!query || query == '') {
			setBusinessMembers(allBusinessMembers);
		} else {
			const searchQuery = query.toLowerCase();

			const searched = allBusinessMembers.filter(user => (
				user.id.toString().includes(searchQuery) ||
				user.account?.firstName?.toLowerCase().includes(searchQuery) ||
				user.account?.lastName?.toLowerCase().includes(searchQuery) ||
				user.account?.country?.toLowerCase().includes(searchQuery)
			));
			setBusinessMembers(searched);
		}
	}

	const renderItem = ({ item }) => {
		const user = item;

		return (
			<TouchableOpacity style={styles.itemContainer} key={user.id} onPress={() => {navigation.navigate('BusinessUserDetail', { businessMember: user })}}>

				<Image source={user?.account?.profilePicture ? { uri: user?.account?.profilePicture.url } : avatar} style={styles.profilePictureStyle} />

				<View style={styles.itemContent}>

					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							User name
						</Text>
						<Text style={styles.rowDescription}>
							{user.account?.firstName} {user.account?.lastName}
						</Text>
					</View>

					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							Email
						</Text>
						<Text style={styles.rowDescription}>
							{user.account?.email}
						</Text>
					</View>

					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							User ID
						</Text>
						<Text style={styles.rowDescription}>
							{user.account?.id}
						</Text>
					</View>

					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							Country
						</Text>
						<Text style={styles.rowDescription}>
							{user.account?.country}
						</Text>
					</View>

					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							Location
						</Text>
						<Text style={styles.rowDescription}>
							{user.account?.city}
						</Text>
					</View>

					<View style={{ ...styles.rowItem, marginTop: 8 }}>
						<Text style={styles.rowTitle}>
							Manage User
						</Text>
						<TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}
							onPress={() => {
								if (user.position != 'Owner') {
									setSelectedUser(user);
									setSelectedUserType(user?.position);
									showTypeDialog(true);
								}
							}}>
							<Text style={styles.rowDescription}>
								{user.position}
							</Text>
						</TouchableOpacity>

					</View>

				</View>

			</TouchableOpacity>
		)
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

			<Text style={{ ...fontStyles.semibold, fontSize: 15, alignSelf: 'flex-start', marginTop: 20 }}>Users of {business?.name}</Text>

			<FlatList
				data={(!search || search == '') ? allBusinessMembers : businessMembers}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				style={{ flex: 1, marginTop: 16 }}
			/>

			<View style={styles.bottomContainer}>
				<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
					<Text style={{ ...fontStyles.regular, fontSize: 15 }}>Choose an option</Text>

					<View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>

						<BlueButton
							title="Add user"
							width={80}
							height={22}
							fontSize={12}
							titleStyle={{ ...fontStyles.semibold, color: 'white' }}
							onPressListener={createBusinessUser}
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
							Manage user
						</Text>
						<TouchableOpacity style={styles.closeButton} onPress={() => {
							setOpen(false);
							showTypeDialog(false);
						}}>
							<Image source={close_icon} style={styles.closeIcon} />
						</TouchableOpacity>
					</View>

					<View style={{ ...styles.rowItem, justifyContent: 'flex-start', marginTop: 20 }}>
						<Image source={selectedUser?.account?.profilePicture ? { uri: selectedUser?.account?.profilePicture.url } : avatar} style={styles.profilePictureStyle} />
						<Text style={{ ...fontStyles.bold, fontSize: 20, marginStart: 12 }}>
							{selectedUser?.account?.firstName} {selectedUser?.account?.lastName}
						</Text>
					</View>


					<View style={styles.usertypeContainer}>
						<Text style={{ ...fontStyles.regular, fontSize: 15 }}>
							User type
						</Text>
					</View>

					<DropDownPicker
						placeholder='user type'
						placeholderStyle={{ color: 'grey', textAlign: 'right' }}
						open={open}
						value={selectedUserType}
						items={roleItems}
						setOpen={setOpen}
						setValue={setSelectedUserType}
						setItems={setRoleItems}
						listMode="SCROLLVIEW"
						scrollViewProps={{ nestedScrollEnabled: true }}
						style={{ width: width * 0.4, backgroundColor: 'transparent', borderWidth: 0 }}
						labelStyle={{ textAlign: 'right', color: theme.COLORS.BLUE }}
						containerStyle={{ width: width * 0.4, alignSelf: 'flex-end', marginTop: -45 }}
						onChangeValue={(value) => {
							updateUserType(selectedUser, value);
						}}
					/>

					<BlueButton
						title="Pause user"
						style={{ marginTop: 20, height: 35, width: 220, alignSelf: 'center' }}
						titleStyle={{ ...fontStyles.semibold }}
						onPressListener={() => { }}
					/>

					<BlueButton
						title="Delete user"
						style={{ marginTop: 8, height: 35, width: 220, alignSelf: 'center', backgroundColor: theme.COLORS.ERROR }}
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
							Delete user
						</Text>
						<TouchableOpacity style={styles.closeButton} onPress={() => {
							setSelectedUser();
							showDeleteDialog(false);
						}}>
							<Image source={close_icon} style={styles.closeIcon} />
						</TouchableOpacity>
					</View>

					<View style={{ ...styles.rowItem, justifyContent: 'flex-start', marginTop: 20 }}>
						<Text style={{ ...fontStyles.bold, fontSize: 20, marginStart: 12 }}>
							{selectedUser?.account?.firstName} {selectedUser?.account?.lastName}
						</Text>
					</View>

					<View style={{ ...styles.itemContainer, width: '100%' }}>

						<Image
							source={selectedUser?.account?.profilePicture ? { uri: selectedUser?.account?.profilePicture.url } : avatar}
							style={styles.profilePictureStyle}
						/>

						<View style={styles.itemContent}>
							<View style={styles.rowItem}>
								<Text style={styles.rowTitle}>
									Business
								</Text>
								<Text style={styles.rowDescription}>
									{selectedUser?.business?.name}
								</Text>
							</View>

							<View style={styles.rowItem}>
								<Text style={styles.rowTitle}>
									User ID
								</Text>
								<Text style={styles.rowDescription}>
									{selectedUser?.account?.id}
								</Text>
							</View>

							<View style={styles.rowItem}>
								<Text style={styles.rowTitle}>
									Country
								</Text>
								<Text style={styles.rowDescription}>
									{selectedUser?.account?.country}
								</Text>
							</View>

							<View style={styles.rowItem}>
								<Text style={styles.rowTitle}>
									Location
								</Text>
								<Text style={styles.rowDescription}>
									{selectedUser?.account?.city}
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
								setSelectedUser();
								showDeleteDialog(false);
							}}
						/>

						<BlueButton
							title="Yes"
							style={{ height: 35, width: 120, backgroundColor: theme.COLORS.SUCCESS }}
							titleStyle={{ ...fontStyles.semibold }}
							onPressListener={() => {
								setSelectedUser();
								showDeleteDialog(false);
								deleteUser(selectedUser);
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
		paddingTop: 20
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
		fontSize: 12
	},
	rowDescription: {
		...fontStyles.regular,
		fontSize: 12,
		color: theme.COLORS.BLUE
	},
	nameText: {
		fontSize: 17,
		textAlign: 'left',
		alignSelf: 'flex-start',
		fontFamily: 'SourceSansPro-Regular',
		flex: 1,
	},
	businessTypeText: {
		width: 80,
		fontSize: 17,
		textAlign: 'left',
		alignSelf: 'flex-start',
		fontFamily: 'SourceSansPro-Light',
	},
	emailText: {
		fontSize: 16,
		textAlign: 'left',
		alignSelf: 'flex-start',
		fontFamily: 'SourceSansPro-Light',
		marginTop: 4
	},
	deleteIconImage: {
		width: 30,
		height: 30,
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
	profilePictureStyle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: 'grey'
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
	usertypeContainer: {
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

export default ManageUsers;