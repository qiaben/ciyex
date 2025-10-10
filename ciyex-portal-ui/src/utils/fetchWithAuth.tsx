export async function fetchWithAuth(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : undefined;
  let orgId = typeof window !== "undefined" ? localStorage.getItem("orgId") : undefined;

  // If orgId not in localStorage, try to extract from JWT token
  if (!orgId && token) {
    const { getOrgIdsFromToken } = await import('./jwtHelper');
    const orgIds = getOrgIdsFromToken();
    if (orgIds.length > 0) {
      orgId = orgIds[0].toString();
    }
  }

  // Debug logging
  console.log('🔍 fetchWithAuth debug:', {
    hasToken: !!token,
    tokenLength: token?.length,
    hasOrgId: !!orgId,
    orgId,
    url: typeof input === "string" ? input : input.url
  });

  const authHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(orgId ? { "x-org-id": orgId } : {}),   // ✅ use lowercase x-org-id
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

  return fetch(url, { ...init, headers: mergedHeaders, credentials: 'include' });
}
