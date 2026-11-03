import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";

import Screen from "../../components/ui/Screen";
import TextApp from "../../components/ui/TextApp";
import PlaceCard from "../../components/places/PlaceCard";
import { getFeaturedPlaces, getPlaces } from "../../services/places.service";
import { useAuth } from "../../context/AuthContext";

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
        <Screen>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View>
                        <TextApp size="sm" color="#767676">
                            ÁNDALE YA! · JUNÍN
                        </TextApp>

                        <TextApp font="bold" size="3xl" color="#181818">
                            ¡Bienvenido a Jauja!
                        </TextApp>
                    </View>

                    <View style={styles.avatar}>
                        <TextApp font="bold" color="#F90050" size="lg">
                            {(user?.email?.[0] || "V").toUpperCase()}
                        </TextApp>
                    </View>
                </View>

                <View style={styles.intro}>
                    <TextApp font="medium" size="xl" color="#181818">
                        Descubre, explora y vive Jauja.
                    </TextApp>

                    <TextApp size="sm" color="#767676">
                        Encuentra lugares increíbles, conoce nuestra cultura
                        y descubre nuevas experiencias en la provincia.
                    </TextApp>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <TextApp font="bold" size="xl" color="#181818">
                            Lugares destacados
                        </TextApp>

                        <TextApp size="xs" color="#767676">
                            JAUJA, JUNÍN
                        </TextApp>
                    </View>

                    {loading ? (
                        <ActivityIndicator color="#F90050" />
                    ) : error ? (
                        <TextApp color="#767676" size="sm">
                            {error}
                        </TextApp>
                    ) : places.length ? (
                        places.map(place => (
                            <PlaceCard key={place.id} place={place} />
                        ))
                    ) : (
                        <TextApp color="#767676" size="sm">
                            Próximamente encontrarás aquí lugares destacados.
                        </TextApp>
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
        justifyContent: "space-between",
        gap: 12,
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
    section: {
        gap: 15,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
});