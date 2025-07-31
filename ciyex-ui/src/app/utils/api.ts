// utils/api.ts
export async function fetchPatientList() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/patient/list`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'X-Org-Id': localStorage.getItem('orgId') || '',
            'X-Facility-Id': localStorage.getItem('facilityId') || '',
            'X-Role': localStorage.getItem('role') || '',
        },
    });


    if (!res.ok) throw new Error('Failed to fetch patient list');
    return res.json();
}
