"use client";
import { Input } from "@/components/ui/input";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import { useEffect, useState } from "react";

export type InsuranceLevel = "primary" | "secondary" | "tertiary";

export interface InsuranceCompany {
    id: number;
    name: string;
    payerId?: string;
    status: "ACTIVE" | "ARCHIVED";
}

export interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    [key: string]: string | number | boolean | string[] | undefined;
}

export interface InsurancePolicy {
    providerId: number | null;
    planName: string;
    effectiveDate: string;
    effectiveDateEnd: string;
    policyNumber: string;
    groupNumber: string;

    subscriberEmployer: string;
    seAddress1: string;
    seAddress2: string;
    seCity: string;
    seState: string;
    seZip: string;
    seCountry: string;

    relationship: string;
    subscriberFirstName: string;
    subscriberMiddleName: string;
    subscriberLastName: string;
    subscriberDob: string;
    sex: "Male" | "Female" | "Other" | "";
    ssn: string;
    subAddress1: string;
    subAddress2: string;
    subCity: string;
    subState: string;
    subZip: string;
    subCountry: string;
    subscriberPhone: string;

    copay: string;
    acceptAssignment: "YES" | "NO";
    secondaryMedicareType: "N/A" | "Part A" | "Part B";
}

export type InsuranceForm = Record<InsuranceLevel, InsurancePolicy>;

export const initialPolicy: InsurancePolicy = {
    providerId: null,
    planName: "",
    effectiveDate: "",
    effectiveDateEnd: "",
    policyNumber: "",
    groupNumber: "",

    subscriberEmployer: "",
    seAddress1: "",
    seAddress2: "",
    seCity: "",
    seState: "",
    seZip: "",
    seCountry: "",

    relationship: "",
    subscriberFirstName: "",
    subscriberMiddleName: "",
    subscriberLastName: "",
    subscriberDob: "",
    sex: "",
    ssn: "",
    subAddress1: "",
    subAddress2: "",
    subCity: "",
    subState: "",
    subZip: "",
    subCountry: "",
    subscriberPhone: "",

    copay: "",
    acceptAssignment: "YES",
    secondaryMedicareType: "N/A",
};

interface InsuranceFlatProps {
    patient: Patient;
    insuranceForm: InsuranceForm;
    setInsuranceForm: React.Dispatch<React.SetStateAction<InsuranceForm>>;
    editInsurance: boolean;
    setEditInsurance: (v: boolean) => void;
    insuranceSubTab: InsuranceLevel;
    setInsuranceSubTab: (tab: InsuranceLevel) => void;
    setPolicyField: (
        level: InsuranceLevel,
        field: keyof InsurancePolicy,
        value: InsurancePolicy[keyof InsurancePolicy]
    ) => void;
    setViewMode: (mode: string) => void;
    setHighlightedTab: (tab: string) => void;
}

