import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { Heart } from "lucide-react-native";
import { tokens } from "../theme/tokens";

export default function FavoriteButton({ isFavorite, onToggleFavorite, size = "md", disabled = false, style }) {
    
    const [localFavorite, setLocalFavorite] = useState(false);

    const isControlled = isFavorite !== undefined;
    const favorite = isControlled ? isFavorite : localFavorite;

    const iconSize = tokens.iconSize[size] || tokens.iconSize.md;

    const handlePress = () => {
        if (disabled) return;

        const nextFavorite = !favorite;

        if (!isControlled) {
            setLocalFavorite(nextFavorite);
        }

        onToggleFavorite?.(nextFavorite);
    };

    return (
        <Pressable
            onPress={handlePress}
            disabled={disabled}
            hitSlop={tokens.spacing[2]}
            accessibilityRole="button"
            accessibilityLabel={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}
            accessibilityState={{selected: favorite, disabled,}}
            style={({ pressed }) => [
                styles.button,
                {opacity: disabled ? tokens.opacity.disabled : pressed ? tokens.opacity.pressed : 1,},
                style,
            ]}
        >
            <Heart
                size={iconSize}
                color={favorite ? tokens.colors.primary : tokens.colors.gray}
                fill={favorite ? tokens.colors.primary : "transparent"}
                strokeWidth={2}
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        width: tokens.size.touch,
        height: tokens.size.touch,
        borderRadius: tokens.radius.full,
        backgroundColor: tokens.colors.white,
        alignItems: "center",
        justifyContent: "center",
    },
});
