"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/app/(admin)/layout";
import { fetchWithAuth } from "@/utils/fetchWithAuth";

type InsuranceCompany = {
  id: number;
  name: string;
};

type InsurancePolicy = {
  providerId: number | null;
  planName: string;
  effectiveDate: string;
  effectiveDateEnd: string;
  policyNumber: string;
  groupNumber: string;
  copay: string;
  acceptAssignment: "YES" | "NO";
  secondaryMedicareType: "N/A" | "Part A" | "Part B";
};

const initialPolicy: InsurancePolicy = {
  providerId: null,
  planName: "",
  effectiveDate: "",
  effectiveDateEnd: "",
  policyNumber: "",
  groupNumber: "",
  copay: "",
  acceptAssignment: "YES",
  secondaryMedicareType: "N/A",
};

type Level = "primary" | "secondary" | "tertiary";

export default function InsurancePage() {
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [policies, setPolicies] = useState<Record<Level, InsurancePolicy>>({
    primary: { ...initialPolicy },
    secondary: { ...initialPolicy },
    tertiary: { ...initialPolicy },
  });
  const [editLevel, setEditLevel] = useState<Level | null>(null);

  // Load insurance companies
  useEffect(() => {
    async function loadCompanies() {
      try {
        const res = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/insurance-companies`
        );
        const data = await res.json();
        setCompanies(data.data ?? []);
      } catch (err) {
        console.error("Failed to load companies", err);
      }
    }
    loadCompanies();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    level: Level
  ) => {
    const { name, value } = e.target;
    setPolicies((prev) => ({
      ...prev,
      [level]: { ...prev[level], [name]: value },
    }));
  };

  const handleSave = async (level: Level) => {
    try {
      console.log(`Saving ${level} policy:`, policies[level]);
      setEditLevel(null);
    } catch (err) {
      console.error("Failed to save", err);
    }
  };

  const renderSummary = (level: Level, title: string) => {
    const p = policies[level];
    return (
      <div className="bg-white border rounded-lg shadow-sm p-6 space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">{title} Insurance</h2>
          <button
            onClick={() => setEditLevel(level)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
          >
            Edit
          </button>
        </div>
        <p>
          <strong>Insurer:</strong>{" "}
          {companies.find((c) => c.id === p.providerId)?.name || "—"}
        </p>
        <p>
          <strong>Plan:</strong> {p.planName || "—"}
        </p>
        <p>
          <strong>Policy #:</strong> {p.policyNumber || "—"}
        </p>
        <p>
          <strong>Group #:</strong> {p.groupNumber || "—"}
        </p>
        <p>
          <strong>Copay:</strong> {p.copay || "—"}
        </p>
        <p>
          <strong>Assignment:</strong> {p.acceptAssignment}
        </p>
      </div>
    );
  };

  const renderForm = (level: Level, title: string) => {
    const p = policies[level];
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave(level);
        }}
        className="bg-white border rounded-lg shadow-sm p-6 space-y-4"
      >
        <h2 className="text-lg font-semibold">{title} Insurance</h2>
        <select
          name="providerId"
          value={p.providerId ?? ""}
          onChange={(e) => handleChange(e, level)}
          className="w-full border rounded px-2 py-1"
        >
          <option value="">Select Provider</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          name="planName"
          placeholder="Plan Name"
          value={p.planName}
          onChange={(e) => handleChange(e, level)}
          className="w-full border rounded px-2 py-1"
        />
        <input
          name="policyNumber"
          placeholder="Policy Number"
          value={p.policyNumber}
          onChange={(e) => handleChange(e, level)}
          className="w-full border rounded px-2 py-1"
        />
        <input
          name="groupNumber"
          placeholder="Group Number"
          value={p.groupNumber}
          onChange={(e) => handleChange(e, level)}
          className="w-full border rounded px-2 py-1"
        />
        <input
          type="date"
          name="effectiveDate"
          value={p.effectiveDate}
          onChange={(e) => handleChange(e, level)}
          className="w-full border rounded px-2 py-1"
        />
        <input
          type="date"
          name="effectiveDateEnd"
          value={p.effectiveDateEnd}
          onChange={(e) => handleChange(e, level)}
          className="w-full border rounded px-2 py-1"
        />
        <input
          name="copay"
          placeholder="Copay"
          value={p.copay}
          onChange={(e) => handleChange(e, level)}
          className="w-full border rounded px-2 py-1"
        />
        <select
          name="acceptAssignment"
          value={p.acceptAssignment}
          onChange={(e) => handleChange(e, level)}
          className="w-full border rounded px-2 py-1"
        >
          <option value="YES">YES</option>
          <option value="NO">NO</option>
        </select>
        <select
          name="secondaryMedicareType"
          value={p.secondaryMedicareType}
          onChange={(e) => handleChange(e, level)}
          className="w-full border rounded px-2 py-1"
        >
          <option value="N/A">N/A</option>
          <option value="Part A">Part A</option>
          <option value="Part B">Part B</option>
        </select>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditLevel(null)}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </form>
    );
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold mb-6">Insurance Information</h1>

        {editLevel === "primary"
          ? renderForm("primary", "Primary")
          : renderSummary("primary", "Primary")}

        {editLevel === "secondary"
          ? renderForm("secondary", "Secondary")
          : renderSummary("secondary", "Secondary")}

        {editLevel === "tertiary"
          ? renderForm("tertiary", "Tertiary")
          : renderSummary("tertiary", "Tertiary")}
      </div>
    </AdminLayout>
  );
}
