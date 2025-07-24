export async function fetchWithAuth(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const token = localStorage.getItem('token');
    const orgId = localStorage.getItem('orgId');
    const facilityId = localStorage.getItem('facilityId');
    const role = localStorage.getItem('role');

    const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...(orgId && { 'X-Org-Id': orgId }),
        ...(facilityId && { 'X-Facility-Id': facilityId }),
        ...(role && { 'X-Role': role }),
    };

    const headers = new Headers(init?.headers || {});
    Object.entries(authHeaders).forEach(([key, value]) => headers.set(key, value));

    return fetch(input, { ...init, headers });
}


/*import { fetchWithAuth } from '@/utils/fetchWithAuth';

const handleFetchData = async () => {
    const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/example`);
    const data = await res.json();
    console.log(data);
};*/
