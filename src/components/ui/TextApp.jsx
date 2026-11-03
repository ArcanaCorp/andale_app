
import { Text } from "react-native";
import { tokens } from "../../theme/tokens";

export default function TextApp({
    children,
    font = "regular",
    size = "md",
    color = tokens.colors.black,
    style,
    ...props
}) {
    return (
        <Text
            {...props}
            style={[
                {
                    fontFamily: tokens.font[font],
                    fontSize: tokens.fontSize[size],
                    color: tokens.colors[color] || color,
                },
                style,
            ]}
        >
            {children}
        </Text>
    );
}