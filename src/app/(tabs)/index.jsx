import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, ScrollView } from "react-native";

import Screen from "../../components/ui/Screen";
import TextApp from "../../components/ui/TextApp";
import PlaceCard from "../../components/places/PlaceCard";
import { getFeaturedPlaces, getPlaces } from "../../services/places.service";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/ui/Avatar";
import Advertising from "../../components/Advertising";

export default function Home() {
    const { user } = useAuth();

    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadPlaces = useCallback(async () => {
        try {
            setError("");

            let featured = await getFeaturedPlaces();

            // Si aún no hay destacados, mostramos lugares activos.
            if (!featured.length) {
                featured = (await getPlaces()).slice(0, 6);
            }

            setPlaces(featured);
        } catch (err) {
            console.error("Error cargando lugares:", err.message);
            setError("No pudimos cargar los lugares. Inténtalo nuevamente.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPlaces();
    }, [loadPlaces]);

    return (
        <Screen padding={0}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View>
                        <TextApp size="md" color="muted">Bienvenido,</TextApp>
                        <TextApp font="bold" size="4xl" color="black">Julian</TextApp>
                    </View>
                    <Avatar name={(user?.email?.[0] || "Anónimo").toUpperCase()}/>
                </View>

                <Advertising />

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <TextApp font="bold" size="xl" color="#181818">Lugares destacados</TextApp>
                    </View>

                    {loading ? (
                        <ActivityIndicator color="#F90050" />
                    ) : error ? (
                        <TextApp color="#767676" size="sm">{error}</TextApp>
                    ) : places.length ? (
                        places.map(place => (
                            <PlaceCard key={place.id} place={place} />
                        ))
                    ) : (
                        <TextApp color="#767676" size="sm">Próximamente encontrarás aquí lugares destacados.</TextApp>
                    )}
                </View>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 28,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingVertical: 20,
        justifyContent: "space-between",
        gap: 12,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: .5,
        borderBottomColor: "#EEEEEE",
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#FCE7EF",
        alignItems: "center",
        justifyContent: "center",
    },
    intro: {
        backgroundColor: "#FFFFFF",
        padding: 20,
        borderRadius: 20,
        gap: 9,
        borderWidth: 1,
        borderColor: "#EEEEEE",
    },
    publish: {
        flex: 1,
        gap: 12,
    },
    publishItem: {
        flex: 1,
        height: 160,
        backgroundColor: "#FCE7EF",
        borderRadius: 20,
    },
    section: {
        gap: 15,
        paddingHorizontal: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
});