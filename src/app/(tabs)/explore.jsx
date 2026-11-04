import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Pressable, ScrollView } from "react-native";
import { Search, Shuffle } from "lucide-react-native";

import Screen from "../../components/ui/Screen";
import TextApp from "../../components/ui/TextApp";
import Input from "../../components/ui/Input";
import PlaceCard from "../../components/places/PlaceCard";

import { getRandomPlaces, getPlaceCategories } from "../../services/places.service";
import Chip from "../../components/ui/Chip";

export default function Explore() {
    const [places, setPlaces] = useState([]);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [category, setCategory] = useState("Todos");
    const [categories, setCategories] = useState(["Todos"]);

    const [loading, setLoading] = useState(true);
    const [discovering, setDiscovering] = useState(false);
    const [error, setError] = useState("");

    const requestId = useRef(0);

    // Retrasar la búsqueda para evitar consultas por cada tecla.
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 350);

        return () => clearTimeout(timeout);
    }, [search]);

    // Obtener categorías disponibles.
    useEffect(() => {
        let active = true;

        async function loadCategories() {
            try {
                const data = await getPlaceCategories();

                if (active) {
                    setCategories(data);
                }
            } catch (err) {
                console.error("Error cargando categorías:", err.message);
            }
        }

        loadCategories();

        return () => {
            active = false;
        };
    }, []);

    // Cargar una nueva tanda aleatoria.
    const discoverPlaces = useCallback(async (excludeIds = []) => {
        const currentRequest = ++requestId.current;

        setDiscovering(excludeIds.length > 0);
        setLoading(excludeIds.length === 0);
        setError("");

        try {
            const data = await getRandomPlaces({
                category,
                search: debouncedSearch,
                excludeIds,
            });

            if (requestId.current !== currentRequest) return;

            setPlaces(data);
        } catch (err) {
            if (requestId.current !== currentRequest) return;

            console.error("Error descubriendo lugares:", err.message);
            setError("No pudimos descubrir lugares. Inténtalo nuevamente.");
        } finally {
            if (requestId.current === currentRequest) {
                setLoading(false);
                setDiscovering(false);
            }
        }
    }, [category, debouncedSearch]);

    // Reiniciar resultados cuando cambia la búsqueda o categoría.
    useEffect(() => {
        discoverPlaces([]);

        return () => {
            requestId.current++;
        };
    }, [discoverPlaces]);

    // Descubrir otros 12 lugares, excluyendo la tanda actual.
    const handleDiscoverMore = () => {
        if (discovering || loading || places.length === 0) return;

        const currentIds = places.map(place => place.id);

        discoverPlaces(currentIds);
    };

    const handleCategoryChange = (item) => {
        setCategory(item);
    };

    return (
        <Screen padding={0}>
            <View style={styles.container}>
                <View style={styles.heading}>
                    <View style={{paddingHorizontal: 24, gap: 4}}>
                        <TextApp size="sm" color="muted">CONOCE NUESTRO DESTINO</TextApp>
                        <TextApp font="bold" size="4xl" color="black">Explorar</TextApp>
                        <TextApp size="sm" color="muted">Encuentra lugares turísticos en la provincia de Jauja.</TextApp>
                    </View>

                    <View style={{paddingHorizontal: 24, gap: 4}}>
                        <Input icon={Search} iconPosition="left" placeholder="Buscar lugares, distritos..." value={search} onChangeText={setSearch}/>
                    </View>

                    {categories.length > 1 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
                            {categories.map(item => (
                                <Chip key={item} item={item} selected={category === item} handleCategoryChange={handleCategoryChange} />
                            ))}
                        </ScrollView>
                    )}
                </View>


                <View style={styles.results}>
                    <TextApp font="semibold" size="lg" color="#181818">
                        {loading ? "Descubriendo lugares..." : `${places.length} lugares para descubrir`}
                    </TextApp>

                    {loading ? (
                        <ActivityIndicator color="#F90050" size="large" />
                    ) : error && places.length === 0 ? (
                        <TextApp color="#767676" size="sm">
                            {error}
                        </TextApp>
                    ) : places.length > 0 ? (
                        <>
                            {places.map(place => (
                                <PlaceCard
                                    key={place.id}
                                    place={place}
                                />
                            ))}

                            {error ? (
                                <TextApp color="#767676" size="sm">
                                    {error}
                                </TextApp>
                            ) : null}

                            <Pressable
                                onPress={handleDiscoverMore}
                                disabled={discovering}
                                style={[
                                    styles.discoverButton,
                                    discovering && styles.discoverDisabled,
                                ]}
                            >
                                {discovering ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Shuffle
                                        size={19}
                                        color="#FFFFFF"
                                    />
                                )}

                                <TextApp
                                    font="semibold"
                                    size="sm"
                                    color="#FFFFFF"
                                >
                                    {discovering
                                        ? "Descubriendo..."
                                        : "Descubrir más"}
                                </TextApp>
                            </Pressable>
                        </>
                    ) : (
                        <TextApp color="#767676" size="sm">
                            No encontramos lugares con esos criterios.
                        </TextApp>
                    )}
                </View>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 22,
    },
    heading: {
        gap: 22,
        paddingVertical: 20,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: .5,
        borderBottomColor: "#EEEEEE",
    },
    categories: {
        flexDirection: "row",
        gap: 8,
        paddingHorizontal: 24,
    },
    results: {
        gap: 14,
        paddingHorizontal: 24,
    },
    discoverButton: {
        minHeight: 52,
        borderRadius: 14,
        backgroundColor: "#F90050",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        marginTop: 8,
    },
    discoverDisabled: {
        opacity: 0.7,
    },
});