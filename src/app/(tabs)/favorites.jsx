import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Heart } from "lucide-react-native";

import Screen from "../../components/ui/Screen";
import TextApp from "../../components/ui/TextApp";
import PlaceCard from "../../components/places/PlaceCard";
import { getFavoritePlaces } from "../../services/places.service";
import { useAuth } from "../../context/AuthContext";

export default function Favorites() {
    const { user } = useAuth();

    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadFavorites = useCallback(async () => {
        try {
            setError("");
            const data = await getFavoritePlaces(user?.id);
            setPlaces(data);
        } catch (err) {
            console.error("Error cargando favoritos:", err.message);
            setError("No pudimos cargar tus favoritos.");
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        loadFavorites();
    }, [loadFavorites]);

    return (
        <Screen>
            <View style={styles.container}>
                <View style={styles.heading}>
                    <TextApp size="sm" color="#767676">
                        TU COLECCIÓN PERSONAL
                    </TextApp>

                    <TextApp font="bold" size="4xl" color="#181818">
                        Favoritos
                    </TextApp>

                    <TextApp size="sm" color="#767676">
                        Guarda los lugares que quieres visitar.
                    </TextApp>
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
                    <View style={styles.empty}>
                        <Heart size={38} color="#F90050" />
                        <TextApp font="semibold" size="lg" color="#181818">
                            Aún no tienes favoritos
                        </TextApp>
                        <TextApp size="sm" color="#767676" style={styles.center}>
                            Cuando guardes un lugar, aparecerá aquí para que
                            puedas encontrarlo fácilmente.
                        </TextApp>
                    </View>
                )}
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 22,
    },
    heading: {
        gap: 8,
    },
    empty: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 65,
        paddingHorizontal: 25,
        gap: 14,
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#EEEEEE",
    },
    center: {
        textAlign: "center",
        lineHeight: 21,
    },
});