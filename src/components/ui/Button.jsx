import { useState } from "react";
import { Pressable, Image } from "react-native";

import { tokens } from "../../theme/tokens";
import TextApp from "./TextApp";
import IconApp from "./IconApp";

const VARIANTS = {
    primary: {
        backgroundColor: tokens.colors.primary,
        borderColor: tokens.colors.primary,
        textColor: tokens.colors.white,
    },
    secondary: {
        backgroundColor: tokens.colors.white,
        borderColor: tokens.colors.muted,
        textColor: tokens.colors.black,
    },
    outline: {
        backgroundColor: "transparent",
        borderColor: tokens.colors.primary,
        textColor: tokens.colors.primary,
    },
    ghost: {
        backgroundColor: "transparent",
        borderColor: "transparent",
        textColor: tokens.colors.primary,
    },
    ghostSecondary: {
        backgroundColor: "transparent",
        borderColor: "transparent",
        textColor: tokens.colors.gray,
    },
};

const SIZES = {
    sm: tokens.size.buttonSm,
    md: tokens.size.buttonMd,
    lg: tokens.size.buttonLg,
};

export default function Button({
    children,
    onPress,
    disabled = false,
    loading = false,

    variant = "primary",
    size = "md",

    icon,
    image,
    iconPosition = "left",
    iconOnly = false,

    imageSize,
    imageStyle,
    imageRadius = "sm",

    radius = "lg",

    style,
    textStyle,

    accessibilityLabel,
    onFocus,
    onBlur,

    ...props
}) {
    const [focused, setFocused] = useState(false);

    const currentVariant = VARIANTS[variant] || VARIANTS.primary;
    const buttonSize = SIZES[size] || SIZES.md;

    const iconColor = currentVariant.textColor;

    const resolvedImageSize =
        imageSize ?? tokens.iconSize.md;

    const handleFocus = (event) => {
        setFocused(true);
        onFocus?.(event);
    };

    const handleBlur = (event) => {
        setFocused(false);
        onBlur?.(event);
    };

    const renderMedia = () => {
        if (image) {
            return (
                <Image
                    source={
                        typeof image === "string"
                            ? { uri: image }
                            : image
                    }
                    resizeMode="cover"
                    style={[
                        {
                            width: resolvedImageSize,
                            height: resolvedImageSize,
                            borderRadius: tokens.radius[imageRadius] ?? tokens.radius.sm,
                        },
                        imageStyle,
                    ]}
                />
            );
        }

        if (icon) {
            return (
                <IconApp
                    icon={icon}
                    size="md"
                    color={iconColor}
                />
            );
        }

        return null;
    };

    return (
        <Pressable
            {...props}
            onPress={onPress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled || loading}
            accessibilityRole="button"
            accessibilityLabel={
                accessibilityLabel ||
                (iconOnly
                    ? undefined
                    : typeof children === "string"
                        ? children
                        : undefined)
            }
            accessibilityState={{
                disabled: disabled || loading,
                busy: loading,
            }}
            style={({ pressed }) => [
                {
                    height: buttonSize,
                    minWidth: iconOnly ? buttonSize : undefined,
                    width: iconOnly ? buttonSize : undefined,

                    paddingHorizontal: iconOnly ? 0 : tokens.spacing[4],

                    flexDirection:
                        iconPosition === "left" ? "row" : "row-reverse",

                    alignItems: "center",
                    justifyContent: "center",
                    columnGap: tokens.spacing[2],

                    backgroundColor: currentVariant.backgroundColor,

                    borderWidth: focused
                        ? tokens.borderWidth.medium
                        : tokens.borderWidth.thin,

                    borderColor: focused
                        ? tokens.colors.black
                        : currentVariant.borderColor,

                    borderRadius:
                        tokens.radius[radius] ?? tokens.radius.lg,

                    opacity: disabled
                        ? tokens.opacity.disabled
                        : pressed
                            ? tokens.opacity.pressed
                            : 1,
                },
                style,
            ]}
        >
            {image && !loading && renderMedia()}

            {!image && icon && !loading && renderMedia()}

            {!iconOnly && !loading && (
                <TextApp
                    font="semibold"
                    size="md"
                    color={currentVariant.textColor}
                    style={textStyle}
                >
                    {children}
                </TextApp>
            )}

            {!iconOnly && loading && (
                <TextApp
                    font="medium"
                    size="md"
                    color={currentVariant.textColor}
                >
                    Cargando...
                </TextApp>
            )}
        </Pressable>
    );
}