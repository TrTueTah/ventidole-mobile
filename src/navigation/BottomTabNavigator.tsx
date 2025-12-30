import CustomTabBar from '@/navigation/components/CustomTabBar.tsx';
import ChatScreen from '@/screens/ChatScreen';
import HomeScreen from '@/screens/home';
import MarketplaceScreen from '@/screens/MarketplaceScreen';
import MoreScreen from '@/screens/MoreScreen';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
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
        component={HomeScreen}
        options={{
          title: 'HOME',
        }}
      />
      <Tab.Screen
        name="CHAT"
        component={ChatScreen}
        options={{
          title: 'CHAT',
        }}
      />
      <Tab.Screen
        name="MARKETPLACE"
        component={MarketplaceScreen}
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
