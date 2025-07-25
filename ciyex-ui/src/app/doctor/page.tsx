'use client'

import { useEffect, useState } from 'react'
import { fetchWithAuth } from '@/utils/fetchWithAuth'

interface Patient {
    id: string
    name: string
    gender: string
    birthDate: string
}

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([])

    useEffect(() => {
        const loadPatients = async () => {
            try {
                const res = await fetchWithAuth('/api/patient/list')
                const json = await res.json()
                if (json.success) {
                    setPatients(json.data || [])
                }
            } catch (error) {
                console.error('Failed to load patients:', error)
            }
        }

        loadPatients()
    }, [])

    return (
        <div className="p-6 space-y-6">
            <div className="text-2xl font-bold">Patients</div>
            <div className="text-muted-foreground">Total: {patients.length}</div>

            <div className="grid gap-4">
                {patients.map((p) => (
                    <div
                        key={p.id}
                        className="bg-neutral-900 border border-neutral-700 rounded-lg p-4"
                    >
                        <div className="font-medium text-lg">{p.name}</div>
                        <div className="text-sm text-muted-foreground">
                            Gender: {p.gender} | DOB: {p.birthDate}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
