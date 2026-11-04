import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

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

    // Iniciar sesión con correo.
    const signIn = useCallback(async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
        });

        if (error) throw error;

        return data;
    }, []);

    // Registrar cuenta.
    const signUp = useCallback(async (email, password, fullName = "") => {
        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
                data: { full_name: fullName },
            },
        });

        if (error) throw error;

        return data;
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