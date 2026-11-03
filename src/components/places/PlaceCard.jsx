import { Image, StyleSheet, View, Pressable } from "react-native";
import { MapPin } from "lucide-react-native";
import { useRouter } from "expo-router";

import TextApp from "../ui/TextApp";
import IconApp from "../ui/IconApp";

import { tokens } from "../../theme/tokens";
import FavoriteButton from "../FavoriteButton";
import Badge from "../ui/Badge";

export default function PlaceCard({
    place,
    isFavorite,
    onToggleFavorite,
    onPress,
    style,
}) {
    const router = useRouter();

    if (!place) return null;

    const handlePress = () => {
        if (onPress) {
            onPress(place);
            return;
        }

        if (place.slug) {
            router.push({
                pathname: "/places/[slug]",
                params: { slug: place.slug },
            });
        }
    };

    return (
        <Pressable
            onPress={handlePress}
            disabled={!onPress && !place.slug}
            accessibilityRole="button"
            accessibilityLabel={`Ver detalles de ${place.name}`}
            style={({ pressed }) => [
                styles.card,
                style,
                pressed && styles.cardPressed,
            ]}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={
                        place.cover_image_url
                            ? { uri: place.cover_image_url }
                            : require("../../../assets/images/placeholder.png")
                    }
                    style={styles.image}
                    resizeMode="cover"
                    accessibilityLabel={`Imagen de ${place.name}`}
                />

                <FavoriteButton
                    isFavorite={isFavorite}
                    onToggleFavorite={(nextFavorite) =>
                        onToggleFavorite?.(nextFavorite, place)
                    }
                    style={styles.favoriteButton}
                />
            </View>

            <View style={styles.content}>
                <TextApp
                    font="semibold"
                    size="lg"
                    color={tokens.colors.black}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    style={styles.name}
                >
                    {place.name}
                </TextApp>

                <View style={styles.location}>
                    <IconApp
                        icon={MapPin}
                        size="xs"
                        color={tokens.colors.gray}
                    />

                    <TextApp
                        size="xs"
                        color={tokens.colors.gray}
                        numberOfLines={1}
                    >
                        {place.district || "Jauja"}
                    </TextApp>
                </View>

                {!!place.short_description && (
                    <TextApp
                        size="sm"
                        color={tokens.colors.gray}
                        numberOfLines={3}
                        ellipsizeMode="tail"
                        style={styles.description}
                    >
                        {place.short_description}
                    </TextApp>
                )}

                {!!place.category && (
                    <Badge label={place.category} />
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        alignItems: "stretch",
        backgroundColor: tokens.colors.white,
        borderRadius: tokens.radius.lg,
        overflow: "hidden",
        borderWidth: tokens.borderWidth.thin,
        borderColor: tokens.colors.border,
        marginBottom: tokens.spacing[3],
    },

    cardPressed: {
        opacity: 0.88,
    },

    imageContainer: {
        width: tokens.size.placeCardImage,
        aspectRatio: 1,
        position: "relative",
        backgroundColor: tokens.colors.border,
    },

    image: {
        width: "100%",
        height: "100%",
    },

    favoriteButton: {
        position: "absolute",
        top: tokens.spacing[2],
        right: tokens.spacing[2],
    },

    content: {
        flex: 1,
        padding: tokens.spacing[3],
        gap: tokens.spacing[2],
        justifyContent: "center",
        minWidth: 0,
    },

    name: {
        flexShrink: 1,
    },

    location: {
        flexDirection: "row",
        alignItems: "center",
        gap: tokens.spacing[1],
    },

    description: {
        flexShrink: 1,
    },
});