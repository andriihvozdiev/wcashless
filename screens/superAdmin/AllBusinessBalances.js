import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View, Image, ImageBackground, FlatList, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-elements';
import { Searchbar } from 'react-native-paper';
import RNCountry from "react-native-countries";
import Flag from 'react-native-round-flags';

import { businessApiService } from '../../service';
import LoadingIndicator from '../../components/LoadingIndicator';
import BasicScreen from '../../components/BasicScreen';
import { commonStyles, fontStyles } from '../../styles/styles';
import BlueButton from '../../components/BlueButton';
import theme from '../../constants/Theme';

const { width, height } = Dimensions.get('screen');

const logo = require('../../assets/images/wpay_circle_disabled.png');
const mexico_flag = require('../../assets/images/mexico_flag.png');

const AllBusinessBalances = ({
	navigation
}) => {
	const scrollViewRef = useRef();

	const [isLoading, setLoading] = useState(false);

	const initialStatics = {
		count: 0,
		sum: 0
	}
	const [statisticsOfWeek, setStatisticsOfWeek] = useState(initialStatics);
	const [statisticsOfMonth, setStatisticsOfMonth] = useState(initialStatics);
	const [statisticsOfYear, setStatisticsOfYear] = useState(initialStatics);

	const [allBusinesses, setAllBusinesses] = useState([]);
	const [businesses, setBusinesses] = useState([]);
	const [totalSize, setTotalSize] = useState(0);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const PageSize = 4;

	const countryNamesWithCodes = RNCountry.getCountryNamesWithCodes;

	useEffect(() => {
		setPage(1);
		setTotalSize(0);
		setBusinesses([]);
		setAllBusinesses([]);
		getAllBusinesses();
	}, [])

	const getAllBusinesses = async () => {
		setLoading(true);
		const result = await businessApiService.getAllBusiness(page, PageSize);
		setLoading(false);
		if (!result.error && result.data) {
			const newBusinesses = result.data.data;
			setAllBusinesses([...allBusinesses, ...newBusinesses]);
			onChangeSearch(search);
			const pagination = result.data?.meta?.pagination;
			setTotalSize(pagination?.total);
			if (pagination?.page <= pagination.pageCount) {
				setPage(page + 1);
			}
		}
	}

	const loadMoreData = async () => {
		await getAllBusinesses();
	}

	const onChangeSearch = async (query) => {
		setSearch(query);

		if (!query || query == '') {
			setBusinesses(allBusinesses);
		} else {
			const searchQuery = query.toLowerCase();

			const searched = allBusinesses.filter(item => (
				item.name?.toLowerCase().includes(searchQuery)
			));
			setBusinesses(searched);
		}
	}

	const numberWithCommas = (x) => {
		if (x == undefined) return '0';
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	const renderItem = ({ item }) => {
		const business = item;
		const imageUrl = business.photo?.url;

		const businessCountry = countryNamesWithCodes.find(element => (element.code == business?.country));
		const businessCountryName = businessCountry?.name;

		return (
			<TouchableOpacity
				onPress={() => { navigation.navigate('AllTransactions', { selectedBusiness: business }) }}
				key={business.id}
				style={{ width: width * 0.85, flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
				<Image source={imageUrl ? { uri: imageUrl } : logo} style={styles.businessLogo} />
				<View style={styles.businessInfoContainer}>
					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>Business</Text>
						<Text style={styles.rowDescription}>{business?.name}</Text>
					</View>
					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>wandoOs total</Text>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<Text style={{ ...styles.rowValue, color: theme.COLORS.SUCCESS }}>MXW</Text>
							<Text style={{ ...styles.rowValue, color: theme.COLORS.BLACK, marginLeft: 4 }}>{numberWithCommas(business?.wallet?.balance)}</Text>
						</View>
					</View>
					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>Number of transactions</Text>
						<Text style={styles.rowValue}>{numberWithCommas('0')}</Text>
					</View>
					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>Local currency payout value</Text>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							<Text style={{ ...styles.rowValue, color: theme.COLORS.SUCCESS }}>MXN</Text>
							<Text style={{ ...styles.rowValue, color: theme.COLORS.BLACK, marginLeft: 4 }}>{numberWithCommas('0')}</Text>
						</View>
					</View>
					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>Country</Text>
						<View style={{ flexDirection: 'row', alignItems: 'center' }}>
							{business?.country && <Flag code={business?.country} style={{width: 15, height: 15}}/>}
							<Text style={{ ...styles.rowDescription, marginLeft: 8 }}>{businessCountryName}</Text>
						</View>
					</View>
					<View style={styles.rowItem}>
						<Text style={styles.rowTitle}>Location</Text>
						<Text style={styles.rowDescription}>{business?.city}</Text>
					</View>
					<View style={{ ...styles.rowItem, justifyContent: 'flex-end', marginTop: 4 }}>
						<BlueButton
							title='Payout'
							width={75}
							height={20}
							fontSize={12}
							titleStyle={{ ...fontStyles.semibold, color: 'white' }}
							onPressListener={() => { navigation.navigate('PayoutScreen', { business: business }) }}
						/>
					</View>
				</View>
			</TouchableOpacity>
		);
	}

	return (
		<BasicScreen
			scrollViewRef={scrollViewRef}
		>

			{isLoading &&
				<LoadingIndicator />
			}

			<Text style={{ ...commonStyles.headerTitle, alignSelf: 'flex-start' }}>
				All business
			</Text>

			<Searchbar
				placeholder="Type Here..."
				onChangeText={onChangeSearch}
				value={search}
				style={commonStyles.searchbar}
				iconColor={theme.COLORS.BORDER_COLOR}
				inputStyle={commonStyles.searchbarInputStyle}
			/>

			<Text style={{ ...fontStyles.semibold, fontSize: 15, alignSelf: 'flex-start', marginTop: 30 }}>Latest</Text>
			<View style={{ ...styles.paymentRow, marginTop: 8 }}>
				<View style={styles.rowItem}>
					<Text style={{ ...fontStyles.regular, fontSize: 13 }}>This week</Text>
					<View style={styles.currencyView}>
						<Image source={mexico_flag} style={styles.flagIcon} />
						<Text style={styles.currencyText}>MXW</Text>
					</View>
					<Text style={styles.amountText}>{numberWithCommas(statisticsOfWeek?.sum)}</Text>
				</View>

				<View style={styles.rowItem}>
					<Text style={{ ...fontStyles.semibold, fontSize: 13 }}>Number of transactions</Text>
					<Text style={styles.amountText}>{numberWithCommas(statisticsOfWeek?.count)}</Text>
				</View>
			</View>

			<View style={styles.paymentRow}>
				<View style={styles.rowItem}>
					<Text style={{ ...fontStyles.regular, fontSize: 13 }}>This month</Text>
					<View style={styles.currencyView}>
						<Image source={mexico_flag} style={styles.flagIcon} />
						<Text style={styles.currencyText}>MXW</Text>
					</View>
					<Text style={styles.amountText}>{numberWithCommas(statisticsOfMonth?.sum)}</Text>
				</View>

				<View style={styles.rowItem}>
					<Text style={{ ...fontStyles.semibold, fontSize: 13 }}>Number of transactions</Text>
					<Text style={styles.amountText}>{numberWithCommas(statisticsOfMonth?.count)}</Text>
				</View>
			</View>

			<View style={styles.paymentRow}>
				<View style={styles.rowItem}>
					<Text style={{ ...fontStyles.regular, fontSize: 13 }}>This year</Text>
					<View style={styles.currencyView}>
						<Image source={mexico_flag} style={styles.flagIcon} />
						<Text style={styles.currencyText}>MXW</Text>
					</View>
					<Text style={styles.amountText}>{numberWithCommas(statisticsOfYear?.sum)}</Text>
				</View>

				<View style={styles.rowItem}>
					<Text style={{ ...fontStyles.semibold, fontSize: 13 }}>Number of transactions</Text>
					<Text style={styles.amountText}>{numberWithCommas(statisticsOfYear?.count)}</Text>
				</View>
			</View>
			<TouchableOpacity style={{alignSelf: 'flex-start', marginTop: 12}} onPress={() => {navigation.navigate('AllTransactions')}}>
				<Text style={{...fontStyles.semibold, color: theme.COLORS.BLUE}}>See all</Text>
			</TouchableOpacity>

			<Text style={{ ...fontStyles.semibold, fontSize: 15, alignSelf: 'flex-start', marginTop: 30 }}>All business (latest)</Text>
			<FlatList
				data={(!search || search == '') ? allBusinesses : businesses}
				renderItem={renderItem}
				keyExtractor={(item) => item.id}
				style={{ flex: 1 }}
				onEndReachedThreshold={0.2}
				onEndReached={(totalSize > allBusinesses.length) && loadMoreData}
			/>

		</BasicScreen>
	);
}

const styles = StyleSheet.create({
	paymentRow: {
		width: '100%',
		marginTop: 10,
		backgroundColor: '#F7F7F7',
		borderWidth: 1,
		borderColor: '#5C5C5C',
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 10
	},
	currencyView: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center'
	},
	flagIcon: {
			width: 20,
			height: 20,
			marginLeft: 8
	},
	currencyText: {
			...fontStyles.semibold,
			fontSize: 14,
			marginLeft: 4,
			color: theme.COLORS.SUCCESS
	},
	amountText: {
			...fontStyles.semibold,
			fontSize: 15,
			width: 60,
			marginLeft: 8,
			textAlign: 'right',
	},
	businessLogo: {
		width: 50,
		height: 50,
		borderRadius: 25,
		borderWidth: 0.5,
		borderColor: theme.COLORS.GREY_COLOR
	},
	businessInfoContainer: {
		flex: 1,
		marginLeft: 8,
		backgroundColor: '#F7F7F7',
		borderWidth: 1,
		borderColor: theme.COLORS.BORDER_COLOR,
		borderRadius: 16,
		paddingHorizontal: 12,
		paddingVertical: 10
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
		color: theme.COLORS.BLUE
	},
	rowValue: {
		...fontStyles.semibold,
		fontSize: 14,
	},
});

export default AllBusinessBalances;