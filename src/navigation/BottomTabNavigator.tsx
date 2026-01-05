import CustomTabBar from '@/navigation/components/CustomTabBar.tsx';
import MoreScreen from '@/screens/MoreScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import ChatStackNavigator from './app-stack/ChatStackNavigator';
import HomeStackNavigator from './app-stack/HomeStackNavigator';
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
          title: 'HOME',
        }}
      />
      <Tab.Screen
        name="CHAT"
        component={ChatStackNavigator}
        options={{
          title: 'CHAT',
        }}
      />
      <Tab.Screen
        name="MARKETPLACE"
        component={ShopStackNavigator}
        options={{
          title: 'MARKETPLACE',
        }}
      />
      <Tab.Screen
        name="MORE"
        component={MoreScreen}
        options={{
          title: 'MORE',
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
