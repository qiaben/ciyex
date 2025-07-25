// src/app/doctor/patients/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { fetchPatientList } from '@/utils/api';

export default function PatientListPage() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPatients() {
            try {
                const res = await fetchPatientList();
                setPatients(res.data);
            } catch (err) {
                console.error('Failed to load patients:', err);
            } finally {
                setLoading(false);
            }
        }

        loadPatients();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Patient List</h1>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <table className="w-full border border-gray-200">
                    <thead className="bg-black-100">
                    <tr>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Gender</th>
                        <th className="p-2 text-left">DOB</th>
                        <th className="p-2 text-left">ID</th>
                    </tr>
                    </thead>
                    <tbody>
                    {patients.map((p: any) => (
                        <tr key={p.id} className="border-t border-gray-200">
                            <td className="p-2">{p.name}</td>
                            <td className="p-2">{p.gender}</td>
                            <td className="p-2">{p.birthDate}</td>
                            <td className="p-2">{p.id}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}
