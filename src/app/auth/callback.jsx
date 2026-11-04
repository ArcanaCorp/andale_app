import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";

import Screen from "../../components/ui/Screen";
import TextApp from "../../components/ui/TextApp";
import { useAuth } from "../../context/AuthContext";

export default function OAuthCallback() {
    const { session } = useAuth();

    // AuthContext completa el intercambio PKCE antes de establecer la sesión.
    if (session) {
        return <Redirect href="/(tabs)" />;
    }

    return (
        <Screen>
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#F90050" />
                <TextApp font="semibold" size="lg" color="#181818">
                    Completando tu inicio de sesión...
                </TextApp>
                <TextApp size="sm" color="#767676">
                    Estamos verificando tu cuenta. No cierres la aplicación.
                </TextApp>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        padding: 24,
    },
});
