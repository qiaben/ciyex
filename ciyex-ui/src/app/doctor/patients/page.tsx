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
        <div className="p-6 bg-white dark:bg-neutral-900 min-h-screen">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Patient List</h1>

            {loading ? (
                <p className="text-gray-700 dark:text-gray-300">Loading...</p>
            ) : (
                <div className="overflow-x-auto shadow rounded-lg">
                    <table className="w-full table-auto border border-gray-300 dark:border-gray-700">
                        <thead className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white">
                        <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Gender</th>
                            <th className="p-3 text-left">DOB</th>
                            <th className="p-3 text-left">ID</th>
                        </tr>
                        </thead>
                        <tbody className="text-gray-700 dark:text-gray-300">
                        {patients.map((p: any) => (
                            <tr key={p.id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                                <td className="p-3">{p.name}</td>
                                <td className="p-3 capitalize">{p.gender}</td>
                                <td className="p-3">{p.birthDate}</td>
                                <td className="p-3">{p.id}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
