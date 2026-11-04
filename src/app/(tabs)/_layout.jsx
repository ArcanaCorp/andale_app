import { Tabs } from "expo-router";
import { House, Compass, Heart, UserRound } from "lucide-react-native";

import { tokens } from "../../theme/tokens";

export default function TabsLayout() {

    return (
        <Tabs
            screenOptions={{
                headerShown: false,

                tabBarActiveTintColor: tokens.colors.primary,
                tabBarInactiveTintColor: tokens.colors.gray,

                tabBarHideOnKeyboard: true,

                tabBarStyle: {
                    height: 68,
                    paddingTop: 8,
                    paddingBottom: 8,
                    backgroundColor: tokens.colors.white,
                    borderTopWidth: 1,
                    borderTopColor: "#EEEEEE",
                    elevation: 0,
                },

                tabBarLabelStyle: {
                    fontFamily: tokens.font.medium,
                    fontSize: 11,
                },

                tabBarItemStyle: {
                    paddingVertical: 2,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Inicio",
                    tabBarIcon: ({ color, focused }) => ( <House size={22} color={color} strokeWidth={focused ? 2 : 1.5}/> ),
                }}
            />

            <Tabs.Screen
                name="explore"
                options={{
                    title: "Explorar",
                    tabBarIcon: ({ color, focused }) => ( <Compass size={22} color={color} strokeWidth={focused ? 2 : 1.5}/> ),
                }}
            />

            <Tabs.Screen
                name="favorites"
                options={{
                    title: "Favoritos",
                    tabBarIcon: ({ color, focused }) => ( <Heart size={22} color={color} strokeWidth={focused ? 2 : 1.5}/> ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Perfil",
                    tabBarIcon: ({ color, focused }) => ( <UserRound size={22} color={color} strokeWidth={focused ? 2 : 1.5}/> ),
                }}
            />
        </Tabs>
    );
}
