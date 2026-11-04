import { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";

import Screen from "../components/ui/Screen";
import TextApp from "../components/ui/TextApp";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

import { Mail, Lock, User } from "lucide-react-native";
import Divider from "../components/ui/Divider";
import { useAuth } from "../context/AuthContext";
import { Redirect } from "expo-router";

export default function Welcome() {

    const { signIn, signInAsGuest, loading, user } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    const handleLogin = async () => {
        if (authLoading) return;

        if (!email.trim() || !password) {
            Alert.alert("Datos incompletos", "Ingresa tu correo electrónico y contraseña.");
            return;
        }

        try {
            setAuthLoading(true);
            await signIn(email, password);
        } catch (error) {
            console.error("Error iniciando sesión:", error);
            Alert.alert("No se pudo iniciar sesión", error.message || "Verifica tus credenciales e inténtalo nuevamente.");
        } finally {
            setAuthLoading(false);
        }
    };

    const handleGoogle = () => {
        // Próxima etapa: autenticación con Google
    };

    const handleFacebook = () => {
        // Próxima etapa: autenticación con Facebook
    };

    const handleGuest = async () => {
        if (authLoading) return;
        try {
            setAuthLoading(true);
            await signInAsGuest();
        } catch (error) {
            console.error(error.message);
        } finally {
            setAuthLoading(false);
        }
    };

    console.log(JSON.stringify(user, null, 2));

    if (loading) return null;

    if (user !== null) {
        return <Redirect href="/(tabs)" />;
    }

    return (
        <Screen>
            <View style={styles.container}>

                {/* Bienvenida */}
                <View style={styles.welcome}>
                    <TextApp font="bold" size="6xl" color="black" style={styles.heading}>¡Qué bueno{" "}<TextApp font="bold" size="6xl" color="primary">tenerte aquí!</TextApp></TextApp>
                    <TextApp size="md" color="muted" style={styles.description}>Explora lugares increíbles, descubre nuevas experiencias y vive cada destino a tu manera.</TextApp>
                </View>

                {/* Inicio de sesión */}
                <View style={styles.login}>
                    <View style={styles.inputs}>
                        <Input icon={Mail} iconPosition="right" placeholder="Correo electrónico" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} disabled={authLoading}/>
                        <Input icon={Lock} iconPosition="right" secureTextEntry={true} placeholder="Contraseña" value={password} onChangeText={setPassword} disabled={authLoading}/>
                    </View>
                    <Button radius="full" onPress={handleLogin} loading={authLoading} disabled={authLoading}>
                        Ingresar
                    </Button>
                </View>

                <Divider text="O"/>

                {/* Accesos alternativos */}
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
    container: {
        flex: 1,
        justifyContent: "center",
        gap: 36,
        paddingVertical: 24,
    },

    welcome: {
        gap: 12,
    },

    heading: {
        lineHeight: 43,
        letterSpacing: -1,
    },

    subtitle: {
        letterSpacing: -0.5,
    },

    description: {
        lineHeight: 23,
        marginTop: 4,
    },

    login: {
        gap: 12,
    },

    inputs: {
        gap: 12,
    },

    actions: {
        gap: 12,
    },

    legal: {
        textAlign: "center",
        lineHeight: 19,
        paddingHorizontal: 12,
    },
});