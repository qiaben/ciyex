"use client";
import React from "react";
interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender?: string;
    ssn?: string;
    mrn?: string;
    status?: "Active" | "Inactive" | "Pending";
    address?: string;
    provider?: string;
    referringProvider?: string;
    pharmacy?: string;
    hipaaNoticeReceived?: string;
    employerName?: string;
    employerAddress?: string;
    occupation?: string;
    language?: string;
    race?: string;
    ethnicity?: string;
    nationality?: string;
    billingNote?: string;
    previousNames?: string;
    guardianName?: string;
    guardianRelationship?: string;
    insuranceProvider?: string;
    primaryCarePhysician?: string;
    lastVisitDate?: string;
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
        <div className="p-4">
            {/* Header Row */}
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-lg text-gray-800"></h4>
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
                        {/* Provider */}
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

                        {/* Plan Name */}
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

                        {/* Effective Start */}
                        <div>
                            <label className="block font-medium">Effective Date</label>
                            <input
                                type="date"
                                className="w-full border rounded px-2 py-1"
                                value={insuranceForm[insuranceSubTab].effectiveStart ?? ""}
                                onChange={(e) =>
                                    setPolicyField(
                                        insuranceSubTab,
                                        "effectiveStart",
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        {/* Effective End */}
                        <div>
                            <label className="block font-medium">Effective Date End</label>
                            <input
                                type="date"
                                className="w-full border rounded px-2 py-1"
                                value={insuranceForm[insuranceSubTab].effectiveEnd ?? ""}
                                onChange={(e) =>
                                    setPolicyField(insuranceSubTab, "effectiveEnd", e.target.value)
                                }
                            />
                        </div>

                        {/* Policy Number */}
                        <div>
                            <label className="block font-medium">Policy Number</label>
                            <input
                                className="w-full border rounded px-2 py-1"
                                value={insuranceForm[insuranceSubTab].policyNumber ?? ""}
                                onChange={(e) =>
                                    setPolicyField(
                                        insuranceSubTab,
                                        "policyNumber",
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        {/* Group Number */}
                        <div>
                            <label className="block font-medium">Group Number</label>
                            <input
                                className="w-full border rounded px-2 py-1"
                                value={insuranceForm[insuranceSubTab].groupNumber ?? ""}
                                onChange={(e) =>
                                    setPolicyField(insuranceSubTab, "groupNumber", e.target.value)
                                }
                            />
                        </div>

                        {/* Subscriber Employer */}
                        <div>
                            <label className="block font-medium">Subscriber Employer</label>
                            <input
                                className="w-full border rounded px-2 py-1"
                                value={insuranceForm[insuranceSubTab].subscriberEmployer ?? ""}
                                onChange={(e) =>
                                    setPolicyField(
                                        insuranceSubTab,
                                        "subscriberEmployer",
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        {/* Subscriber */}
                        <div>
                            <label className="block font-medium">Subscriber</label>
                            <input
                                className="w-full border rounded px-2 py-1"
                                value={insuranceForm[insuranceSubTab].subscriber ?? ""}
                                onChange={(e) =>
                                    setPolicyField(insuranceSubTab, "subscriber", e.target.value)
                                }
                            />
                        </div>

                        {/* Subscriber DOB */}
                        <div>
                            <label className="block font-medium">D.O.B.</label>
                            <input
                                type="date"
                                className="w-full border rounded px-2 py-1"
                                value={insuranceForm[insuranceSubTab].subscriberDob ?? ""}
                                onChange={(e) =>
                                    setPolicyField(
                                        insuranceSubTab,
                                        "subscriberDob",
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        {/* Subscriber Sex */}
                        <div>
                            <label className="block font-medium">Sex</label>
                            <select
                                className="w-full border rounded px-2 py-1"
                                value={
                                    insuranceForm[insuranceSubTab].subscriberSex ?? "Unassigned"
                                }
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                    setPolicyField(
                                        insuranceSubTab,
                                        "subscriberSex",
                                        e.target.value as InsurancePolicy["subscriberSex"]
                                    )
                                }
                            >
                                <option>Unassigned</option>
                                <option>Male</option>
                                <option>Female</option>
                            </select>
                        </div>

                        {/* SSN */}
                        <div>
                            <label className="block font-medium">S.S.</label>
                            <input
                                className="w-full border rounded px-2 py-1"
                                value={insuranceForm[insuranceSubTab].ssn ?? ""}
                                onChange={(e) =>
                                    setPolicyField(insuranceSubTab, "ssn", e.target.value)
                                }
                            />
                        </div>

                        {/* Address */}
                        <div className="md:col-span-2">
                            <label className="block font-medium">Subscriber Address</label>
                            <input
                                className="w-full border rounded px-2 py-1"
                                value={insuranceForm[insuranceSubTab].subscriberAddress ?? ""}
                                onChange={(e) =>
                                    setPolicyField(
                                        insuranceSubTab,
                                        "subscriberAddress",
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        {/* Copay */}
                        <div>
                            <label className="block font-medium">CoPay</label>
                            <input
                                className="w-full border rounded px-2 py-1"
                                value={insuranceForm[insuranceSubTab].copay ?? ""}
                                onChange={(e) =>
                                    setPolicyField(insuranceSubTab, "copay", e.target.value)
                                }
                            />
                        </div>

                        {/* Accept Assignment */}
                        <div>
                            <label className="block font-medium">Accept Assignment</label>
                            <select
                                className="w-full border rounded px-2 py-1"
                                value={insuranceForm[insuranceSubTab].acceptsAssignment ?? "Yes"}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                    setPolicyField(
                                        insuranceSubTab,
                                        "acceptsAssignment",
                                        e.target.value as InsurancePolicy["acceptsAssignment"]
                                    )
                                }
                            >
                                <option>Yes</option>
                                <option>No</option>
                            </select>
                        </div>

                        {/* Secondary Medicare Type */}
                        <div className="md:col-span-2">
                            <label className="block font-medium">Secondary Medicare Type</label>
                            <input
                                className="w-full border rounded px-2 py-1"
                                value={
                                    insuranceForm[insuranceSubTab].secondaryMedicareType ?? ""
                                }
                                onChange={(e) =>
                                    setPolicyField(
                                        insuranceSubTab,
                                        "secondaryMedicareType",
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 mt-2 md:col-span-2">
                            {/* APPLY */}
                            <button
                                type="button"
                                className="px-3 py-2 bg-blue-600 text-white rounded"
                                onClick={async () => {
                                    try {
                                        await saveInsurance();
                                        if (insuranceSubTab === "primary")
                                            setInsuranceSubTab("secondary");
                                        else if (insuranceSubTab === "secondary")
                                            setInsuranceSubTab("tertiary");
                                        else {
                                            setEditInsurance(false);
                                            setViewMode("dashboard");
                                            setHighlightedTab("dashboard");
                                        }
                                    } catch (err) {
                                        alert((err as Error).message);
                                    }
                                }}
                            >
                                {insuranceSubTab === "tertiary"
                                    ? "Apply & Finish"
                                    : "Apply & Next"}
                            </button>

                            {/* SAVE ALL & EXIT */}
                            <button
                                type="submit"
                                className="px-3 py-2 bg-emerald-600 text-white rounded"
                            >
                                Save All & Exit
                            </button>

                            {/* CANCEL */}
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