"use client";
import { useState, useEffect, useCallback } from "react";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

interface Code {
    id: number;
    codeType: string;
    code: string;
    modifier?: string;
    active: boolean;
    description?: string;
    shortDescription?: string;
    category?: string;
    diagnosisReporting?: boolean;
    serviceReporting?: boolean;
    relateTo?: string;
    feeStandard?: number;
}

const codeTypes = [
    { value: "CPT4", label: "CPT4 Procedure/Service" },
    { value: "HCPCS", label: "HCPCS Procedure/Service" },
    { value: "CVX", label: "CVX Immunization" },
    { value: "ICD10", label: "ICD10 Diagnosis" },
    { value: "ICD9", label: "ICD9 Diagnosis" },
    { value: "CUSTOM", label: "Custom" },
];

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/codes`;

export default function CodesPage() {
    const [codes, setCodes] = useState<Code[]>([]);
    const [form, setForm] = useState<Partial<Code>>({});
    const [q, setQ] = useState("");
    const [selectedType, setSelectedType] = useState<string>("");

    const orgId = typeof window !== "undefined" ? localStorage.getItem("orgId") : null;
    const patientId = typeof window !== "undefined" ? localStorage.getItem("patientId") : null;
    const encounterId = typeof window !== "undefined" ? localStorage.getItem("encounterId") : null;

    // ✅ Memoized loader
    const loadCodes = useCallback(async () => {
        if (!orgId || !patientId || !encounterId) {
            console.warn("Missing orgId/patientId/encounterId in localStorage");
            return;
        }

        try {
            const url = q
                ? `${API_URL}/${patientId}/${encounterId}/search?q=${encodeURIComponent(q)}&codeType=${selectedType || ""}`
                : `${API_URL}/${patientId}/${encounterId}`;

            const res = await fetchWithAuth(url);
            if (res.ok) {
                const json = await res.json();
                setCodes(json.data || []);
            } else {
                console.error("Failed to load codes", res.status);
            }
        } catch (err) {
            console.error("Error loading codes:", err);
        }
    }, [orgId, patientId, encounterId, q, selectedType]);

    // ✅ Save
    const saveCode = async () => {
        if (!orgId || !patientId || !encounterId) return;

        if (form.id) {
            const res = await fetchWithAuth(`${API_URL}/${patientId}/${encounterId}/${form.id}`, {
                method: "PUT",
                body: JSON.stringify(form),
            });
            if (res.ok) {
                const json = await res.json();
                setCodes((prev) => prev.map((c) => (c.id === form.id ? json.data : c)));
            }
        } else {
            const res = await fetchWithAuth(`${API_URL}/${patientId}/${encounterId}`, {
                method: "POST",
                body: JSON.stringify(form),
            });
            if (res.ok) {
                const json = await res.json();
                setCodes((prev) => [json.data, ...prev]);
            }
        }
        setForm({});
    };

    // ✅ Delete
    const deleteCode = async (id: number) => {
        if (!orgId || !patientId || !encounterId) return;
        const res = await fetchWithAuth(`${API_URL}/${patientId}/${encounterId}/${id}`, {
            method: "DELETE",
        });
        if (res.ok) {
            setCodes((prev) => prev.filter((c) => c.id !== id));
        }
    };

    // ✅ Load on change
    useEffect(() => {
        loadCodes();
    }, [loadCodes]);

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-xl font-semibold">Code Management</h2>

            {/* Form */}
            <div className="border rounded-lg p-4 bg-white shadow-sm space-y-4">
                <h3 className="font-medium">{form.id ? "Update Code" : "Add New Code"}</h3>
                <div className="grid grid-cols-5 gap-4">
                    <select
                        value={form.codeType || ""}
                        onChange={(e) => setForm({ ...form, codeType: e.target.value })}
                        className="border rounded px-2 py-2 text-sm"
                    >
                        <option value="">Select Type</option>
                        {codeTypes.map((t) => (
                            <option key={t.value} value={t.value}>
                                {t.label}
                            </option>
                        ))}
                    </select>
                    <input
                        value={form.code || ""}
                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                        placeholder="Code"
                        className="border rounded px-2 py-2 text-sm"
                    />
                    <input
                        value={form.modifier || ""}
                        onChange={(e) => setForm({ ...form, modifier: e.target.value })}
                        placeholder="Modifier"
                        className="border rounded px-2 py-2 text-sm"
                    />
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={form.active || false}
                            onChange={(e) => setForm({ ...form, active: e.target.checked })}
                        />
                        Active
                    </label>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <input
                        value={form.description || ""}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Description"
                        className="border rounded px-2 py-2 text-sm col-span-2"
                    />
                    <input
                        value={form.shortDescription || ""}
                        onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                        placeholder="Short Description"
                        className="border rounded px-2 py-2 text-sm"
                    />
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <input
                        value={form.category || ""}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        placeholder="Category"
                        className="border rounded px-2 py-2 text-sm"
                    />
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={form.diagnosisReporting || false}
                            onChange={(e) => setForm({ ...form, diagnosisReporting: e.target.checked })}
                        />
                        Diagnosis Reporting
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={form.serviceReporting || false}
                            onChange={(e) => setForm({ ...form, serviceReporting: e.target.checked })}
                        />
                        Service Reporting
                    </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <input
                        value={form.relateTo || ""}
                        onChange={(e) => setForm({ ...form, relateTo: e.target.value })}
                        placeholder="Relate To"
                        className="border rounded px-2 py-2 text-sm"
                    />
                    <input
                        type="number"
                        value={form.feeStandard ?? ""}
                        onChange={(e) => setForm({ ...form, feeStandard: parseFloat(e.target.value) })}
                        placeholder="Fee Standard"
                        className="border rounded px-2 py-2 text-sm"
                    />
                </div>

                <div className="flex justify-end gap-2 mt-4">
                    {form.id && (
                        <button onClick={() => setForm({})} className="bg-gray-400 text-white px-4 py-2 rounded">
                            Cancel
                        </button>
                    )}
                    <button onClick={saveCode} className="bg-green-600 text-white px-4 py-2 rounded">
                        {form.id ? "Update" : "Add New"}
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="border rounded px-2 py-2 text-sm w-60"
                >
                    <option value="">All Types</option>
                    {codeTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </select>

                <div className="flex items-center gap-2">
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search..."
                        className="border rounded px-3 py-2 w-80"
                    />
                    <button onClick={loadCodes} className="bg-blue-600 text-white px-4 py-2 rounded">
                        Search
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="px-2 py-2">Code</th>
                        <th className="px-2 py-2">Mod</th>
                        <th className="px-2 py-2">Act</th>
                        <th className="px-2 py-2">Category</th>
                        <th className="px-2 py-2">Dx Rep</th>
                        <th className="px-2 py-2">Serv Rep</th>
                        <th className="px-2 py-2">Type</th>
                        <th className="px-2 py-2">Description</th>
                        <th className="px-2 py-2">Short Desc</th>
                        <th className="px-2 py-2">Related</th>
                        <th className="px-2 py-2">Fee</th>
                        <th className="px-2 py-2 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {codes.length === 0 ? (
                        <tr>
                            <td colSpan={12} className="text-center py-4">
                                No codes found.
                            </td>
                        </tr>
                    ) : (
                        codes.map((c) => (
                            <tr key={c.id} className="border-t">
                                <td className="px-2 py-2">{c.code}</td>
                                <td className="px-2 py-2">{c.modifier}</td>
                                <td className="px-2 py-2">{c.active ? "Y" : "N"}</td>
                                <td className="px-2 py-2">{c.category}</td>
                                <td className="px-2 py-2">{c.diagnosisReporting ? "Y" : "N"}</td>
                                <td className="px-2 py-2">{c.serviceReporting ? "Y" : "N"}</td>
                                <td className="px-2 py-2">{c.codeType}</td>
                                <td className="px-2 py-2">{c.description}</td>
                                <td className="px-2 py-2">{c.shortDescription}</td>
                                <td className="px-2 py-2">{c.relateTo}</td>
                                <td className="px-2 py-2">{c.feeStandard}</td>
                                <td className="px-2 py-2 text-right space-x-2">
                                    <button onClick={() => setForm(c)} className="px-2 py-1 bg-yellow-400 rounded">
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteCode(c.id)}
                                        className="px-2 py-1 bg-red-500 text-white rounded"
                                    >
                                        Del
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
