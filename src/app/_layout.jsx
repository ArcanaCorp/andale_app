import { Stack, useRouter, useSegments } from "expo-router";
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
    const { user, loading } = useAuth();

    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (!fontsReady || loading || segments.length === 0) return;

        const firstSegment = segments[0];
        const isLogin = firstSegment === "index";

        // Si el usuario está autenticado, no debe quedarse en Login.
        if (user && isLogin) {
            router.replace("/(tabs)");
            return;
        }

        // Si no está autenticado, debe volver al Login.
        if (!user && !isLogin) {
            router.replace("/");
        }
    }, [user, loading, segments, fontsReady, router]);

    useEffect(() => {
        if (fontsReady && !loading) {
            SplashScreen.hideAsync().catch(() => {});
        }
    }, [fontsReady, loading]);

    if (!fontsReady || loading) return null;

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
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