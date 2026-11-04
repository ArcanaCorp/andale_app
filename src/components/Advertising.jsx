import { ScrollView, StyleSheet, View } from "react-native";
import TextApp from "./ui/TextApp";

export default function Advertising () {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.publish} nestedScrollEnabled>
            <View style={styles.publishItem}>
                <TextApp font="bold" size="lg" color="black">Publica tu 1</TextApp>
            </View>

            <View style={styles.publishItem}>
                <TextApp font="bold" size="lg" color="black">Publica tu 2</TextApp>
            </View>

            <View style={styles.publishItem}>
                <TextApp font="bold" size="lg" color="black">Publica tu 3</TextApp>
            </View>

            <View style={styles.publishItem}>
                <TextApp font="bold" size="lg" color="black">Publica tu 4</TextApp>
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    publish: {
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 20,
    },

    publishItem: {
        width: 280,
        height: 160,
        backgroundColor: "#FCE7EF",
        borderRadius: 20,
        padding: 16,
        justifyContent: "center",
        flexShrink: 0,
    },
})