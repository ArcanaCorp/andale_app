import { View, StyleSheet } from "react-native";

import TextApp from "../ui/TextApp";
import { tokens } from "../../theme/tokens";

export default function Badge({label, style, textStyle }) {
    
    if (!label) return null;

    return (
        <View style={[styles.container, style]}>
            <TextApp font="medium" size="xs" color={tokens.colors.primary} style={textStyle}>{label}</TextApp>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignSelf: "flex-start",
        width: "auto",
        backgroundColor: tokens.colors.primarySoft,
        paddingHorizontal: tokens.spacing[3],
        paddingVertical: tokens.spacing[1],
        borderRadius: tokens.radius.full,
    },
});
