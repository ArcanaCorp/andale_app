import { supabase } from "../lib/supabase";

const PLACE_FIELDS = `
    id,
    slug,
    name,
    category,
    type,
    subtype,
    district,
    short_description,
    cover_image_url,
    is_featured
`;

export async function getPlaces() {
    const { data, error } = await supabase
        .from("places")
        .select(PLACE_FIELDS)
        .eq("department", "Junín")
        .eq("province", "Jauja")
        .eq("is_active", true)
        .order("name", { ascending: true });

    if (error) throw error;

    return data ?? [];
}

export async function getFeaturedPlaces() {
    const { data, error } = await supabase
        .from("places")
        .select(PLACE_FIELDS)
        .eq("department", "Junín")
        .eq("province", "Jauja")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("name", { ascending: true })
        .limit(8);

    if (error) throw error;

    return data ?? [];
}

export async function getFavoritePlaces(userId) {
    if (!userId) return [];

    const { data: favorites, error: favoritesError } = await supabase
        .from("customer_favorites")
        .select("place_id")
        .eq("user_id", userId)
        .not("place_id", "is", null);

    if (favoritesError) throw favoritesError;

    const placeIds = [...new Set((favorites ?? []).map(item => item.place_id))];

    if (!placeIds.length) return [];

    const { data: places, error: placesError } = await supabase
        .from("places")
        .select(PLACE_FIELDS)
        .in("id", placeIds)
        .eq("is_active", true);

    if (placesError) throw placesError;

    return places ?? [];
}

export async function getRandomPlaces({category = "Todos", search = "", excludeIds = []} = {}) {
    const { data, error } = await supabase.rpc("get_random_places", {
        p_category: category,
        p_search: search.trim(),
        p_exclude_ids: excludeIds,
        p_limit: 12,
    });

    if (error) throw error;

    return data ?? [];
}

export async function getPlaceCategories() {
    const { data, error } = await supabase
        .from("places")
        .select("category")
        .eq("department", "Junín")
        .eq("province", "Jauja")
        .eq("is_active", true)
        .not("category", "is", null)
        .limit(500);

    if (error) throw error;

    const uniqueCategories = [
        ...new Set(
            (data ?? [])
                .map(place => place.category)
                .filter(Boolean)
        ),
    ];

    return ["Todos", ...uniqueCategories];
}

export async function getPlaceBySlug(slug) {
    if (!slug) {
        throw new Error("No se proporcionó el slug del lugar.");
    }

    const { data, error } = await supabase
        .from("places")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

    if (error) throw error;

    return data;
}