export default function InsuranceFlat({

                                          insuranceForm,
                                          setInsuranceForm,
                                          editInsurance,
                                          setEditInsurance,
                                          insuranceSubTab,
                                          setInsuranceSubTab,
                                          setPolicyField,
                                          setViewMode,
                                          setHighlightedTab,
                                      }: InsuranceFlatProps) {
    const [companies, setCompanies] = useState<InsuranceCompany[]>([]);

    useEffect(() => {
        const loadCompanies = async () => {
            try {
                const res = await fetchWithAuth(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/insurance-companies`
                );
                const data = await res.json();
                setCompanies(data.data ?? data);
            } catch (err) {
                console.error("Error loading companies:", err);
            }
        };
        loadCompanies();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        level: InsuranceLevel
    ) => {
        setInsuranceForm((prev) => ({
            ...prev,
            [level]: { ...prev[level], [e.target.name]: e.target.value },
        }));
    };

    const handleSave = (level: InsuranceLevel) => {
        if (!insuranceForm[level].providerId) {
            alert("Provider is required.");
            return;
        }
        console.log(`Saved ${level}`, insuranceForm[level]);

        if (level === "primary") setInsuranceSubTab("secondary");
        else if (level === "secondary") setInsuranceSubTab("tertiary");
        else {
            setEditInsurance(false);
            setInsuranceSubTab("primary");
            setViewMode("dashboard");
            setHighlightedTab("insurance");
        }
    };

    const renderForm = (level: InsuranceLevel) => {
        const policy = insuranceForm[level];
        return (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSave(level);
                }}
                className="bg-white shadow rounded-xl p-6 space-y-6"
            >
                <h2 className="text-lg font-semibold capitalize">{level} Insurance</h2>

                {/* Policy Info */}
                <fieldset>
                    <legend className="font-semibold text-gray-700">Policy Information</legend>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                            <label className="text-sm font-medium">Provider *</label>
                            <select
                                name="providerId"
                                value={policy.providerId ?? ""}
                                onChange={(e) =>
                                    setPolicyField(
                                        level,
                                        "providerId",
                                        e.target.value ? Number(e.target.value) : null
                                    )
                                }
                                required
                                className="w-full rounded border-gray-300 shadow-sm"
                            >
                                <option value="">Select Provider</option>
                                {companies
                                    .filter((c) => c.status === "ACTIVE")
                                    .map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                            </select>
                        </div>
                        <Input name="planName" placeholder="Plan Name" value={policy.planName} onChange={(e) => handleChange(e, level)} />
                        <Input type="date" name="effectiveDate" value={policy.effectiveDate} onChange={(e) => handleChange(e, level)} />
                        <Input type="date" name="effectiveDateEnd" value={policy.effectiveDateEnd} onChange={(e) => handleChange(e, level)} />
                        <Input name="policyNumber" placeholder="Policy Number" value={policy.policyNumber} onChange={(e) => handleChange(e, level)} />
                        <Input name="groupNumber" placeholder="Group Number" value={policy.groupNumber} onChange={(e) => handleChange(e, level)} />
                    </div>
                </fieldset>

                {/* Employer Info */}
                <fieldset>
                    <legend className="font-semibold text-gray-700">Subscriber Employer Info</legend>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <Input name="subscriberEmployer" placeholder="Employer" value={policy.subscriberEmployer} onChange={(e) => handleChange(e, level)} />
                        <Input name="seAddress1" placeholder="SE Address 1" value={policy.seAddress1} onChange={(e) => handleChange(e, level)} />
                        <Input name="seAddress2" placeholder="SE Address 2" value={policy.seAddress2} onChange={(e) => handleChange(e, level)} />
                        <Input name="seCity" placeholder="City" value={policy.seCity} onChange={(e) => handleChange(e, level)} />
                        <Input name="seState" placeholder="State" value={policy.seState} onChange={(e) => handleChange(e, level)} />
                        <Input name="seZip" placeholder="Zip" value={policy.seZip} onChange={(e) => handleChange(e, level)} />
                        <Input name="seCountry" placeholder="Country" value={policy.seCountry} onChange={(e) => handleChange(e, level)} />
                    </div>
                </fieldset>

                {/* Subscriber Info */}
                <fieldset>
                    <legend className="font-semibold text-gray-700">Subscriber Info</legend>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                        <Input name="subscriberFirstName" placeholder="First Name" value={policy.subscriberFirstName} onChange={(e) => handleChange(e, level)} />
                        <Input name="subscriberMiddleName" placeholder="Middle Name" value={policy.subscriberMiddleName} onChange={(e) => handleChange(e, level)} />
                        <Input name="subscriberLastName" placeholder="Last Name" value={policy.subscriberLastName} onChange={(e) => handleChange(e, level)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <Input type="date" name="subscriberDob" value={policy.subscriberDob} onChange={(e) => handleChange(e, level)} />
                        <select name="sex" value={policy.sex} onChange={(e) => handleChange(e, level)} className="rounded border-gray-300 shadow-sm">
                            <option value="">Sex</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <Input name="ssn" placeholder="SSN" value={policy.ssn} onChange={(e) => handleChange(e, level)} />
                    <Input name="subscriberPhone" placeholder="Phone" value={policy.subscriberPhone} onChange={(e) => handleChange(e, level)} />
                    <Input name="subAddress1" placeholder="Address 1" value={policy.subAddress1} onChange={(e) => handleChange(e, level)} />
                    <Input name="subAddress2" placeholder="Address 2" value={policy.subAddress2} onChange={(e) => handleChange(e, level)} />
                    <Input name="subCity" placeholder="City" value={policy.subCity} onChange={(e) => handleChange(e, level)} />
                    <Input name="subState" placeholder="State" value={policy.subState} onChange={(e) => handleChange(e, level)} />
                    <Input name="subZip" placeholder="Zip" value={policy.subZip} onChange={(e) => handleChange(e, level)} />
                    <Input name="subCountry" placeholder="Country" value={policy.subCountry} onChange={(e) => handleChange(e, level)} />
                </fieldset>

                {/* Policy Options */}
                <fieldset>
                    <legend className="font-semibold text-gray-700">Policy Options</legend>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                        <Input name="copay" placeholder="Copay" value={policy.copay} onChange={(e) => handleChange(e, level)} />
                        <select name="acceptAssignment" value={policy.acceptAssignment} onChange={(e) => handleChange(e, level)} className="rounded border-gray-300 shadow-sm">
                            <option value="YES">YES</option>
                            <option value="NO">NO</option>
                        </select>
                        <select name="secondaryMedicareType" value={policy.secondaryMedicareType} onChange={(e) => handleChange(e, level)} className="rounded border-gray-300 shadow-sm">
                            <option value="N/A">N/A</option>
                            <option value="Part A">Part A</option>
                            <option value="Part B">Part B</option>
                        </select>
                    </div>
                </fieldset>

                <div className="flex justify-end">
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-md">
                        Save {level} Policy
                    </button>
                </div>
            </form>
        );
    };

    const renderSummary = () => {
        const p = insuranceForm.primary;
        return (
            <div className="bg-white border rounded-lg shadow-sm p-6">
                <div className="flex justify-between mb-4">
                    <h4 className="text-lg font-semibold">Insurance</h4>
                    <button
                        onClick={() => {
                            setEditInsurance(true);
                            setInsuranceSubTab("primary");
                        }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
                    >
                        Edit
                    </button>
                </div>
                <div className="bg-gray-50 rounded p-4 text-sm space-y-2">
                    <p>
                        <strong>Insurer:</strong>{" "}
                        {companies.find((c) => c.id === p.providerId)?.name || "Self-Pay"}
                    </p>
                    <p><strong>Plan:</strong> {p.planName || "—"}</p>
                    <p><strong>Policy #:</strong> {p.policyNumber || "—"}</p>
                    <p><strong>Group #:</strong> {p.groupNumber || "—"}</p>
                    <p><strong>Copay:</strong> {p.copay || "—"}</p>
                    <p><strong>Assignment:</strong> {p.acceptAssignment}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            {editInsurance ? renderForm(insuranceSubTab) : renderSummary()}
        </div>
    );
}
