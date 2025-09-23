export async function fetchWithAuth(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  const orgId = typeof window !== "undefined" ? localStorage.getItem("orgId") : undefined;

  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(orgId ? { "X-Org-Id": orgId } : {}),   // ✅ add this
  };

  const mergedHeaders = new Headers(init.headers || {});
  Object.entries(authHeaders).forEach(([key, value]) => {
    if (!mergedHeaders.has(key)) mergedHeaders.set(key, value);
  });

  let url: string;
  if (typeof input === "string") {
    url = /^https?:\/\//i.test(input)
      ? input
      : `${process.env.NEXT_PUBLIC_API_URL}${input}`;
  } else {
    url = (input as Request).url;
  }

  return fetch(url, { ...init, headers: mergedHeaders });
}
