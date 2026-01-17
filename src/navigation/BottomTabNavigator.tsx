import CustomTabBar from '@/navigation/components/CustomTabBar.tsx';
import ChatListScreen from '@/screens/app/chat/ChatListScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import HomeStackNavigator from './app-stack/HomeStackNavigator';
import MoreStackNavigator from './app-stack/MoreStackNavigator';
import ShopStackNavigator from './app-stack/ShopStackNavigator';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HOME"
        component={HomeStackNavigator}
        options={{
          title: 'TAB.HOME',
        }}
      />
      <Tab.Screen
        name="CHAT"
        component={ChatListScreen}
        options={{
          title: 'TAB.CHAT',
        }}
      />
      <Tab.Screen
        name="MARKETPLACE"
        component={ShopStackNavigator}
        options={{
          title: 'TAB.MARKETPLACE',
        }}
      />
      <Tab.Screen
        name="MORE"
        component={MoreStackNavigator}
        options={{
          title: 'TAB.MORE',
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
