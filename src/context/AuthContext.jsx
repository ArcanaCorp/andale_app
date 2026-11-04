import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const profileRequestRef = useRef(0);

    // Escuchar los cambios de autenticación.
    useEffect(() => {
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            const nextUser = nextSession?.user ?? null;

            setSession(nextSession);
            setUser(nextUser);
            setLoading(false);

            if (!nextUser) {
                profileRequestRef.current += 1;
                setProfile(null);
            }
        });

        return () => {
            subscription.unsubscribe();
            profileRequestRef.current += 1;
        };
    }, []);

    // Sincronizar el perfil sin bloquear la navegación.
    const syncProfile = useCallback(async (authUser) => {
        if (!authUser) {
            setProfile(null);
            return null;
        }

        const requestId = ++profileRequestRef.current;

        const { data: currentProfile, error: readError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", authUser.id)
            .maybeSingle();

        if (readError) throw readError;

        const metadata = authUser.user_metadata || {};

        const profileData = {
            id: authUser.id,
            email: authUser.email ?? currentProfile?.email ?? null,
            full_name:
                metadata.full_name ??
                metadata.name ??
                currentProfile?.full_name ??
                null,
            avatar_url:
                metadata.avatar_url ??
                metadata.picture ??
                currentProfile?.avatar_url ??
                null,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from("profiles")
            .upsert(profileData, { onConflict: "id" })
            .select()
            .single();

        if (error) throw error;

        if (requestId === profileRequestRef.current) {
            setProfile(data);
        }

        return data;
    }, []);

    // El perfil se carga independientemente del estado de autenticación.
    useEffect(() => {
        if (!user) {
            profileRequestRef.current += 1;
            setProfile(null);
            return;
        }

        syncProfile(user).catch((error) => {
            console.error("Error sincronizando perfil:", error);
        });
    }, [user, syncProfile]);

    // Iniciar sesión.
    const signIn = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
        });

        if (error) throw error;

        return data;
    }, []);

    // Registrar cuenta.
    const signUp = useCallback(async (email, password, fullName = "") => {
        const { data, error } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
            options: {
                data: {
                    full_name: fullName.trim(),
                },
            },
        });

        if (error) throw error;

        return data;
    }, []);

    // Autenticación inteligente: iniciar sesión o crear cuenta.
    const authenticate = useCallback(async (email, password, fullName = "") => {
        const normalizedEmail = email.trim().toLowerCase();

        try {
            const data = await signIn(normalizedEmail, password);

            return {
                ...data,
                isNewUser: false,
            };
        } catch (error) {
            // Solo intentar registrar cuando las credenciales indican
            // que no existe una cuenta, nunca ante cualquier error.
            const accountNotFound = [
                "invalid_credentials",
                "user_not_found",
            ].includes(error.code);

            if (!accountNotFound) {
                throw error;
            }

            if (!fullName.trim()) {
                throw new Error("Ingresa tu nombre completo para crear tu cuenta.");
            }

            const data = await signUp(normalizedEmail, password, fullName);

            if (!data.session) {
                return {
                    ...data,
                    isNewUser: true,
                    requiresEmailConfirmation: true,
                };
            }

            return {
                ...data,
                isNewUser: true,
                requiresEmailConfirmation: false,
            };
        }
    }, [signIn, signUp]);

    // OAuth compartido para Google y Facebook mediante PKCE + deep link.
    // Instrumentación temporal para identificar exactamente dónde se detiene el flujo.
    const signInWithProvider = useCallback(async (provider) => {
        const supportedProviders = ["google", "facebook"];

        if (!supportedProviders.includes(provider)) {
            throw new Error("Proveedor de autenticación no soportado.");
        }

        try {
            const redirectTo = Linking.createURL("auth/callback");

            console.log("[OAUTH 1] Redirect generado:", redirectTo);

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo,
                    skipBrowserRedirect: true,
                },
            });

            if (error) throw error;

            if (!data?.url) {
                throw new Error("Supabase no devolvió la URL de autorización.");
            }

            // Registrar solo datos técnicos no sensibles; nunca la URL completa.
            const authUrl = new URL(data.url);

            console.log("[OAUTH 2] URL de autorización:", {
                host: authUrl.host,
                path: authUrl.pathname,
                provider: authUrl.searchParams.get("provider"),
                redirect_to: authUrl.searchParams.get("redirect_to"),
                code_challenge_method:
                    authUrl.searchParams.get("code_challenge_method"),
            });

            console.log("[OAUTH 3] Abriendo navegador...");

            const browserResult = await WebBrowser.openAuthSessionAsync(
                data.url,
                redirectTo
            );

            console.log("[OAUTH 4] Resultado del navegador:", {
                type: browserResult.type,
                callback: browserResult.url
                    ? (() => {
                        const url = new URL(browserResult.url);
                        return url.origin + url.pathname;
                    })()
                    : null,
            });

            if (browserResult.type !== "success" || !browserResult.url) {
                return { cancelled: true };
            }

            const params =
                Linking.parse(browserResult.url).queryParams ?? {};

            if (params.error || params.error_description) {
                throw new Error(
                    String(params.error_description || params.error)
                );
            }

            const code = params.code;

            if (typeof code !== "string" || !code) {
                throw new Error(
                    "No se recibió el código de autorización. Verifica el callback OAuth."
                );
            }

            console.log("[OAUTH 5] Código recibido. Intercambiando sesión...");

            const { data: sessionData, error: exchangeError } =
                await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError) throw exchangeError;

            if (!sessionData?.session) {
                throw new Error("No se recibió una sesión válida.");
            }

            console.log("[OAUTH 6] Sesión autenticada correctamente.");

            return {
                ...sessionData,
                cancelled: false,
            };
        } catch (error) {
            console.error("[OAUTH ERROR]", {
                message: error?.message,
                code: error?.code,
                name: error?.name,
            });

            throw error;
        }
    }, []);

    // Ingresar como invitado.
    const signInAsGuest = useCallback(async () => {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        return data;
    }, []);

    // Cerrar sesión.
    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    }, []);

    // Actualizar perfil.
    const updateProfile = useCallback(async (changes) => {
        if (!user) {
            throw new Error("No existe una sesión activa.");
        }

        const allowedFields = [
            "full_name",
            "avatar_url",
            "phone",
            "bithday",
            "age_range",
            "gender",
        ];

        const safeChanges = Object.fromEntries(
            Object.entries(changes).filter(([key]) =>
                allowedFields.includes(key)
            )
        );

        const { data, error } = await supabase
            .from("profiles")
            .update({
                ...safeChanges,
                updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
            .select()
            .single();

        if (error) throw error;

        setProfile(data);

        return data;
    }, [user]);

    const refreshProfile = useCallback(() => {
        return syncProfile(user);
    }, [syncProfile, user]);

    const value = useMemo(() => ({
        session,
        user,
        profile,
        isAuthenticated: !!session,
        isGuest: !!user?.is_anonymous,
        loading,
        signIn,
        signUp,
        authenticate,
        signInWithProvider,
        signInAsGuest,
        signOut,
        updateProfile,
        refreshProfile,
    }), [
        session,
        user,
        profile,
        loading,
        signIn,
        signUp,
        authenticate,
        signInWithProvider,
        signInAsGuest,
        signOut,
        updateProfile,
        refreshProfile,
    ]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth debe utilizarse dentro de AuthProvider."
        );
    }

    return context;
}