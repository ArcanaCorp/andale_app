import { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";

import Screen from "../components/ui/Screen";
import TextApp from "../components/ui/TextApp";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

import { Mail, Lock, User } from "lucide-react-native";
import Divider from "../components/ui/Divider";
import { useAuth } from "../context/AuthContext";

export default function Welcome() {
    const { authenticate, signInWithProvider, signInAsGuest } = useAuth();

    const [fullname, setFullname] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    const handleLogin = async () => {
        if (authLoading) return;

        if (!email.trim() || !password) {
            Alert.alert(
                "Datos incompletos",
                "Ingresa tu correo electrónico y contraseña."
            );
            return;
        }

        try {
            setAuthLoading(true);

            const result = await authenticate(
                email,
                password,
                fullname
            );

            if (result.requiresEmailConfirmation) {
                Alert.alert(
                    "Verifica tu correo",
                    "Tu cuenta fue creada. Confirma tu dirección de correo electrónico antes de iniciar sesión."
                );
                return;
            }

            Alert.alert(
                result.isNewUser ? "¡Bienvenido!" : "¡Hola de nuevo!",
                result.isNewUser
                    ? "Tu cuenta fue creada correctamente."
                    : "Has iniciado sesión correctamente."
            );

        } catch (error) {
            console.error("Error de autenticación:", error);

            Alert.alert(
                "No se pudo continuar",
                error.message || "Inténtalo nuevamente."
            );
        } finally {
            setAuthLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        if (authLoading) return;

        const providerName = provider === "google" ? "Google" : "Facebook";

        try {
            setAuthLoading(true);
            const result = await signInWithProvider(provider);

            if (result.cancelled) return;
        } catch (error) {
            console.error(`Error iniciando sesión con ${providerName}:`, error);
            Alert.alert(
                `No se pudo continuar con ${providerName}`,
                error.message || "Inténtalo nuevamente."
            );
        } finally {
            setAuthLoading(false);
        }
    };

    const handleGoogle = () => handleSocialLogin("google");
    const handleFacebook = () => handleSocialLogin("facebook");

    const handleGuest = async () => {
        if (authLoading) return;
        try {
            setAuthLoading(true);
            await signInAsGuest();
        } catch (error) {
            console.error("Error ingresando como invitado:", error);
            Alert.alert("No se pudo continuar", error.message || "Inténtalo nuevamente.");
        } finally {
            setAuthLoading(false);
        }
    };

    return (
        <Screen>
            <View style={styles.container}>
                <View style={styles.welcome}>
                    <TextApp font="bold" size="6xl" color="black" style={styles.heading}>¡Qué bueno{" "}<TextApp font="bold" size="6xl" color="primary">tenerte aquí!</TextApp></TextApp>
                    <TextApp size="md" color="muted" style={styles.description}>Explora lugares increíbles, descubre nuevas experiencias y vive cada destino a tu manera.</TextApp>
                </View>

                <View style={styles.login}>
                    <View style={styles.inputs}>
                        <Input icon={User} iconPosition="right" placeholder="Nombre completo" value={fullname} onChangeText={setFullname} disabled={authLoading}/>
                        <Input icon={Mail} iconPosition="right" placeholder="Correo electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} disabled={authLoading}/>
                        <Input icon={Lock} iconPosition="right" secureTextEntry={true} placeholder="Contraseña" value={password} onChangeText={setPassword} disabled={authLoading}/>
                    </View>
                    <Button radius="full" onPress={handleLogin} loading={authLoading} disabled={authLoading}>Ingresar</Button>
                </View>

                <Divider text="O"/>

                <View style={styles.actions}>
                    <Button image={require("../../assets/images/icon-google.png")} variant="secondary" radius="full" onPress={handleGoogle} loading={authLoading} disabled={authLoading}>Continuar con Google</Button>
                    <Button image={require("../../assets/images/icon-facebook.png")} variant="secondary" radius="full" onPress={handleFacebook} loading={authLoading} disabled={authLoading}>Continuar con Facebook</Button>
                    <Button icon={User} variant="secondary" radius="full" onPress={handleGuest} loading={authLoading} disabled={authLoading}>Continuar como invitado</Button>
                </View>

                <TextApp size="xs" color="muted" style={styles.legal}>
                    Al continuar, aceptas nuestros{" "}
                    <TextApp font="semibold" size="xs" color="black">Términos y Condiciones</TextApp>
                    {" "}y nuestra{" "}
                    <TextApp font="semibold" size="xs" color="black">Política de Privacidad</TextApp>.
                </TextApp>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", gap: 36, paddingVertical: 24 },
    welcome: { gap: 12 },
    heading: { lineHeight: 43, letterSpacing: -1 },
    subtitle: { letterSpacing: -0.5 },
    description: { lineHeight: 23, marginTop: 4 },
    login: { gap: 12 },
    inputs: { gap: 12 },
    actions: { gap: 12 },
    legal: { textAlign: "center", lineHeight: 19, paddingHorizontal: 12 },
});
