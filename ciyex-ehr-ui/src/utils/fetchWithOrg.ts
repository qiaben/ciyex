export function apiBase() {
    return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
}

export async function fetchWithOrg(input: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers || {});
    const orgId = typeof window !== "undefined" ? localStorage.getItem("orgId") : null;
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    headers.set("Content-Type", "application/json");
    if (orgId) headers.set("orgId", String(orgId));          // 👈 EXACT header name
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const url = input.startsWith("http") ? input : `${apiBase()}${input}`;
    return fetch(url, { ...init, headers, cache: "no-store" });
}
