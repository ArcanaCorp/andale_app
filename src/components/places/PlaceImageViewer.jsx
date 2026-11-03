import { useEffect, useState } from "react";
import {
    Image,
    Modal,
    Pressable,
    StatusBar,
    StyleSheet,
    View,
} from "react-native";
import { ChevronLeft, ChevronRight, X } from "lucide-react-native";

import IconApp from "../ui/IconApp";

export default function PlaceImageViewer({
    visible,
    images = [],
    initialIndex = 0,
    onClose,
}) {
    const [index, setIndex] = useState(initialIndex);

    useEffect(() => {
        if (visible) setIndex(initialIndex);
    }, [visible, initialIndex]);

    if (!images.length) return null;

    const currentImage = images[index];

    function previousImage() {
        setIndex(current => (current - 1 + images.length) % images.length);
    }

    function nextImage() {
        setIndex(current => (current + 1) % images.length);
    }

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <StatusBar hidden={visible} />

            <View style={styles.container}>
                <Pressable style={styles.closeButton} onPress={onClose}>
                    <IconApp icon={X} color="#FFFFFF" size="lg" />
                </Pressable>

                <Image
                    key={currentImage}
                    source={{ uri: currentImage }}
                    style={styles.image}
                    resizeMode="contain"
                />

                {images.length > 1 && (
                    <>
                        <Pressable
                            style={[styles.arrow, styles.leftArrow]}
                            onPress={previousImage}
                        >
                            <IconApp icon={ChevronLeft} color="#FFFFFF" size="xl" />
                        </Pressable>

                        <Pressable
                            style={[styles.arrow, styles.rightArrow]}
                            onPress={nextImage}
                        >
                            <IconApp icon={ChevronRight} color="#FFFFFF" size="xl" />
                        </Pressable>

                        <View style={styles.counter}>
                            <IconApp icon={null} />
                        </View>
                    </>
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: "100%",
        height: "100%",
    },
    closeButton: {
        position: "absolute",
        zIndex: 2,
        top: 48,
        right: 22,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.18)",
        alignItems: "center",
        justifyContent: "center",
    },
    arrow: {
        position: "absolute",
        zIndex: 2,
        top: "48%",
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.2)",
        alignItems: "center",
        justifyContent: "center",
    },
    leftArrow: {
        left: 14,
    },
    rightArrow: {
        right: 14,
    },
    counter: {
        position: "absolute",
        bottom: 35,
    },
});