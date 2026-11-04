import { Stack } from "expo-router";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import Providers from "../providers";
import * as SplashScreen from "expo-splash-screen";

import LightOutfit from "../../assets/fonts/Outfit-Light.ttf";
import RegularOutfit from "../../assets/fonts/Outfit-Regular.ttf";
import MediumOutfit from "../../assets/fonts/Outfit-Medium.ttf";
import SemiBoldOutfit from "../../assets/fonts/Outfit-SemiBold.ttf";
import BoldOutfit from "../../assets/fonts/Outfit-Bold.ttf";

import { useAuth } from "../context/AuthContext";

SplashScreen.preventAutoHideAsync().catch(() => {});

function Routes({ fontsReady }) {
    const { session, loading } = useAuth();
    const hasSession = Boolean(session);

    useEffect(() => {
        if (fontsReady && !loading) {
            SplashScreen.hideAsync().catch(() => {});
        }
    }, [fontsReady, loading]);

    // No renderizar rutas hasta conocer el estado persistido de Supabase.
    if (!fontsReady || loading) return null;

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/callback" />

            <Stack.Protected guard={!hasSession} redirectTo="/(tabs)">
                <Stack.Screen name="welcome" />
            </Stack.Protected>

            {/* Las sesiones anónimas de Supabase también habilitan la aplicación. */}
            <Stack.Protected guard={hasSession} redirectTo="/welcome">
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="places" />
            </Stack.Protected>
        </Stack>
    );
}

export default function RootLayout() {
    const [fontsLoaded, fontError] = useFonts({
        "Outfit-Light": LightOutfit,
        "Outfit-Regular": RegularOutfit,
        "Outfit-Medium": MediumOutfit,
        "Outfit-SemiBold": SemiBoldOutfit,
        "Outfit-Bold": BoldOutfit,
    });

    if (!fontsLoaded && !fontError) return null;

    return (
        <Providers>
            <Routes fontsReady={fontsLoaded || fontError} />
        </Providers>
    );
}
