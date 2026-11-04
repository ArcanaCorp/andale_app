import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Linking,
    Pressable,
    ScrollView,
    Share,
    StyleSheet,
    View,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import {
    ArrowLeft,
    CalendarDays,
    Clock3,
    ExternalLink,
    Heart,
    Info,
    MapPin,
    Mountain,
    Share2,
    Ticket,
} from "lucide-react-native";

import { supabase } from "../../lib/supabase";
import { getPlaceBySlug } from "../../services/places.service";

import Screen from "../../components/ui/Screen";
import TextApp from "../../components/ui/TextApp";
import IconApp from "../../components/ui/IconApp";
import Badge from "../../components/ui/Badge";

import PlaceImageViewer from "../../components/places/PlaceImageViewer";
import PlaceMap from "../../components/places/PlaceMap";
import PlaceComments from "../../components/places/PlaceComments";

import { tokens } from "../../theme/tokens";
import Button from "../../components/ui/Button";
import Advertising from "../../components/Advertising";

export default function PlaceDetailScreen() {
    const { slug } = useLocalSearchParams();
    const router = useRouter();

    const [place, setPlace] = useState(null);
    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    const [viewerVisible, setViewerVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // --------------------------------------------------
    // Cargar usuario autenticado
    // --------------------------------------------------

    useEffect(() => {
        let mounted = true;

        async function loadUser() {
            const { data } = await supabase.auth.getUser();

            if (mounted) {
                setUser(data?.user ?? null);
            }
        }

        loadUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // --------------------------------------------------
    // Cargar lugar
    // --------------------------------------------------

    const loadPlace = useCallback(async () => {
        if (!slug) return;

        try {
            setLoading(true);
            setError("");

            const result = await getPlaceBySlug(
                Array.isArray(slug) ? slug[0] : slug
            );

            if (!result) {
                setPlace(null);
                setError("No encontramos este lugar turístico.");
                return;
            }

            setPlace(result);
        } catch (err) {
            console.error("Error cargando lugar:", err);
            setError("No se pudo cargar la información del lugar.");
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        loadPlace();
    }, [loadPlace]);

    // --------------------------------------------------
    // Favoritos
    // --------------------------------------------------

    const loadFavoriteStatus = useCallback(async () => {
        if (!user?.id || !place?.id) {
            setIsFavorite(false);
            return;
        }

        const { data, error: favoriteError } = await supabase
            .from("customer_favorites")
            .select("id")
            .eq("user_id", user.id)
            .eq("place_id", place.id)
            .eq("favorite_type", "place")
            .maybeSingle();

        if (favoriteError) {
            console.error("Error consultando favorito:", favoriteError);
            return;
        }

        setIsFavorite(!!data);
    }, [user?.id, place?.id]);

    useEffect(() => {
        loadFavoriteStatus();
    }, [loadFavoriteStatus]);

    async function toggleFavorite() {
        if (!user?.id || !place?.id || favoriteLoading) return;

        try {
            setFavoriteLoading(true);

            if (isFavorite) {
                const { error: deleteError } = await supabase
                    .from("customer_favorites")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("place_id", place.id)
                    .eq("favorite_type", "place");

                if (deleteError) throw deleteError;

                setIsFavorite(false);
            } else {
                const { error: insertError } = await supabase
                    .from("customer_favorites")
                    .insert({
                        user_id: user.id,
                        place_id: place.id,
                        favorite_type: "place",
                    });

                if (insertError) throw insertError;

                setIsFavorite(true);
            }
        } catch (err) {
            console.error("Error actualizando favorito:", err);
        } finally {
            setFavoriteLoading(false);
        }
    }

    // --------------------------------------------------
    // Compartir
    // --------------------------------------------------

    async function sharePlace() {
        if (!place) return;

        const mapsUrl =
            place.google_maps_url ||
            (
                place.latitude && place.longitude
                    ? `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`
                    : ""
            );

        const message = [
            `📍 ${place.name}`,
            place.short_description || "Descubre este lugar turístico de Jauja.",
            place.district ? `Distrito: ${place.district}` : "Jauja, Junín, Perú",
            mapsUrl,
            "Descúbrelo con Ándale Ya!",
        ]
            .filter(Boolean)
            .join("\n\n");

        try {
            await Share.share({
                title: place.name,
                message,
            });
        } catch (err) {
            console.error("Error compartiendo lugar:", err);
        }
    }

    // --------------------------------------------------
    // Galería
    // --------------------------------------------------

    const cover = place?.cover_image_url ? { uri: place.cover_image_url } : require("../../../assets/images/placeholder.png")
    const galleryImages = Array.isArray(place?.gallery_images) ? place.gallery_images.filter(image => typeof image === "string" && image.trim()) : [];

    const allGalleryImages = [
        ...(place?.cover_image_url ? [place.cover_image_url] : []),
        ...galleryImages,
    ].filter((image, index, array) => array.indexOf(image) === index);

    function openGallery(index) {
        setSelectedImageIndex(index);
        setViewerVisible(true);
    }

    // --------------------------------------------------
    // Helpers
    // --------------------------------------------------

    function formatDuration(minutes) {
        if (!minutes) return null;

        const value = Number(minutes);

        if (!Number.isFinite(value)) return String(minutes);

        if (value < 60) return `${value} minutos`;

        const hours = Math.floor(value / 60);
        const remainingMinutes = value % 60;

        return remainingMinutes
            ? `${hours} h ${remainingMinutes} min`
            : `${hours} ${hours === 1 ? "hora" : "horas"}`;
    }

    function formatValue(value) {
        if (value === null || value === undefined || value === "") {
            return null;
        }

        if (typeof value === "boolean") {
            return value ? "Sí" : "No";
        }

        if (Array.isArray(value)) {
            return value.join(", ");
        }

        if (typeof value === "object") {
            return Object.entries(value)
                .map(([key, item]) => `${key}: ${item}`)
                .join("\n");
        }

        return String(value);
    }

    function formatOpeningHours(value) {
        if (!value) return null;

        if (typeof value === "string") return value;

        if (Array.isArray(value)) {
            return value
                .map(item => {
                    if (typeof item === "string") return item;

                    return Object.entries(item)
                        .map(([key, val]) => `${key}: ${val}`)
                        .join(" · ");
                })
                .join("\n");
        }

        if (typeof value === "object") {
            return Object.entries(value)
                .map(([day, hours]) => {
                    const formattedHours =
                        typeof hours === "object" && hours !== null
                            ? Object.entries(hours)
                                .map(([key, val]) => `${key}: ${val}`)
                                .join(" · ")
                            : String(hours);

                    return `${day}: ${formattedHours}`;
                })
                .join("\n");
        }

        return String(value);
    }

    function InfoItem({ icon, label, value }) {
        if (value === null || value === undefined || value === "") {
            return null;
        }

        return (
            <View style={styles.infoItem}>
                <View style={styles.infoIcon}>
                    <IconApp
                        icon={icon}
                        size="md"
                        color={tokens.colors.primary}
                    />
                </View>

                <View style={styles.infoText}>
                    <TextApp size="xs" color={tokens.colors.gray}>
                        {label}
                    </TextApp>

                    <TextApp size="sm" font="semibold">
                        {formatValue(value)}
                    </TextApp>
                </View>
            </View>
        );
    }

    function ContentList({ title, items }) {
        if (!Array.isArray(items) || items.length === 0) {
            return null;
        }

        const validItems = items.filter(Boolean);

        if (!validItems.length) return null;

        return (
            <View style={styles.section}>
                <TextApp font="semibold" size="lg">
                    {title}
                </TextApp>

                <View style={styles.listContainer}>
                    {validItems.map((item, index) => (
                        <View
                            key={`${title}-${index}`}
                            style={styles.listItem}
                        >
                            <View style={styles.listDot} />

                            <TextApp
                                size="sm"
                                color={tokens.colors.black}
                                style={styles.listText}
                            >
                                {typeof item === "object"
                                    ? formatValue(item)
                                    : String(item)}
                            </TextApp>
                        </View>
                    ))}
                </View>
            </View>
        );
    }

    // --------------------------------------------------
    // Estados de carga y error
    // --------------------------------------------------

    if (loading) {
        return (
            <Screen>
                <View style={styles.centerState}>
                    <ActivityIndicator
                        size="large"
                        color={tokens.colors.primary}
                    />

                    <TextApp color={tokens.colors.gray} size="sm">
                        Cargando lugar...
                    </TextApp>
                </View>
            </Screen>
        );
    }

    if (error || !place) {
        return (
            <Screen>
                <View style={styles.centerState}>
                    <IconApp
                        icon={Info}
                        size="2xl"
                        color={tokens.colors.gray}
                    />

                    <TextApp font="semibold" size="lg">
                        No encontramos este lugar
                    </TextApp>

                    <TextApp
                        color={tokens.colors.gray}
                        size="sm"
                        style={styles.errorText}
                    >
                        {error || "El lugar no está disponible actualmente."}
                    </TextApp>

                    <Pressable
                        style={styles.retryButton}
                        onPress={loadPlace}
                    >
                        <TextApp color="#FFFFFF" font="semibold">
                            Intentar nuevamente
                        </TextApp>
                    </Pressable>

                    <Pressable
                        style={styles.backTextButton}
                        onPress={() => router.back()}
                    >
                        <TextApp color={tokens.colors.primary} font="semibold">
                            Volver
                        </TextApp>
                    </Pressable>
                </View>
            </Screen>
        );
    }

    // --------------------------------------------------
    // Pantalla principal
    // --------------------------------------------------

    return (
        <Screen padding={0}>
            <View style={styles.container}>

                <View style={styles.hero}>
                    <View style={styles.topBar}>
                        <Button variant="iconOnly" icon={ArrowLeft} iconOnly radius="full" onPress={() => router.back()} />
                        <View style={{ flexDirection: "row", gap: 8 }}>
                            <Button variant="iconOnly" icon={Heart} iconOnly radius="full" />
                            <Button variant="iconOnly" icon={Share2} iconOnly radius="full" onPress={sharePlace} />
                        </View>
                    </View>
                    <Image source={cover} style={styles.heroImage} />
                </View>

                {/* Información principal */}
                <View style={styles.mainInfo}>
                    <View style={styles.badgesRow}>
                        {!!place.category && ( <Badge label={place.category} />)}
                        {!!place.is_verified && ( <Badge label="Verificado" />)}
                    </View>

                    <TextApp font="bold" size="4xl" color={tokens.colors.black} style={styles.placeName}>{place.name}</TextApp>

                    {(place.district || place.province) && (
                        <View style={styles.locationRow}>
                            <IconApp
                                icon={MapPin}
                                size="sm"
                                color={tokens.colors.gray}
                            />

                            <TextApp
                                size="sm"
                                color={tokens.colors.gray}
                            >
                                {[place.district, place.province, place.department]
                                    .filter(Boolean)
                                    .join(", ")}
                            </TextApp>
                        </View>
                    )}

                    {!!place.short_description && (
                        <TextApp size="md" color={tokens.colors.gray} style={styles.shortDescription}>{place.short_description}</TextApp>
                    )}

                    {!user?.id && (
                        <TextApp size="xs" color={tokens.colors.gray}>Inicia sesión para guardar este lugar en favoritos.</TextApp>
                    )}
                    
                    <View style={styles.section}>
                        <TextApp font="semibold" size="lg">Información del lugar</TextApp>

                        <View style={styles.infoGrid}>
                            <InfoItem icon={Info} label="Tipo" value={place.type}/>
                            <InfoItem icon={Info} label="Subtipo" value={place.subtype}/>
                            <InfoItem icon={Mountain} label="Dificultad" value={place.difficulty_level}/>
                            <InfoItem icon={Clock3} label="Duración recomendada" value={formatDuration(place.recommended_duration_minutes)}/>
                            <InfoItem icon={CalendarDays} label="Mejor época para visitar" value={place.best_time_to_visit}/>
                            <InfoItem icon={Ticket} label="Entrada" value={place.is_free === true ? "Ingreso gratuito" : place.entrance_fee !== null && place.entrance_fee !== undefined ? `${place.currency || "S/"} ${place.entrance_fee}` : place.is_free === false ? "Consultar tarifa" : null}/>
                        </View>
                    </View>

                    <ContentList title="Actividades" items={place.activities}/>
                    <ContentList title="Ideal para" items={place.visitor_types}/>
                    <ContentList title="Recomendaciones para tu visita" items={place.recommendations}/>

                    {!!place.opening_hours && (
                        <View style={styles.section}>
                            <TextApp font="semibold" size="lg">Horarios de atención</TextApp>
                            <View style={styles.hoursCard}>
                                <IconApp icon={Clock3} color={tokens.colors.primary} size="lg"/>
                                <TextApp size="sm" color={tokens.colors.black} style={styles.hoursText}>{formatOpeningHours(place.opening_hours)}</TextApp>
                            </View>
                        </View>
                    )}
                    
                    <View style={styles.section}>
                        <TextApp font="semibold" size="lg">¿Cómo llegar?</TextApp>

                        {!!place.address && (
                            <View style={styles.addressRow}>
                                <IconApp icon={MapPin} size="md" color={tokens.colors.primary}/>
                                <View style={styles.addressText}>
                                    <TextApp size="xs" color={tokens.colors.gray}>Dirección</TextApp>
                                    <TextApp size="sm" font="semibold">{place.address}</TextApp>
                                </View>
                            </View>
                        )}

                        {!!place.reference && ( <TextApp size="sm" color={tokens.colors.gray}>Referencia: {place.reference}</TextApp> )}
                        <PlaceMap place={place} />
                    </View>

                </View>

                {allGalleryImages.length > 0 && (
                    <View style={styles.section}>
                        <View style={[styles.sectionHeader, { paddingHorizontal: 24 }]}>
                            <TextApp font="semibold" size="lg">Galería</TextApp>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryGrid} nestedScrollEnabled>
                            {allGalleryImages.map((image, index) => (
                                <Pressable key={`${image}-${index}`} onPress={() => openGallery(index)} style={styles.galleryItem}>
                                    <Image source={{ uri: image }} style={styles.galleryImage} resizeMode="cover"/>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </View>
                )}

            </View>

            <Advertising/>

            <PlaceImageViewer visible={viewerVisible} images={allGalleryImages} initialIndex={selectedImageIndex} onClose={() => setViewerVisible(false)}/>

        </Screen>
    );
}

// --------------------------------------------------
// Estilos
// --------------------------------------------------

const styles = StyleSheet.create({
    container: {
        paddingBottom: 40,
    },

    centerState: {
        flex: 1,
        minHeight: 400,
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        padding: 24,
    },

    errorText: {
        textAlign: "center",
    },

    retryButton: {
        backgroundColor: tokens.colors.primary,
        borderRadius: 24,
        paddingHorizontal: 22,
        paddingVertical: 12,
    },

    backTextButton: {
        padding: 10,
    },

    hero: {
        width: "100%",
        height: 360,
        backgroundColor: "#F1F1F1",
    },

    // Cabecera
    topBar: {
        position: "absolute",
        zIndex: 10,
        top: 14,
        left: 14,
        right: 14,
        height: 54,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: tokens.colors.white,
        borderWidth: 1,
        borderColor: tokens.colors.border,
    },

    topShareButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: tokens.colors.white,
        borderWidth: 1,
        borderColor: tokens.colors.border,
    },

    // Hero
    heroContainer: {
        width: "100%",
        height: 280,
        backgroundColor: "#F1F1F1",
        borderRadius: tokens.radius.lg,
        overflow: "hidden",
        position: "relative",
    },

    heroImage: {
        width: "100%",
        height: "100%",
    },

    featuredBadge: {
        position: "absolute",
        top: 14,
        left: 14,
        backgroundColor: tokens.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 20,
    },

    photoCount: {
        position: "absolute",
        right: 12,
        bottom: 12,
        backgroundColor: "rgba(0,0,0,0.7)",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },

    // Información principal
    mainInfo: {
        marginTop: -40,
        paddingTop: 20,
        gap: 12,
        paddingHorizontal: 24,
        backgroundColor: tokens.colors.white,
        borderTopLeftRadius: tokens.radius.xl,
        borderTopRightRadius: tokens.radius.xl,
    },

    badgesRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },

    placeName: {
        lineHeight: 34,
    },

    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
    },

    shortDescription: {
        lineHeight: 23,
    },

    // Acciones
    actionsRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },

    actionButton: {
        flex: 1,
        minHeight: 48,
        borderWidth: 1,
        borderColor: tokens.colors.border,
        borderRadius: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: tokens.colors.white,
    },

    favoriteActive: {
        backgroundColor: tokens.colors.primary,
        borderColor: tokens.colors.primary,
    },

    // Secciones
    section: {
        marginTop: 28,
        gap: 14,
    },

    bodyText: {
        lineHeight: 24,
    },

    // Información
    infoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },

    infoItem: {
        width: "48%",
        flexGrow: 1,
        flexBasis: "45%",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        backgroundColor: tokens.colors.white,
        borderRadius: tokens.radius.lg,
        borderWidth: 1,
        borderColor: tokens.colors.border,
        padding: 12,
        minHeight: 75,
    },

    infoIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#FFF0F4",
        alignItems: "center",
        justifyContent: "center",
    },

    infoText: {
        flex: 1,
        gap: 4,
    },

    // Listas
    listContainer: {
        gap: 12,
    },

    listItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },

    listDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: tokens.colors.primary,
        marginTop: 7,
    },

    listText: {
        flex: 1,
        lineHeight: 22,
    },

    // Horarios
    hoursCard: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        padding: 16,
        backgroundColor: tokens.colors.white,
        borderWidth: 1,
        borderColor: tokens.colors.border,
        borderRadius: tokens.radius.lg,
    },

    hoursText: {
        flex: 1,
        lineHeight: 22,
    },

    // Galería
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    galleryGrid: {
        gap: 10,
        paddingHorizontal: 24,
    },

    galleryItem: {
        width: "100%",
        aspectRatio: 1,
        borderRadius: 12,
        overflow: "hidden",
        backgroundColor: "#F1F1F1",
    },

    galleryImage: {
        width: "100%",
        height: "100%",
    },

    // Ubicación
    addressRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,
    },

    addressText: {
        flex: 1,
        gap: 4,
    },

    externalMapButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 12,
    },

    // Footer
    footer: {
        marginTop: 36,
        paddingVertical: 24,
        borderTopWidth: 1,
        borderTopColor: tokens.colors.border,
        alignItems: "center",
        gap: 8,
    },
});