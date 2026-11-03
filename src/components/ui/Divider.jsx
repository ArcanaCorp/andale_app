
import { View } from "react-native";
import TextApp from "./TextApp";
import { tokens } from "../../theme/tokens";

const VARIANTS = {
    solid: "solid",
    dashed: "dashed",
    dotted: "dotted",
};

export default function Divider({
    text,
    variant = "solid",
    color = tokens.colors.muted,
    textColor = tokens.colors.muted,
    thickness = tokens.borderWidth.hairline,
    spacing = tokens.spacing[4],
    textSize = "sm",
    textFont = "medium",
    align = "center",
    orientation = "horizontal",
    style,
    lineStyle,
}) {
    const isHorizontal = orientation === "horizontal";

    const line = {
        backgroundColor: variant === "solid" ? color : "transparent",
        borderColor: color,
        borderWidth: thickness,
        borderStyle: VARIANTS[variant] || "solid",
    };

    if (isHorizontal) {
        return (
            <View
                style={[
                    {
                        flexDirection: "row",
                        alignItems: "center",
                        width: "100%",
                        gap: spacing,
                    },
                    style,
                ]}
            >
                {(align !== "right") && (
                    <View style={[{ flex: 1, height: 0 }, line, lineStyle]} />
                )}

                {text ? (
                    <TextApp
                        font={textFont}
                        size={textSize}
                        color={textColor}
                    >
                        {text}
                    </TextApp>
                ) : null}

                {(align !== "left") && (
                    <View style={[{ flex: 1, height: 0 }, line, lineStyle]} />
                )}
            </View>
        );
    }

    return (
        <View
            style={[
                {
                    flexDirection: "column",
                    alignItems: "center",
                    alignSelf: "stretch",
                    gap: spacing,
                },
                style,
            ]}
        >
            {align !== "right" && (
                <View style={[{ flex: 1, width: 0 }, line, lineStyle]} />
            )}

            {text ? (
                <TextApp
                    font={textFont}
                    size={textSize}
                    color={textColor}
                >
                    {text}
                </TextApp>
            ) : null}

            {align !== "left" && (
                <View style={[{ flex: 1, width: 0 }, line, lineStyle]} />
            )}
        </View>
    );
}
