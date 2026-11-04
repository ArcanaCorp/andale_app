import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";

export default function IndexRoute() {
    const { session, loading } = useAuth();

    if (loading) return null;

    return <Redirect href={session ? "/(tabs)" : "/welcome"} />;
}
