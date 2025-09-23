"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "@/app/(admin)/layout";
import Alert from "@/components/ui/alert/Alert";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

type Patient = {
  id: number;
  firstName: string;
  lastName: string;
  gender: string;
  dob: string;
  email: string;
  phone: string;
};

type Vital = {
  id: number;
  date: string; // YYYY-MM-DD
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
};

export default function VitalsPage() {
  const params = useParams();
  const patientId = (params?.id || "") as string;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [vitals, setVitals] = useState<Vital[]>([]);
  const [filter, setFilter] = useState<"7" | "30" | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ date: "", bloodPressure: "", heartRate: "", temperature: "", weight: "" });

  const [alert, setAlert] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  // fetch patient + vitals
  useEffect(() => {
    async function loadData() {
      try {
        const patientRes = await fetchWithAuth(`/api/patients/${patientId}`);
        const patientData = await patientRes.json();
        setPatient(patientData.data);

        const vitalsRes = await fetchWithAuth(`/api/vitals/${patientId}`);
        const vitalsData = await vitalsRes.json();
        setVitals(vitalsData.data || []);
      } catch (err) {
        console.error("Failed to load data", err);
      }
    }
    loadData();
  }, [patientId]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetchWithAuth(`/api/vitals/${patientId}`, {
        method: "POST",
        body: JSON.stringify({
          date: form.date,
          bloodPressure: form.bloodPressure,
          heartRate: Number(form.heartRate),
          temperature: Number(form.temperature),
          weight: Number(form.weight),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const newVital = await res.json();
      setVitals((prev) => [...prev, newVital.data]);
      setForm({ date: "", bloodPressure: "", heartRate: "", temperature: "", weight: "" });
      setShowModal(false);
      setAlert({ variant: "success", title: "Success", message: "Vital signs added successfully." });
    } catch {
      setAlert({ variant: "error", title: "Error", message: "Could not save vital signs." });
    }
  }

  // filter vitals by time range
  function getFilteredVitals() {
    if (filter === "all") return vitals;
    const days = filter === "7" ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return vitals.filter((v) => new Date(v.date) >= cutoff);
  }

  const filteredVitals = getFilteredVitals();
  const latestVital = vitals[vitals.length - 1];

  // small reusable line chart
  function LineChart({ data, label, color }: { data: number[]; label: string; color: string }) {
    if (!data || data.length < 2) return null;
    const w = 400;
    const h = 120;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const stepX = w / (data.length - 1);

    const points = data
      .map((val, i) => {
        const x = i * stepX;
        const y = h - ((val - min) / (max - min)) * h;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div>
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{label}</p>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32 bg-gray-50 dark:bg-gray-900 rounded">
          <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
          {data.map((val, i) => {
            const x = i * stepX;
            const y = h - ((val - min) / (max - min)) * h;
            return <circle key={i} cx={x} cy={y} r="3" fill={color} />;
          })}
        </svg>
      </div>
    );
  }

  // prepare data
  const systolic = filteredVitals.map((v) => Number(v.bloodPressure.split("/")[0]));
  const diastolic = filteredVitals.map((v) => Number(v.bloodPressure.split("/")[1]));
  const heartRate = filteredVitals.map((v) => v.heartRate);
  const temperature = filteredVitals.map((v) => v.temperature);
  const weight = filteredVitals.map((v) => v.weight);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* patient header */}
        {patient && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Patient Vitals</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {patient.firstName} {patient.lastName} • {patient.gender} • DOB: {patient.dob}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Email: {patient.email} • Phone: {patient.phone}
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-3 md:mt-0">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as "7" | "30" | "all")}
                className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="all">All</option>
              </select>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 shadow"
              >
                + Add Vitals
              </button>
            </div>
          </div>
        )}

        {/* alert */}
        {alert && <Alert variant={alert.variant} title={alert.title} message={alert.message} />}

        {/* summary cards */}
        {latestVital && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
              <p className="text-xs text-gray-500">Blood Pressure</p>
              <p className="text-lg font-bold">{latestVital.bloodPressure}</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
              <p className="text-xs text-gray-500">Heart Rate</p>
              <p className="text-lg font-bold">{latestVital.heartRate} bpm</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
              <p className="text-xs text-gray-500">Temperature</p>
              <p className="text-lg font-bold">{latestVital.temperature} °F</p>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow text-center">
              <p className="text-xs text-gray-500">Weight</p>
              <p className="text-lg font-bold">{latestVital.weight} kg</p>
            </div>
          </div>
        )}

        {/* vitals trends */}
        <div className="border rounded-lg p-6 bg-white dark:bg-gray-800 shadow space-y-4">
          <h2 className="text-md font-semibold text-gray-700 dark:text-gray-200">Vitals Trends</h2>
          {filteredVitals.length > 1 ? (
            <div className="grid md:grid-cols-2 gap-6">
              <LineChart data={systolic} label="BP Systolic" color="#2563eb" />
              <LineChart data={diastolic} label="BP Diastolic" color="#60a5fa" />
              <LineChart data={heartRate} label="Heart Rate (bpm)" color="#f43f5e" />
              <LineChart data={temperature} label="Temperature (°F)" color="#10b981" />
              <LineChart data={weight} label="Weight (kg)" color="#8b5cf6" />
            </div>
          ) : (
            <p className="italic text-gray-500">No vitals data available</p>
          )}
        </div>

        {/* vitals table */}
        <div className="overflow-x-auto border rounded-lg bg-white dark:bg-gray-800 shadow">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Blood Pressure</th>
                <th className="px-4 py-2">Heart Rate</th>
                <th className="px-4 py-2">Temperature</th>
                <th className="px-4 py-2">Weight (kg)</th>
              </tr>
            </thead>
            <tbody>
              {filteredVitals.map((v) => (
                <tr key={v.id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2">{v.date}</td>
                  <td className="px-4 py-2">{v.bloodPressure}</td>
                  <td className="px-4 py-2">{v.heartRate} bpm</td>
                  <td className="px-4 py-2">{v.temperature} °F</td>
                  <td className="px-4 py-2">{v.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Add Vital Signs</h2>
              <form className="space-y-3" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Date</label>
                    <input type="date" name="date" value={form.date} onChange={handleChange} required
                      className="w-full border rounded px-2 py-1 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Blood Pressure</label>
                    <input type="text" name="bloodPressure" value={form.bloodPressure} onChange={handleChange}
                      placeholder="120/80" className="w-full border rounded px-2 py-1 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Heart Rate</label>
                    <input type="number" name="heartRate" value={form.heartRate} onChange={handleChange}
                      className="w-full border rounded px-2 py-1 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Temperature (°F)</label>
                    <input type="number" step="0.1" name="temperature" value={form.temperature} onChange={handleChange}
                      className="w-full border rounded px-2 py-1 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Weight (kg)</label>
                    <input type="number" step="0.1" name="weight" value={form.weight} onChange={handleChange}
                      className="w-full border rounded px-2 py-1 text-sm" />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-3">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-3 py-1 text-sm rounded bg-gray-300 dark:bg-gray-600 dark:text-white">Cancel</button>
                  <button type="submit"
                    className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
