// src/utils/fetchWithAuth.tsx

export async function fetchWithAuth(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<Response> {
    const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

    // Normalize input for debugging
    const url = typeof input === "string" ? input : input.toString();
    console.log("📡 fetchWithAuth ->", url);

    // For login/register, skip token injection
    const isAuthEndpoint =
        url.includes("/api/auth/login") || url.includes("/api/auth/register");

    // Cast to a plain object so we can safely index
    const headers: Record<string, string> = {
        ...(init?.headers as Record<string, string>),
    };

    if (token && !isAuthEndpoint) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...init,
            headers,
        });

        if (!response.ok) {
            console.error(
                `❌ Fetch failed (${response.status}):`,
                await response.text()
            );
        }

        return response;
    } catch (err) {
        console.error("🔥 fetchWithAuth error:", err);
        throw err;
    }
}
