import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View, Image, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-elements';
import moment from 'moment';
import { businessApiService } from '../service';
import { store } from '../redux/Store';
import theme from '../constants/Theme';
import EmptyGap from '../components/EmptyGap';
import LoadingIndicator from '../components/LoadingIndicator';
import BasicScreen from '../components/BasicScreen';
import BlueButton from '../components/BlueButton';
import { commonStyles, fontStyles } from '../styles/styles';
import Theme from '../constants/Theme';


const { width, height } = Dimensions.get('screen');


const cardBg = require('../assets/card_bg.png');
const logo = require('../assets/logo/wc_white_w.png');
const cardChip = require('../assets/wc_chip.png');
const wpay = require('../assets/logo/wpay_white_w.png');
const mexico_flag = require('../assets/images/mexico_flag.png');

const BusinessBalance = ({
    navigation,
    wandUser
}) => {

    const [user, setUser] = useState(store.getState().user);
    const [business, setBusiness] = useState(store.getState().business);

    const [businessBalance, setBusinessBalance] = useState(0);
    const initialStatics = {
        count: 0,
        sum: 0
    }
    const [statisticsOfWeek, setStatisticsOfWeek] = useState(initialStatics);
    const [statisticsOfMonth, setStatisticsOfMonth] = useState(initialStatics);
    const [statisticsOfYear, setStatisticsOfYear] = useState(initialStatics);

    const [isLoading, setLoading] = useState(false);


    useEffect(() => {
        getBalance();
        getStatistics();
    }, [])

    const getBalance = async () => {
        setLoading(true);
        const result = await businessApiService.getBusiness(store.getState().business?.id);
        setLoading(false);
        if (!result.error && result.data) {
            setBusinessBalance(result.data?.wallet?.balance);
        }
    }

    const getStatistics = async () => {
        const busineId = store.getState().business?.id;

        const today = moment().isoWeekday();

        const startOfWeek = moment().subtract(today - 1, 'days').format('YYYY-MM-DD');
        const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
        const startOfYear = moment().startOf('year').format('YYYY-MM-DD');

        setLoading(true);
        var result = await businessApiService.getStatistics(busineId, startOfWeek);
        setLoading(false);
        if (!result.error && result.data) {
            const statistics = result.data.data;
            setStatistic(statistics, 'week');
        }

        setLoading(true);
        var result = await businessApiService.getStatistics(busineId, startOfMonth);
        setLoading(false);
        if (!result.error && result.data) {
            const statistics = result.data.data;
            setStatistic(statistics, 'month');
        }

        setLoading(true);
        var result = await businessApiService.getStatistics(busineId, startOfYear);
        setLoading(false);

        if (!result.error && result.data) {
            const statistics = result.data.data;
            setStatistic(statistics, 'year');
        }
    }

    const setStatistic = async (statistics, duration) => {
        var sum = 0;
        var count = 0;
        statistics.forEach(element => {
            const analytics = element.analytics;

            if (analytics?.length > 0) {
                analytics.map((statistic) => {        
                    if (statistic?.type === 'payment') {
                        sum += statistic?.sum;
                        count += parseInt(statistic?.count);
                    }
                    if (statistic?.type === 'refund') {
                        sum -= statistic?.sum;
                        count += parseInt(statistic?.count);
                    }
                    if (statistic?.type === 'topup') {
                        sum += statistic?.sum;
                        count += parseInt(statistic?.count);
                    }
                });
            }
        });
        

        switch (duration) {
            case 'week':
                setStatisticsOfWeek({
                    count, sum
                })
                break;
            case 'month':
                setStatisticsOfMonth({
                    count, sum
                })
                break;
            case 'year':
                setStatisticsOfYear({
                    count, sum
                })
                break;
            default:
                break;
        }
    }

    const numberWithCommas = (x) => {
        if (x == undefined) return '0';
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    return (
        <BasicScreen>

            {isLoading &&
                <LoadingIndicator />
            }

            <Text style={{ ...commonStyles.headerTitle, alignSelf: 'flex-start' }}>Balance</Text>

            <Text style={styles.title}>Current business wandoOs</Text>
            <View style={styles.cardContainer}>
                <Image source={cardBg} style={styles.cardBgImage}></Image>
                <Image source={logo} style={styles.cardLogoImage}></Image>
                <Image source={cardChip} style={styles.cardChipImage}></Image>
                <View style={styles.balanceRow}>
                    <View>
                        <Text style={styles.cardTitle}>Business wandoO</Text>
                        <Text style={styles.cardTitle}>balance: </Text>
                    </View>
                    <Text style={{ ...styles.cardTitle, marginLeft: 12 }}>{numberWithCommas(businessBalance)}</Text>
                </View>

                <Text style={{ ...styles.cardTitle, ...styles.businessName }}>{business?.name}</Text>
                <View style={styles.memberIdRow}>
                    <Text style={styles.memberTitle}>business ID: </Text>
                    <Text style={{ ...styles.memberDescription, marginLeft: 28 }}>{business?.id}</Text>
                </View>
                <View style={styles.memberDateRow}>
                    <Text style={styles.memberTitle}>created since: </Text>
                    <Text style={{ ...styles.memberDescription, marginLeft: 6 }}>{moment(business?.createdAt).format('MMM Do, YYYY')}</Text>
                </View>

                <Image source={wpay} style={styles.wpayIcon}></Image>
            </View>

            <View style={{ ...styles.paymentRow, marginTop: 20 }}>
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

            <TouchableOpacity style={{ alignSelf: 'flex-start', marginLeft: 16, paddingVertical: 12 }}
                onPress={() => { navigation.navigate('PayoutHistory') }}>
                <Text style={{ ...fontStyles.semibold, color: Theme.COLORS.BLUE, fontSize: 16 }}>See all</Text>
            </TouchableOpacity>

            <EmptyGap />

            <BlueButton
                title='Payout'
                width={width * 0.75}
                style={{ marginTop: 24 }}
                onPressListener={() => { navigation.navigate('PayoutScreen') }}
            />

        </BasicScreen>
    );
}

const styles = StyleSheet.create({
    title: {
        ...fontStyles.bold,
        fontSize: 20,
        alignSelf: 'flex-start',
        color: 'black',
        marginTop: 16,
        marginBottom: 12
    },
    subTitle: {
        ...fontStyles.bold,
        alignSelf: 'flex-start',
        fontSize: 20,
        color: 'black',
        marginTop: 30,
        marginBottom: 16
    },
    cardContainer: {
        position: 'relative',
        width: 300,
        height: 180,
    },
    cardBgImage: {
        width: 300,
        height: 180,
        resizeMode: 'stretch',
        position: 'absolute',
    },
    cardLogoImage: {
        top: 10,
        left: 16,
        width: 130,
        height: 40,
        resizeMode: 'contain',
        position: 'absolute',
    },
    cardChipImage: {
        position: 'absolute',
        top: 54,
        left: 20,
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    balanceRow: {
        position: 'absolute',
        top: 52,
        left: 70,
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardTitle: {
        ...fontStyles.bold,
        fontSize: 15,
        color: 'white'
    },
    businessName: {
        position: 'absolute',
        top: 100,
        left: 16
    },
    memberIdRow: {
        position: 'absolute',
        top: 130,
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
        ...fontStyles.regular,
        fontSize: 12,
        color: 'white'
    },
    memberDateRow: {
        position: 'absolute',
        top: 150,
        left: 16,
        alignSelf: 'flex-start',
        flexDirection: 'row'
    },
    wpayIcon: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 40,
        height: 40,
        resizeMode: 'contain'
    },
    paymentRow: {
        width: width * 0.85,
        marginTop: 10,
        backgroundColor: '#F7F7F7',
        borderWidth: 1,
        borderColor: '#5C5C5C',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10
    },
    rowItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
});

export default BusinessBalance;