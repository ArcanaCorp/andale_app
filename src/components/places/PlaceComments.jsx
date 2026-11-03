import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    View,
} from "react-native";
import { MessageCircle, Send } from "lucide-react-native";

import { supabase } from "../../lib/supabase";
import TextApp from "../ui/TextApp";
import Input from "../ui/Input";
import IconApp from "../ui/IconApp";
import { tokens } from "../../theme/tokens";

export default function PlaceComments({ placeId, userId }) {
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    async function loadComments() {
        if (!placeId) return;

        setLoading(true);
        setError("");

        const { data, error: queryError } = await supabase
            .from("place_comments")
            .select("id, comment, created_at, user_id")
            .eq("place_id", placeId)
            .eq("is_visible", true)
            .order("created_at", { ascending: false });

        if (queryError) {
            setError("No se pudieron cargar los comentarios.");
        } else {
            setComments(data ?? []);
        }

        setLoading(false);
    }

    useEffect(() => {
        loadComments();
    }, [placeId]);

    async function publishComment() {
        const cleanComment = comment.trim();

        if (!userId) {
            setError("Inicia sesión para dejar un comentario.");
            return;
        }

        if (cleanComment.length < 3) {
            setError("Escribe al menos 3 caracteres.");
            return;
        }

        setSending(true);
        setError("");

        const { error: insertError } = await supabase
            .from("place_comments")
            .insert({
                place_id: placeId,
                user_id: userId,
                comment: cleanComment,
            });

        if (insertError) {
            setError("No se pudo publicar tu comentario. Inténtalo nuevamente.");
        } else {
            setComment("");
            await loadComments();
        }

        setSending(false);
    }

    function formatDate(date) {
        return new Date(date).toLocaleDateString("es-PE", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    return (
        <View style={styles.container}>
            <View style={styles.heading}>
                <View style={styles.titleRow}>
                    <IconApp
                        icon={MessageCircle}
                        color={tokens.colors.black}
                        size="md"
                    />
                    <TextApp font="semibold" size="lg">
                        Opiniones
                    </TextApp>
                </View>

                <TextApp size="xs" color={tokens.colors.gray}>
                    {comments.length} {comments.length === 1 ? "comentario" : "comentarios"}
                </TextApp>
            </View>

            <View style={styles.form}>
                <Input
                    value={comment}
                    onChangeText={setComment}
                    placeholder={
                        userId
                            ? "¿Qué te pareció este lugar?"
                            : "Inicia sesión para comentar"
                    }
                    disabled={!userId || sending}
                    size="lg"
                />

                <Pressable
                    style={[
                        styles.sendButton,
                        (!userId || !comment.trim() || sending) && styles.disabled,
                    ]}
                    onPress={publishComment}
                    disabled={!userId || !comment.trim() || sending}
                >
                    {sending ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                        <IconApp icon={Send} color="#FFFFFF" size="sm" />
                    )}
                </Pressable>
            </View>

            {!!error && (
                <TextApp color={tokens.colors.primary} size="xs">
                    {error}
                </TextApp>
            )}

            {loading ? (
                <ActivityIndicator style={styles.loader} color={tokens.colors.primary} />
            ) : comments.length === 0 ? (
                <View style={styles.empty}>
                    <TextApp color={tokens.colors.gray} size="sm">
                        Todavía no hay opiniones. ¡Sé el primero en compartir tu experiencia!
                    </TextApp>
                </View>
            ) : (
                <View style={styles.commentList}>
                    {comments.map(item => (
                        <View key={item.id} style={styles.comment}>
                            <View style={styles.avatar}>
                                <TextApp color="#FFFFFF" font="semibold" size="sm">
                                    V
                                </TextApp>
                            </View>

                            <View style={styles.commentContent}>
                                <View style={styles.commentHeader}>
                                    <TextApp font="semibold" size="sm">
                                        Visitante
                                    </TextApp>

                                    <TextApp color={tokens.colors.gray} size="xs">
                                        {formatDate(item.created_at)}
                                    </TextApp>
                                </View>

                                <TextApp size="sm" color={tokens.colors.black}>
                                    {item.comment}
                                </TextApp>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
    },
    heading: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 9,
    },
    form: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: tokens.colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    disabled: {
        opacity: 0.45,
    },
    loader: {
        marginVertical: 20,
    },
    empty: {
        padding: 18,
        backgroundColor: "#F5F5F5",
        borderRadius: 14,
    },
    commentList: {
        gap: 18,
    },
    comment: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: tokens.colors.primary,
        alignItems: "center",
        justifyContent: "center",
    },
    commentContent: {
        flex: 1,
        gap: 6,
    },
    commentHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
});