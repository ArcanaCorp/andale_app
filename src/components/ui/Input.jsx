import { useState } from "react";
import { View, TextInput, Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import { tokens } from "../../theme/tokens";
import IconApp from "./IconApp";

const SIZES = {
    sm: tokens.size.inputSm,
    md: tokens.size.inputMd,
    lg: tokens.size.inputLg,
};

export default function Input({
    value,
    onChangeText,
    placeholder = "Escribe aquí...",

    icon,
    iconPosition = "left",

    size = "md",
    disabled = false,
    error = false,

    secureTextEntry = false,

    style,
    inputStyle,

    onFocus,
    onBlur,

    ...props
}) {
    const [focused, setFocused] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const inputSize = SIZES[size] || SIZES.md;

    const hasError = Boolean(error);

    const borderColor = disabled
        ? tokens.colors.muted
        : hasError
            ? tokens.colors.primary
            : focused
                ? tokens.colors.primary
                : tokens.colors.muted;

    const iconColor = disabled
        ? tokens.colors.muted
        : focused
            ? tokens.colors.primary
            : tokens.colors.muted;

    const handleFocus = (event) => {
        setFocused(true);
        onFocus?.(event);
    };

    const handleBlur = (event) => {
        setFocused(false);
        onBlur?.(event);
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible((prev) => !prev);
    };

    return (
        <View
            style={[
                {
                    height: inputSize,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: tokens.spacing[3],
                    columnGap: tokens.spacing[2],
                    backgroundColor: tokens.colors.white,
                    borderWidth: focused
                        ? tokens.borderWidth.medium
                        : tokens.borderWidth.thin,
                    borderColor,
                    borderRadius: tokens.radius.lg,
                    opacity: disabled ? tokens.opacity.disabled : 1,
                },
                style,
            ]}
        >
            {icon && iconPosition === "left" && (
                <IconApp
                    icon={icon}
                    size="md"
                    color={iconColor}
                />
            )}

            <TextInput
                {...props}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={tokens.colors.gray}
                editable={!disabled}
                multiline={false}
                secureTextEntry={
                    secureTextEntry && !passwordVisible
                }
                selectionColor={tokens.colors.primary}
                onFocus={handleFocus}
                onBlur={handleBlur}
                underlineColorAndroid="transparent"
                style={[
                    {
                        flex: 1,
                        height: "100%",
                        padding: 0,
                        margin: 0,
                        fontFamily: tokens.font.regular,
                        fontSize: tokens.fontSize.md,
                        color: tokens.colors.black,
                    },
                    inputStyle,
                ]}
            />

            {secureTextEntry ? (
                <Pressable
                    onPress={togglePasswordVisibility}
                    disabled={disabled}
                    hitSlop={tokens.spacing[2]}
                    accessibilityRole="button"
                    accessibilityLabel={
                        passwordVisible
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                    }
                    accessibilityState={{
                        disabled,
                    }}
                >
                    <IconApp
                        icon={passwordVisible ? EyeOff : Eye}
                        size="md"
                        color={iconColor}
                    />
                </Pressable>
            ) : (
                icon && iconPosition === "right" && (
                    <IconApp
                        icon={icon}
                        size="md"
                        color={iconColor}
                    />
                )
            )}
        </View>
    );
}