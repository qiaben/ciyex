"use client"
import React, { useEffect, useState } from "react"
import AdminLayout from "@/app/(admin)/layout"
import { fetchWithAuth } from "@/utils/fetchWithAuth"

type A = {
  id: number
  patientId: number
  patientName?: string
  providerId?: number
  visitType?: string
  appointmentStartDate?: string
  appointmentStartTime?: string
  status?: string
}

async function fetchPatientName(id: number) {
  try {
    const r = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${id}`)
    if (!r.ok) return String(id)
    const j = await r.json()
    return `${j.data.firstName} ${j.data.lastName}`
  } catch { return String(id) }
}

export default function Page() {
  const [rows, setRows] = useState<A[]>([])
  const [mrn] = useState<number>(9)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/appointments?page=0&size=100`)
        const j = await res.json()
        const content = j.data?.content || []
        type Raw = Record<string, unknown>
        const normalized = (content as Raw[]).map((item) => {
          const r = item as Raw
          const get = (names: string[]) => {
            for (const n of names) if (r[n] !== undefined && r[n] !== null) return r[n]
            return undefined
          }
          return {
            id: Number(get(['id', 'ID']) ?? r.id ?? 0),
            patientId: Number(get(['patientId', 'patient_id', 'patientid']) ?? r.patientId ?? r.patientid ?? 0),
            providerId: Number(get(['providerId', 'provider_id', 'providerid']) ?? r.providerId ?? 0),
            visitType: String(get(['visitType', 'visit_type', 'visittype']) ?? r.visitType ?? ''),
            appointmentStartDate: (get(['appointmentStartDate', 'appointment_start_date', 'appointmentstartdate']) ?? r.appointmentStartDate) as string | undefined,
            appointmentStartTime: (get(['appointmentStartTime', 'appointment_start_time', 'appointmentstarttime']) ?? r.appointmentStartTime) as string | undefined,
            status: (get(['status']) ?? r.status) as string | undefined
          }
        })

        const filtered = normalized.filter((rec) => Number(rec.patientId) === mrn)
        const withNames = await Promise.all(filtered.map(async (rec) => ({ ...rec, patientName: await fetchPatientName(rec.patientId) })))
        if (mounted) setRows(withNames)
      } catch { if (mounted) setRows([]) }
    })()
    return () => { mounted = false }
  }, [mrn])

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Appointments for MRN {mrn}</h1>
          <button onClick={() => location.reload()} className="px-3 py-1 bg-blue-600 text-white rounded">Refresh</button>
        </div>
        <table className="w-full text-sm border-collapse">
          <thead className="text-left">
            <tr><th className="p-2">MRN</th><th className="p-2">Patient</th><th className="p-2">Provider</th><th className="p-2">Date</th><th className="p-2">Time</th><th className="p-2">Status</th></tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t"><td className="p-2">{r.patientId}</td><td className="p-2">{r.patientName}</td><td className="p-2">{r.providerId}</td><td className="p-2">{r.appointmentStartDate}</td><td className="p-2">{r.appointmentStartTime}</td><td className="p-2">{r.status}</td></tr>
            ))}
            {rows.length===0 && <tr><td colSpan={6} className="p-4 text-gray-500">No appointments</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
