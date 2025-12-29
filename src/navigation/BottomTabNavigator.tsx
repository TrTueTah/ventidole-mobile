import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "./types";
import HomeScreen from "@/screens/home";
import MoreScreen from "@/screens/MoreScreen";
import CustomTabBar from "@/navigation/components/CustomTabBar.tsx";

const Tab = createBottomTabNavigator<MainTabParamList>();

const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HOME"
        component={HomeScreen}
        options={{
          title: "HOME",
        }}
      />
      <Tab.Screen
        name="MORE"
        component={MoreScreen}
        options={{
          title: "MORE",
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
