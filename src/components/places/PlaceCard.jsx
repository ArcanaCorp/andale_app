import { Image, StyleSheet, View, Pressable } from "react-native";
import { ArrowUpRight, MapPin, Star } from "lucide-react-native";
import { useRouter } from "expo-router";

import TextApp from "../ui/TextApp";
import IconApp from "../ui/IconApp";

import { tokens } from "../../theme/tokens";
import FavoriteButton from "../FavoriteButton";
import Badge from "../ui/Badge";

export default function PlaceCard({ place, isFavorite, onToggleFavorite, onPress, style }) {

    const router = useRouter();

    if (!place) return null;

    console.log("PlaceCard", place);

    const cover = place.cover_image_url ? { uri: place.cover_image_url } : require("../../../assets/images/placeholder.png");

    const handlePress = () => {
        if (onPress) {
            onPress(place);
            return;
        }

        if (place.slug) {
            router.push({pathname: "/places/[slug]", params: { slug: place.slug }});
        }
    };

    return (
        <Pressable onPress={handlePress} disabled={!onPress && !place.slug} accessibilityRole="button" accessibilityLabel={`Ver detalles de ${place.name}`} style={({ pressed }) => [styles.card, style, pressed && styles.cardPressed]}>
            <View style={styles.mask}>
                <View style={styles.top}>
                    <View style={styles.rating}>
                        <Star size={16} color="#a5a5a5" />
                        <TextApp size="md" color="muted">{place.rating || 0}</TextApp>
                    </View>
                    <FavoriteButton />
                </View>
                <View style={styles.bottom}>
                    <View style={{ flexDirection: "column", gap: 4, maxWidth: "80%" }}>
                        <TextApp size="md" color="white">{place.district}</TextApp>
                        <TextApp font="semibold" size="4xl" color="white">{place.name}</TextApp>
                    </View>
                    <View style={styles.open}>
                        <ArrowUpRight size={24} color="black" />
                    </View>
                </View>
            </View>
            <Image source={cover} style={styles.image} resizeMode="cover" accessibilityLabel={`Imagen de ${place.name}`}/>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        height: 360,
        borderRadius: tokens.radius.md,
        overflow: "hidden",
        backgroundColor: tokens.colors.muted,
    },
    mask: {
        width: "100%",
        height: "100%",
        position: "absolute",
        zIndex: 1,
        top: 0,
        left: 0,
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: tokens.spacing[4],
        backgroundColor: "rgba(0, 0, 0, 0.3)",
    },
    top: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    rating: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: tokens.spacing[3],
        paddingVertical: tokens.spacing[2],
        borderRadius: tokens.radius.full, 
        backgroundColor: tokens.colors.white, 
    },
    bottom: {
        width: "100%",
        flexDirection: "row", 
        alignItems: "flex-end", 
        justifyContent: "space-between", 
    },
    open: {
        width: 45, 
        height: 45, 
        borderRadius: tokens.radius.full, 
        backgroundColor: tokens.colors.white, 
        justifyContent: "center", 
        alignItems: "center"
    },
    image: {
        width: "100%",
        height: "100%",
    },
});