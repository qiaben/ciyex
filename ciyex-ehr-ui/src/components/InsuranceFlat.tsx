"use client";
import React from "react";

interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    insuranceProvider?: string;
}

type InsuranceLevel = "primary" | "secondary" | "tertiary";

interface InsurancePolicy {
    provider?: string;
    planName?: string;
    effectiveStart?: string;
    effectiveEnd?: string;
    policyNumber?: string;
    groupNumber?: string;
    subscriberEmployer?: string;
    subscriber?: string;
    subscriberDob?: string;
    subscriberSex?: "Unassigned" | "Male" | "Female";
    ssn?: string;
    subscriberAddress?: string;
    copay?: string;
    acceptsAssignment?: "Yes" | "No";
    secondaryMedicareType?: string;
}

type InsuranceForm = Record<InsuranceLevel, InsurancePolicy>;

type Props = {
    patient: Patient;
    insuranceForm: InsuranceForm;
    setInsuranceForm: React.Dispatch<React.SetStateAction<InsuranceForm>>;
    editInsurance: boolean;
    setEditInsurance: (v: boolean) => void;
    insuranceSubTab: InsuranceLevel;
    setInsuranceSubTab: (tab: InsuranceLevel) => void;
    saveInsurance: () => Promise<void>;
    setPolicyField: <K extends keyof InsurancePolicy>(
        level: InsuranceLevel,
        key: K,
        value: InsurancePolicy[K]
    ) => void;
    setViewMode: (mode: string) => void;
    setHighlightedTab: (tab: string) => void;
};

const InsuranceFlat: React.FC<Props> = ({
                                            patient,
                                            insuranceForm,
                                            editInsurance,
                                            setEditInsurance,
                                            insuranceSubTab,
                                            setInsuranceSubTab,
                                            saveInsurance,
                                            setPolicyField,
                                            setViewMode,
                                            setHighlightedTab,
                                        }) => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Insurance</h4>
                {!editInsurance && (
                    <button
                        onClick={() => setEditInsurance(true)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Edit
                    </button>
                )}
            </div>

            {/* ---------- READ ONLY ---------- */}
            {!editInsurance ? (
                <div className="mt-2 text-sm leading-6">
                    <div>
                        <strong>Insurer:</strong>{" "}
                        {insuranceForm?.primary?.provider ||
                            patient.insuranceProvider ||
                            "Self-Pay"}
                    </div>
                    <div>
                        <strong>Subscriber:</strong>{" "}
                        {insuranceForm?.primary?.subscriber || "—"}
                    </div>
                    <div>
                        <strong>Subscriber Employer:</strong>{" "}
                        {insuranceForm?.primary?.subscriberEmployer || "—"}
                    </div>
                    <div>
                        <strong>Plan Name:</strong>{" "}
                        {insuranceForm?.primary?.planName || "—"}
                    </div>
                    <div>
                        <strong>Policy Number:</strong>{" "}
                        {insuranceForm?.primary?.policyNumber || "—"}
                    </div>
                    <div>
                        <strong>Group Number:</strong>{" "}
                        {insuranceForm?.primary?.groupNumber || "—"}
                    </div>
                    <div>
                        <strong>Copay:</strong> {insuranceForm?.primary?.copay || "—"}
                    </div>
                    <div>
                        <strong>Accepts Assignment:</strong>{" "}
                        {insuranceForm?.primary?.acceptsAssignment || "Yes"}
                    </div>
                </div>
            ) : (
                /* ---------- EDIT MODE ---------- */
                <div className="mt-2">
                    {/* Sub-tabs */}
                    <div className="flex gap-2 mb-4 border-b">
                        {(["primary", "secondary", "tertiary"] as InsuranceLevel[]).map(
                            (tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setInsuranceSubTab(tab)}
                                    className={`px-3 py-1 rounded-t ${
                                        insuranceSubTab === tab
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            )
                        )}
                    </div>

                    {/* Active policy form */}
                    <form
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                await saveInsurance();
                                setEditInsurance(false);
                                setViewMode("dashboard");
                                setHighlightedTab("dashboard");
                            } catch (err) {
                                alert((err as Error).message);
                            }
                        }}
                    >
                        {/* Example fields */}
                        <div>
                            <label className="block font-medium">Provider</label>
                            <input
                                className="w-full border rounded px-2 py-1"
                                value={insuranceForm[insuranceSubTab].provider ?? ""}
                                onChange={(e) =>
                                    setPolicyField(insuranceSubTab, "provider", e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <label className="block font-medium">Plan Name</label>
                            <input
                                className="w-full border rounded px-2 py-1"
                                value={insuranceForm[insuranceSubTab].planName ?? ""}
                                onChange={(e) =>
                                    setPolicyField(insuranceSubTab, "planName", e.target.value)
                                }
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 mt-2 md:col-span-2">
                            <button
                                type="submit"
                                className="px-3 py-2 bg-emerald-600 text-white rounded"
                            >
                                Save All & Exit
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditInsurance(false)}
                                className="px-3 py-2 bg-gray-200 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default InsuranceFlat;
