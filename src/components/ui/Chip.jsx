import { Pressable, StyleSheet } from "react-native";
import TextApp from "./TextApp";

export default function Chip ({ item, selected, handleCategoryChange }) {
    return (
        <Pressable onPress={() => handleCategoryChange(item)} style={[styles.category, selected && styles.categorySelected]}>
            <TextApp font={selected ? "semibold" : "medium"} size="sm" color={selected ? "white" : "muted"}>{item}</TextApp>
        </Pressable>
    )
}

export const styles = StyleSheet.create({
    category: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#EEEEEE",
        paddingHorizontal: 13,
        paddingVertical: 9,
    },
    categorySelected: {
        backgroundColor: "#F90050",
        borderColor: "#F90050",
    },
})