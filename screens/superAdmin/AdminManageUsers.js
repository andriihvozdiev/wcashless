import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View, TouchableOpacity, Image, Alert, ImageBackground, FlatList } from 'react-native';
import { Text } from 'react-native-elements';
import { Searchbar } from 'react-native-paper';
import moment from 'moment';
import DropDownPicker from 'react-native-dropdown-picker';
import { Dialog } from 'react-native-simple-dialogs';

import { store } from '../../redux/Store';
import LoadingIndicator from '../../components/LoadingIndicator';
import BasicScreen from '../../components/BasicScreen';
import { businessApiService } from '../../service';
import { commonStyles, fontStyles } from '../../styles/styles';
import { logoutUser } from '../../redux/actions/UserActions';
import theme from '../../constants/Theme';
import BlueButton from '../../components/BlueButton';

const { width, height } = Dimensions.get('screen');

const avatar = require('../../assets/images/avatar.png');
const dropdown_icon = require('../../assets/images/dropdown.png');
const close_icon = require('../../assets/images/close.png');

const AdminManageUsers = ({
	navigation
}) => {
	const scrollViewRef = useRef();

	const [isLoading, setLoading] = useState(false);
	const [users, setUsers] = useState([]);
	const [allUsers, setAllUsers] = useState([]);
	const [search, setSearch] = useState('');

	const [page, setPage] = useState(1);
	const PageSize = 50;

	const [selectedUser, setSelectedUser] = useState();
	const [isTypeDialog, showTypeDialog] = useState(false);
	const [isDeleteDialog, showDeleteDialog] = useState(false);

	const [open, setOpen] = useState(false);
	const [selectedUserType, setSelectedUserType] = useState();
	const [roleItems, setRoleItems] = useState([
		{ label: 'Owner', value: 'Owner' },
		{ label: 'Manager', value: 'Manager' },
		{ label: 'Staff', value: 'Staff' },
	]);

	useEffect(() => {
		setPage(1);
		setUsers([]);
		setAllUsers([]);

		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		setLoading(true);
		const result = await businessApiService.getAllBusinessMembers(page, PageSize);
		setLoading(false);

		if (!result.error && result.data) {
			console.log(result.data.data.length);
			const newUsers = result.data.data;
			setAllUsers([...allUsers, ...newUsers]);
			setPage(page + 1);
			onChangeSearch(search);
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

	const onChangeSearch = async (query) => {
		setSearch(query);

		if (!query || query == '') {
			setUsers(allUsers);
		} else {
			const searchQuery = query.toLowerCase();

			const searched = allUsers.filter(item => (
				item.account?.firstName?.toLowerCase().includes(searchQuery) ||
				item.account?.lastName?.toLowerCase().includes(searchQuery) ||
				item.position?.toLowerCase().includes(searchQuery) ||
				moment(item.createdAt).format('yyyy/MM/DD HH:mm').includes(searchQuery) ||
				moment(item.createdAt).format('yyyy/MMMM/DD HH:mm').toLowerCase().includes(searchQuery) ||
				item.business?.name?.toLowerCase().includes(searchQuery)
			));
			setUsers(searched);
		}
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
		setPage(1);
		setUsers([]);
		setAllUsers([]);

		await fetchUsers();
	}

	const deleteUser = async (businessMember) => {
		setLoading(true);
		const result = await businessApiService.deleteBusinessMember(businessMember?.id);
		setLoading(false);

		if (result.error) {
			return;
		}

		// reload
		setPage(1);
		setUsers([]);
		setAllUsers([]);
		await fetchUsers();
	}

	const renderItem = ({ item, index }) => {
		const businessMember = item;
		const account = businessMember?.account;
		const business = businessMember?.business;
		const imageUrl = account?.profilePicture?.url;

		return (
			<TouchableOpacity style={styles.itemContainer} key={index}
				onPress={() => { navigation.navigate('BusinessUserDetail', { businessMember: businessMember }) }}>
				<Image source={imageUrl ? { uri: imageUrl } : avatar} style={styles.profileImageStyle} />
				<View style={styles.itemContent}>
					<View style={styles.rowItem}>
						<Text style={{ ...styles.rowTitle, color: '#444444' }}>
							Business
						</Text>
						<Text style={styles.rowDescription}>
							{business?.name}
						</Text>
					</View>
					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							User name
						</Text>
						<Text style={styles.rowDescription}>
							{account?.firstName} {account?.lastName}
						</Text>
					</View>
					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							User ID
						</Text>
						<Text style={styles.rowDescription}>
							{account?.id}
						</Text>
					</View>
					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							Country
						</Text>
						<Text style={styles.rowDescription}>
							{account?.country}
						</Text>
					</View>
					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>
							Location
						</Text>
						<Text style={styles.rowDescription}>
							{account?.city}
						</Text>
					</View>

					<View style={{ ...styles.rowItem, marginTop: 8 }}>
						<Text style={styles.rowTitle}>
							Manage User
						</Text>
						<TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}
							onPress={() => {
								if (store.getState().user?.account?.id != businessMember?.account?.id) {
									setSelectedUser(businessMember);
									setSelectedUserType(businessMember?.position);
									showTypeDialog(true);
								}
							}}>
							<Text style={styles.rowDescription}>
								{(store.getState().user?.account?.id === businessMember?.account?.id) ? 'Super Admin' : businessMember.position}
							</Text>
						</TouchableOpacity>
					</View>

				</View>
			</TouchableOpacity>
		);
	}

	const loadMoreData = async () => {
		fetchUsers();
	}


	return (
		<BasicScreen
			scrollContainerStyle={styles.scrollView}
			scrollViewRef={scrollViewRef}
			disabledScroll={true}
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
				data={(!search || search == '') ? allUsers : users}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				style={{ flex: 1, marginTop: 20 }}
				onEndReachedThreshold={0.2}
				onEndReached={loadMoreData}
			/>

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
						<Image source={selectedUser?.account?.profilePicture?.url ? { uri: selectedUser?.account?.profilePicture.url } : avatar} style={styles.profileImageStyle} />
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
							source={selectedUser?.account?.profilePicture?.url ? { uri: selectedUser?.account?.profilePicture.url } : avatar}
							style={styles.profileImageStyle}
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
		paddingTop: 20,
		paddingBottom: 10,
	},
	itemContainer: {
		width: width * 0.85,
		marginTop: 8,
		marginBottom: 8,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center'
	},
	profileImageStyle: {
		width: 50,
		height: 50,
		borderRadius: 25,
		marginRight: 4,
		borderColor: theme.COLORS.BORDER_COLOR,
		borderWidth: 0.5
	},
	itemContent: {
		flex: 1,
		borderWidth: 0.5,
		borderColor: theme.COLORS.BORDER_COLOR,
		borderRadius: 16,
		backgroundColor: '#F7F7F7',
		paddingVertical: 8,
		paddingHorizontal: 12,
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

export default AdminManageUsers;