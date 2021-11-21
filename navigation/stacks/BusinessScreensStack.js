import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Header from '../../components/Header';

import BusinessBalance from '../../screens/BusinessBalance';
import AllBusinessBalances from '../../screens/superAdmin/AllBusinessBalances';
import ManageUsers from '../../screens/manageUsers/ManageUsers';
import ManageVenues from '../../screens/venues/ManageVenues';
import ManageEvents from '../../screens/events/ManageEvents';
import AllTransactions from '../../screens/payments/AllTransactions';
import ManageBusiness from '../../screens/ManageBusiness';
import BusinessUserSignup from '../../screens/manageUsers/BusinessUserSignup';
import TransactionDetail from '../../screens/payments/TransactionDetail';
import VenueDetails from '../../screens/venues/VenueDetails';
import EventDetails from '../../screens/events/EventDetails';
import MyProfile from '../../screens/MyProfile';
import MySettings from '../../screens/MySettings';
import BusinessSettings from '../../screens/BusinessSettings';
import CreateEvent from '../../screens/events/CreateEvent';
import CreateVenue from '../../screens/venues/CreateVenue';
import AdminManageUsers from '../../screens/superAdmin/AdminManageUsers';
import BusinessUserDetail from '../../screens/superAdmin/BusinessUserDetail';
import AdminManageSites from '../../screens/superAdmin/AdminManageSites';
import RefundTransaction from '../../screens/payments/RefundTransaction';
import RefundByNFC from '../../screens/refund/RefundByNFC';
import RefundByEmail from '../../screens/refund/RefundByEmail';
import AddWandoos from '../../screens/addWandoos/AddWandoos';
import AddWandoosByEmail from '../../screens/addWandoos/AddWandoosByEmail';
import RemoveWandoos from '../../screens/removeWandoos/RemoveWandoos';
import RemoveWandoosByEmail from '../../screens/removeWandoos/RemoveWandoosByEmail';
import { store } from '../../redux/Store';
import PayoutScreen from '../../screens/payout/PayoutScreen';
import PayoutHistory from '../../screens/payout/PayoutHistory';
import CreateWcashlessAccount from '../../screens/wcashlessUser/CreateWcashlessAccount';
import TransactionsHistory from '../../screens/payments/TransactionsHistory';
import EditVenue from '../../screens/venues/EditVenue';
import VenueReviews from '../../screens/venues/VenueReviews';
import VenueOffers from '../../screens/venues/VenueOffers';
import EditEvent from '../../screens/events/EditEvent';
import EventReviews from '../../screens/events/EventReviews';
import Analytics from '../../screens/payments/Analytics';

const Stack = createStackNavigator();

const BusinessScreensStack = ({ navigation, route }) => {

  const mainHeader = (navigation, title, isBack = true, showProfile = true) => {
    return <Header navigation={navigation} title={title} showProfile={showProfile} back={isBack} />
  }

  return (
    <Stack.Navigator
      initialRouteName="ManageBusiness"
      presentation="card"
    >
      <Stack.Screen
        name="ManageBusiness"
        component={ManageBusiness}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", false, false),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="TransactionsHistory"
        component={TransactionsHistory}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "Transactions"),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="AllTransactions"
        component={AllTransactions}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "All transactions"),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="TransactionDetail"
        component={TransactionDetail}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "Transaction detail"),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="RefundTransaction"
        component={RefundTransaction}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "Refund transaction"),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="Analytics"
        component={Analytics}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", true, true),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="BusinessBalance"
        component={BusinessBalance}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, ""),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="PayoutScreen"
        component={PayoutScreen}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, ""),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="PayoutHistory"
        component={PayoutHistory}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "Payout history"),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="ManageUsers"
        component={ManageUsers}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "Business users"),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="BusinessUserSignup"
        component={BusinessUserSignup}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "Add business user"),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="ManageVenues"
        component={ManageVenues}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "My venues", true, true),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="CreateVenue"
        component={CreateVenue}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", true, false),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="VenueDetails"
        component={VenueDetails}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", true, false),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="VenueReviews"
        component={VenueReviews}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "Venue reviews", true, true),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="VenueOffers"
        component={VenueOffers}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "Venue offers", true, true),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="EditVenue"
        component={EditVenue}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", true, false),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="ManageEvents"
        component={ManageEvents}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "My events"),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="CreateEvent"
        component={CreateEvent}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", true, false),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="EventDetails"
        component={EventDetails}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", true, false),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="EditEvent"
        component={EditEvent}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", true, false),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="EventReviews"
        component={EventReviews}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "Event reviews", true, true),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="MyProfile"
        component={MyProfile}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", true, false),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="MySettings"
        component={MySettings}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", true, false),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="BusinessSettings"
        component={BusinessSettings}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", true, false),
          headerTransparent: true
        }}
      />

      {/* Super Admin */}
      <Stack.Screen
        name="AllBusinessBalances"
        component={AllBusinessBalances}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, ""),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="AdminManageUsers"
        component={AdminManageUsers}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "All business users"),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="BusinessUserDetail"
        component={BusinessUserDetail}
        options={{
          header: ({ navigation, route }) => mainHeader(navigation, "", true, false),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="AdminManageSites"
        component={AdminManageSites}
        options={{
          header: ({ navigation, route, scene }) => mainHeader(navigation, route.params?.type === 'Venue' ? "All venues" : "All events", true, true),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="RefundByEmail"
        component={RefundByEmail}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "Refund by Email", scene, true),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="RefundByNFC"
        component={RefundByNFC}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", scene, true),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="AddWandoos"
        component={AddWandoos}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", scene, true),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="AddWandoosByEmail"
        component={AddWandoosByEmail}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "add wandoOs", scene, true),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="RemoveWandoos"
        component={RemoveWandoos}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", scene, true),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="RemoveWandoosByEmail"
        component={RemoveWandoosByEmail}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "", scene, true),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="CreateWcashlessAccount"
        component={CreateWcashlessAccount}
        options={{
          header: ({ navigation, scene }) => mainHeader(navigation, "Add wcashless user", true),
          headerTransparent: true
        }}
      />
    </Stack.Navigator>

  )
}

export default BusinessScreensStack;