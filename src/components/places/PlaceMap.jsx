import { Linking, Pressable, StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Navigation } from "lucide-react-native";

import TextApp from "../ui/TextApp";
import IconApp from "../ui/IconApp";
import { tokens } from "../../theme/tokens";

export default function PlaceMap({ place }) {
    const latitude = Number(place?.latitude);
    const longitude = Number(place?.longitude);

    const hasCoordinates =
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        latitude !== 0 &&
        longitude !== 0;

    if (!hasCoordinates) {
        return (
            <View style={styles.unavailable}>
                <TextApp color={tokens.colors.gray} size="sm">
                    Este lugar todavía no tiene coordenadas disponibles para mostrar el mapa.
                </TextApp>
            </View>
        );
    }

    async function openDirections() {
        const url = place.google_maps_url ||
            `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

        await Linking.openURL(url);
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude,
                    longitude,
                    latitudeDelta: 0.012,
                    longitudeDelta: 0.012,
                }}
                scrollEnabled
                zoomEnabled
                pitchEnabled={false}
                rotateEnabled={false}
            >
                <Marker
                    coordinate={{ latitude, longitude }}
                    title={place.name}
                    description={place.district || "Jauja, Junín"}
                />
            </MapView>

            <Pressable style={styles.directionsButton} onPress={openDirections}>
                <IconApp
                    icon={Navigation}
                    color="#FFFFFF"
                    size="sm"
                />
                <TextApp color="#FFFFFF" font="semibold" size="sm">
                    Cómo llegar
                </TextApp>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 230,
        borderRadius: tokens.radius.lg,
        overflow: "hidden",
        position: "relative",
    },
    map: {
        width: "100%",
        height: "100%",
    },
    directionsButton: {
        position: "absolute",
        bottom: 12,
        right: 12,
        backgroundColor: tokens.colors.primary,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 11,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    unavailable: {
        minHeight: 100,
        borderRadius: tokens.radius.lg,
        backgroundColor: "#F1F1F1",
        padding: 16,
        justifyContent: "center",
    },
});