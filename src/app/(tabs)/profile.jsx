import { useState } from "react";
import { Alert, View, StyleSheet } from "react-native";
import { UserRound, Mail, ShieldCheck, LogOut, ChevronRight } from "lucide-react-native";

import Screen from "../../components/ui/Screen";
import TextApp from "../../components/ui/TextApp";
import Button from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
    const { user, profile, isGuest, signOut } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSignOut = () => {
        Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas salir de Ándale Ya!?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Cerrar sesión",
                style: "destructive",
                onPress: async () => {
                    try {
                        setLoading(true);
                        // Stack.Protected redirige a /welcome al desaparecer la sesión.
                        await signOut();
                    } catch (error) {
                        Alert.alert("Error", error.message);
                    } finally {
                        setLoading(false);
                    }
                },
            },
        ]);
    };

    const displayName = profile?.full_name || (isGuest ? "Visitante" : "Usuario");

    return (
        <Screen>
            <View style={styles.container}>
                <View style={styles.heading}>
                    <TextApp size="sm" color="#767676">TU CUENTA</TextApp>
                    <TextApp font="bold" size="4xl" color="#181818">Mi perfil</TextApp>
                </View>

                <View style={styles.profileCard}>
                    <View style={styles.avatar}><UserRound size={32} color="#F90050" /></View>
                    <TextApp font="bold" size="xl" color="#181818">{displayName}</TextApp>
                    <View style={styles.accountType}>
                        <TextApp size="xs" font="semibold" color="#F90050">{isGuest ? "CUENTA DE INVITADO" : "CUENTA REGISTRADA"}</TextApp>
                    </View>
                </View>

                <View style={styles.section}>
                    <TextApp font="semibold" size="lg" color="#181818">Información de cuenta</TextApp>
                    <View style={styles.infoRow}>
                        <Mail size={19} color="#767676" />
                        <View style={styles.infoContent}>
                            <TextApp size="xs" color="#767676">Correo electrónico</TextApp>
                            <TextApp size="sm" color="#181818">{user?.email || "No vinculado"}</TextApp>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <ShieldCheck size={19} color="#767676" />
                        <View style={styles.infoContent}>
                            <TextApp size="xs" color="#767676">Identificador de usuario</TextApp>
                            <TextApp size="xs" color="#181818">{user?.id || "No disponible"}</TextApp>
                        </View>
                    </View>
                </View>

                {isGuest && (
                    <View style={styles.guestNotice}>
                        <TextApp font="semibold" size="md" color="#181818">¡No pierdas tus favoritos!</TextApp>
                        <TextApp size="sm" color="#767676">
                            Estás usando Ándale Ya! como invitado. Más adelante podrás vincular tu cuenta para conservar tu información y acceder desde otros dispositivos.
                        </TextApp>
                        <View style={styles.linkRow}>
                            <TextApp size="sm" font="semibold" color="#F90050">Vincular cuenta</TextApp>
                            <ChevronRight size={17} color="#F90050" />
                        </View>
                    </View>
                )}

                <View style={styles.logout}>
                    <Button variant="secondary" radius="full" icon={LogOut} loading={loading} onPress={handleSignOut}>Cerrar sesión</Button>
                </View>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, gap: 24 },
    heading: { gap: 8 },
    profileCard: { alignItems: "center", backgroundColor: "#FFFFFF", padding: 25, borderRadius: 20, borderWidth: 1, borderColor: "#EEEEEE", gap: 12 },
    avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: "#FCE7EF", alignItems: "center", justifyContent: "center" },
    accountType: { backgroundColor: "#FCE7EF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    section: { backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#EEEEEE", padding: 18, gap: 18 },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    infoContent: { flex: 1, gap: 4 },
    guestNotice: { backgroundColor: "#FFFFFF", borderRadius: 20, borderWidth: 1, borderColor: "#EEEEEE", padding: 18, gap: 10 },
    linkRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 3 },
    logout: { marginTop: 4 },
});
