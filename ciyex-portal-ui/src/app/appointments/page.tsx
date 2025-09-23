"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/app/(admin)/layout";
import Alert from "@/components/ui/alert/Alert";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

/** 🔹 Safe JSON parse */
async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

type Appointment = {
  id?: number;
  visitType: string;
  patientId?: number;
  providerId: number;
  appointmentStartDate: string;
  appointmentEndDate: string;
  appointmentStartTime: string;
  appointmentEndTime: string;
  formattedDate?: string;
  formattedTime?: string;
  priority: string;
  locationId: number;
  status?: string;
  reason: string;
  orgId?: number;
};

type Provider = {
  id: number;
  identification: { firstName: string; lastName: string };
  professionalDetails?: { specialty?: string };
};

type Location = { id: number; name: string; address: string };

export default function AppointmentsPage() {
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [availableSlots, setAvailableSlots] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    providerId: "",
    locationId: "",
    date: "",
    time: "",
    reason: "",
    visitType: "Consultation",
    priority: "Routine",
  });

  const [alert, setAlert] = useState<{
    variant: "success" | "error";
    title: string;
    message: string;
  } | null>(null);

  /** 🔹 Load initial data */
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [apptRes, provRes, locRes] = await Promise.all([
          fetchWithAuth("/api/portal/appointments"),
          fetchWithAuth("/api/portal/providers"),
          fetchWithAuth("/api/portal/locations"),
        ]);

        const appts = await safeJson(apptRes);
        const provs = await safeJson(provRes);
        const locs = await safeJson(locRes);

        setAppointments(appts.data || []);
        setProviders(provs.data || []);
        setLocations(locs.data || []);
      } catch (err) {
        console.error("❌ Load error:", err);
        setAlert({
          variant: "error",
          title: "Error",
          message: "Could not load appointments, providers, or locations.",
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  /** 🔹 Fetch slots */
  async function fetchSlots(providerId: string, date: string) {
    try {
      const res = await fetchWithAuth(
        `/api/portal/providers/${providerId}/availability/date?date=${date}&limit=3`
      );
      const data = await safeJson(res);
      setAvailableSlots(data.data || []);
    } catch {
      setAvailableSlots([]);
    }
  }

  /** 🔹 Handle form change */
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "date" && value && form.providerId) {
      fetchSlots(form.providerId, value);
    }
    if (name === "providerId" && value && form.date) {
      fetchSlots(value, form.date);
    }
  }

  /** 🔹 Submit */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.providerId || !form.locationId || !form.date || !form.time) {
      setAlert({
        variant: "error",
        title: "Missing Fields",
        message: "Please select provider, date, time, and location.",
      });
      return;
    }

    const newAppt: Appointment = {
      visitType: form.visitType,
      providerId: Number(form.providerId),
      locationId: Number(form.locationId),
      appointmentStartDate: form.date,
      appointmentEndDate: form.date,
      appointmentStartTime: form.time,
      appointmentEndTime: "", // backend can auto-calc from slot
      reason: form.reason,
      priority: form.priority,
      status: "PENDING",
    };

    try {
      const res = await fetchWithAuth("/api/portal/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAppt),
      });
      const saved = await safeJson(res);

      if (!saved.success) throw new Error(saved.message);

      setAppointments((prev) => [...prev, saved.data]);
      setShowModal(false);
      setForm({
        providerId: "",
        locationId: "",
        date: "",
        time: "",
        reason: "",
        visitType: "Consultation",
        priority: "Routine",
      });
      setAlert({
        variant: "success",
        title: "Appointment Requested",
        message: saved.message || "Your appointment request has been sent.",
      });
    } catch (err) {
      setAlert({
        variant: "error",
        title: "Error",
        message: err instanceof Error ? err.message : "Could not create appointment.",
      });
    }
  }

  /** 🔹 Status badge styling */
  function statusBadge(status?: string) {
    switch ((status || "").toUpperCase()) {
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            My Appointments
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
          >
            + Request Appointment
          </button>
        </div>

        {alert && <Alert {...alert} />}

        {/* Table */}
        {loading ? (
          <div className="text-center py-10 text-gray-600 dark:text-gray-300">
            Loading appointments...
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Time</th>
                  <th className="px-4 py-2">Provider</th>
                  <th className="px-4 py-2">Location</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-gray-500">
                      No appointments yet.
                    </td>
                  </tr>
                ) : (
                  appointments.map((a) => {
                    const provider = providers.find((p) => p.id === a.providerId);
                    const location = locations.find((l) => l.id === a.locationId);

                    return (
                      <tr
                        key={a.id}
                        className="border-t hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="px-4 py-2">{a.formattedDate}</td>
                        <td className="px-4 py-2">{a.formattedTime}</td>
                        <td className="px-4 py-2">
                          {provider
                            ? `${provider.identification.firstName} ${provider.identification.lastName}`
                            : a.providerId}
                        </td>
                        <td className="px-4 py-2">
                          {location ? location.name : a.locationId}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge(
                              a.status
                            )}`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">{a.reason}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-start z-50 px-4 pt-24"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowModal(false);
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-2xl border">
              <h2 className="text-lg font-semibold mb-4">Request Appointment</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Provider */}
                <div>
                  <label className="block text-sm mb-1">Provider</label>
                  <select
                    name="providerId"
                    value={form.providerId}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 text-sm"
                    required
                  >
                    <option value="">Select a provider</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.identification.firstName} {p.identification.lastName}{" "}
                        {p.professionalDetails?.specialty
                          ? ` - ${p.professionalDetails.specialty}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                {form.providerId && (
                  <div>
                    <label className="block text-sm mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      className="w-full border rounded px-2 py-1 text-sm"
                      required
                    />
                  </div>
                )}

                {/* Slots */}
                {form.providerId && form.date && availableSlots.length > 0 && (
                  <div>
                    <label className="block text-sm mb-1">Available Times</label>
                    <div className="flex flex-wrap gap-2">
                      {availableSlots.map((slot, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({ ...prev, time: slot.appointmentStartTime }))
                          }
                          className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm border ${
                            form.time === slot.appointmentStartTime
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {slot.formattedTime}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location */}
                <div>
                  <label className="block text-sm mb-1">Location</label>
                  <select
                    name="locationId"
                    value={form.locationId}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 text-sm"
                    required
                  >
                    <option value="">Select location</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} - {l.address}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm mb-1">Reason</label>
                  <textarea
                    name="reason"
                    value={form.reason}
                    onChange={handleChange}
                    className="w-full border rounded px-2 py-1 text-sm"
                    placeholder="Brief reason for visit"
                  />
                </div>

                {/* Visit Type & Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Visit Type</label>
                    <select
                      name="visitType"
                      value={form.visitType}
                      onChange={handleChange}
                      className="w-full border rounded px-2 py-1 text-sm"
                    >
                      <option value="Consultation">Consultation</option>
                      <option value="Follow-up">Follow-up</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Priority</label>
                    <select
                      name="priority"
                      value={form.priority}
                      onChange={handleChange}
                      className="w-full border rounded px-2 py-1 text-sm"
                    >
                      <option value="Routine">Routine</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1 text-sm rounded bg-gray-300 dark:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!form.time}
                    className={`px-3 py-1 text-sm rounded text-white ${
                      form.time
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    Book
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
