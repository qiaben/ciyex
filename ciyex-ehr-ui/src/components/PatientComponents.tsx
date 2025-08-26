"use client";
import React from "react";

// Define interfaces for component props
interface Appointment {
    id: string;
    date: string;
    provider: string;
    type: string;
    status: string;
}

interface Billing {
    patientBalanceDue?: number;
    insuranceBalanceDue?: number;
    totalBalanceDue?: number;
}

interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    route: string;
    status: string;
    instructions?: string;
}

interface Allergy {
    id: string;
    substance: string;
    reaction?: string;
}

interface Lab {
    testName: string;
    orderDate: string;
    result: string;
    referenceRange: string;
    status: string;
}

interface ReportFlatProps {
    useDateRange: boolean;
    setUseDateRange: (value: boolean) => void;
    startDate: string;
    setStartDate: (value: string) => void;
    endDate: string;
    setEndDate: (value: string) => void;
    reportFilters: string[];
    toggleFilter: (filter: string) => void;
    generateReport: (type: string, filters?: string[]) => void;
    downloadReport: (type: string, filters?: string[]) => void;
    lastVisitedTab: string;
    setActiveTab: (tab: string) => void;
}

// ---------------- APPOINTMENTS ----------------
export const AppointmentsFlat: React.FC<{
    filteredAppointments: Appointment[];
    searchTerm: string;
    setSearchTerm: (v: string) => void;
    formatDateTimeLocal: (d: string) => string;
}> = ({ filteredAppointments, searchTerm, setSearchTerm, formatDateTimeLocal }) => (
    <div className="space-y-4 text-sm">
        <div className="flex items-center gap-3">
            <input
                className="flex-1 rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200"
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm shadow">
                Schedule
            </button>
        </div>
        <div className="rounded-lg border border-gray-100 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-4 py-3 text-xs text-left font-medium text-gray-700">Date & Time</th>
                    <th className="px-4 py-3 text-xs text-left font-medium text-gray-700">Provider</th>
                    <th className="px-4 py-3 text-xs text-left font-medium text-gray-700">Type</th>
                    <th className="px-4 py-3 text-xs text-left font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-xs text-left font-medium text-gray-700">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appt) => (
                        <tr key={appt.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-xs whitespace-nowrap">
                                {formatDateTimeLocal(appt.date)}
                            </td>
                            <td className="px-4 py-3 text-xs">{appt.provider}</td>
                            <td className="px-4 py-3 text-xs">{appt.type}</td>
                            <td className="px-4 py-3 text-xs">
                  <span
                      className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                          appt.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : appt.status === "Scheduled"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                      }`}
                  >
                    {appt.status}
                  </span>
                            </td>
                            <td className="px-4 py-3 text-xs">
                                <button className="px-2 py-1 rounded border text-xs">View</button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-gray-400 text-sm">
                            {searchTerm ? "No matching appointments found" : "No appointments scheduled"}
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    </div>
);

// ---------------- BILLING ----------------
export const BillingFlat: React.FC<{ billing: Billing | null }> = ({ billing }) => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h4 className="font-semibold text-lg mb-4 text-gray-800"></h4>
        {billing ? (
            <div className="overflow-x-auto">
                <table className="w-full border text-sm">
                    <tbody>
                    <tr className="border-b">
                        <td className="px-3 py-2 font-medium text-gray-700">Patient Balance Due</td>
                        <td className="px-3 py-2 text-right text-gray-800">
                            {billing.patientBalanceDue?.toFixed(2) ?? "0.00"}
                        </td>
                    </tr>
                    <tr className="border-b">
                        <td className="px-3 py-2 font-medium text-gray-700">Insurance Balance Due</td>
                        <td className="px-3 py-2 text-right text-gray-800">
                            {billing.insuranceBalanceDue?.toFixed(2) ?? "0.00"}
                        </td>
                    </tr>
                    <tr>
                        <td className="px-3 py-2 font-semibold text-gray-900">Total Balance Due</td>
                        <td className="px-3 py-2 text-right font-semibold text-gray-900">
                            {billing.totalBalanceDue?.toFixed(2) ?? "0.00"}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="text-center py-8 text-gray-500">No billing records</div>
        )}
    </div>
);

// ---------------- MEDICATIONS ----------------
export const MedicationsFlat: React.FC<{
    medications: Medication[];
    setActiveTab: (tab: string) => void;
}> = ({ medications, setActiveTab }) => (
    <div className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-lg text-gray-800"></h4>
                <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg shadow-sm">
                    Prescribe New
                </button>
            </div>
            {medications?.length > 0 ? (
                <ul className="space-y-3">
                    {medications.map((med) => (
                        <li key={med.id} className="p-4 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h5 className="font-medium text-gray-800">
                                        {med.name} <span className="text-gray-600">{med.dosage}</span>
                                    </h5>
                                    <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                                        <span>{med.frequency}</span>
                                        <span>{med.route}</span>
                                        <span
                                            className={`px-2 py-1 rounded-full ${
                                                med.status === "Active"
                                                    ? "bg-green-100 text-green-800"
                                                    : med.status === "Inactive"
                                                        ? "bg-gray-100 text-gray-800"
                                                        : "bg-blue-100 text-blue-800"
                                            }`}
                                        >
                      {med.status}
                    </span>
                                    </div>
                                </div>
                            </div>
                            {med.instructions && (
                                <div className="mt-2 text-sm text-gray-600">{med.instructions}</div>
                            )}
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-8 text-gray-500">No current medications</div>
            )}
        </div>
        <div className="flex justify-end">
            <button
                className="px-4 py-2 bg-gray-400 text-white text-sm rounded-lg shadow-sm"
                onClick={() => setActiveTab("dashboard")}
            >
                Cancel
            </button>
        </div>
    </div>
);

// ---------------- ALLERGIES ----------------
export const AllergiesFlat: React.FC<{
    allergies: Allergy[];
    setActiveTab: (tab: string) => void;
}> = ({ allergies, setActiveTab }) => (
    <div className="space-y-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-lg text-gray-800"></h4>
                <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg shadow-sm">
                    Add Allergy
                </button>
            </div>
            {allergies?.length > 0 ? (
                <ul className="space-y-3">
                    {allergies.map((a) => (
                        <li key={a.id} className="p-4 rounded-lg border border-gray-200">
                            <h5 className="font-medium text-gray-800">{a.substance}</h5>
                            <div className="text-xs text-gray-500">Reaction: {a.reaction || "—"}</div>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center py-8 text-gray-500">No allergies recorded</div>
            )}
        </div>
        <div className="flex justify-end">
            <button className="px-4 py-2 bg-gray-400 text-white rounded" onClick={() => setActiveTab("dashboard")}>
                Cancel
            </button>
        </div>
    </div>
);

// ----------------- DOCUMENTS -----------------
export function DocumentsFlat({
                                  selectedDoc,
                                  setSelectedDoc,
                              }: {
    selectedDoc: string | null;
    setSelectedDoc: (doc: string) => void;
}) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0">
            {/* Left: Documents list */}
            <aside className="md:col-span-1 min-w-0">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-800 mb-2">Documents List</h4>
                    <ul className="space-y-1 text-sm max-h-80 md:max-h-[60vh] overflow-y-auto">
                        {[
                            "Advance Directive",
                            "CCD",
                            "CCDA",
                            "CCR",
                            "Eye Module",
                            "FHIR Export Document",
                            "Invoices",
                            "Lab Report",
                            "Medical Record",
                            "Onsite Portal",
                            "Patient Information",
                        ].map((doc) => (
                            <li
                                key={doc}
                                onClick={() => setSelectedDoc(doc)}
                                className={`flex items-center justify-between cursor-pointer px-2 py-1 rounded ${
                                    selectedDoc === doc ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                                }`}
                            >
                                <span className="truncate">{doc}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>

            {/* Right: Uploader / Viewer */}
            <section className="md:col-span-2 min-w-0">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-800 mb-3">Document Uploader/Viewer</h4>
                    {selectedDoc ? (
                        <div className="space-y-4">
                            <p className="text-gray-700 text-sm">
                                Currently viewing: <strong className="font-semibold">{selectedDoc}</strong>
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700">
                                        Source File Path
                                    </label>
                                    <input type="file" className="mt-1 w-full text-sm border rounded px-2 py-1" />
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700">
                                        Optional Destination / Study Name
                                    </label>
                                    <input
                                        type="text"
                                        className="mt-1 w-full text-sm border rounded px-2 py-1"
                                    />
                                </div>
                                <div className="col-span-1 flex items-center gap-2">
                                    <input id="encrypted" type="checkbox" className="rounded" />
                                    <label htmlFor="encrypted" className="text-sm">
                                        Is The File Encrypted?
                                    </label>
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700">
                                        Pass Phrase
                                    </label>
                                    <input
                                        type="password"
                                        className="mt-1 w-full text-sm border rounded px-2 py-1"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Supports AES-256-CBC encryption/decryption only.
                                    </p>
                                </div>
                                <div className="col-span-1 sm:col-span-2 flex flex-wrap items-center gap-3">
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">
                                        Upload
                                    </button>
                                    <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
                                        Fetch
                                    </button>
                                    <select className="border rounded text-sm px-2 py-1">
                                        <option>-- Select Template --</option>
                                    </select>
                                    <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">
                                        Open Patient Template
                                    </button>
                                    <button className="px-3 py-1 bg-gray-100 border rounded text-sm">
                                        or Open Module
                                    </button>
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <div className="border rounded-md text-gray-400 text-sm flex items-center justify-center min-h-32">
                                        Drop files here to upload
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm py-12 text-center">
                            Select a document from the list
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

/* ----------------- REPORT ----------------- */
export function ReportFlat({
                               useDateRange,
                               setUseDateRange,
                               startDate,
                               setStartDate,
                               endDate,
                               setEndDate,
                               reportFilters,
                               toggleFilter,
                               generateReport,
                               downloadReport,
                               lastVisitedTab,
                               setActiveTab,
                           }: ReportFlatProps) {
    return (
        <div className="space-y-6 p-4">
            {/* CCR */}
            <div className="border rounded p-4 bg-white shadow-sm">
                <h3 className="font-semibold text-lg mb-2">Continuity of Care Record (CCR)</h3>
                <label className="flex items-center space-x-2 mb-2">
                    <input
                        type="checkbox"
                        checked={useDateRange}
                        onChange={(e) => setUseDateRange(e.target.checked)}
                    />
                    <span>Use Date Range</span>
                </label>
                {useDateRange && (
                    <div className="flex gap-2 mb-2">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border rounded px-2 py-1"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border rounded px-2 py-1"
                        />
                    </div>
                )}
                <div className="space-x-2">
                    <button
                        onClick={() => generateReport("CCR")}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                        Generate Report
                    </button>
                    <button
                        onClick={() => downloadReport("CCR")}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                        Download
                    </button>
                </div>
            </div>

            {/* CCD */}
            <div className="border rounded p-4 bg-white shadow-sm">
                <h3 className="font-semibold text-lg mb-2">Continuity of Care Document (CCD)</h3>
                <div className="space-x-2">
                    <button
                        onClick={() => generateReport("CCD")}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                        Generate Report
                    </button>
                    <button
                        onClick={() => generateReport("CCD", ["new"])}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                        Generate New Report
                    </button>
                    <button
                        onClick={() => downloadReport("CCD")}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                        Download
                    </button>
                </div>
            </div>

            {/* Patient Report */}
            <div className="border rounded p-4 bg-white shadow-sm">
                <h3 className="font-semibold text-lg mb-2"></h3>
                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-4">
                    {[
                        "Demographics",
                        "History",
                        "Insurance",
                        "Billing",
                        "Immunizations",
                        "Notes",
                        "Transactions",
                        "Communications",
                    ].map((f) => (
                        <label key={f} className="flex items-center space-x-1">
                            <input
                                type="checkbox"
                                checked={reportFilters.includes(f)}
                                onChange={() => toggleFilter(f)}
                            />
                            <span>{f}</span>
                        </label>
                    ))}
                </div>
                <div className="space-x-2 mb-4">
                    <button
                        onClick={() => generateReport("Patient", reportFilters)}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                        Generate Report
                    </button>
                    <button
                        onClick={() => downloadReport("Patient", reportFilters)}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                        Download PDF
                    </button>
                </div>
                {/* Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 className="font-medium mb-2">Issues:</h4>
                        <ul className="list-disc ml-5 text-sm text-gray-700">
                            <li>No issues recorded</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium mb-2">Encounters & Forms:</h4>
                        <ul className="list-disc ml-5 text-sm text-gray-700">
                            <li>(2025-08-08) Please indicate visit...</li>
                            <li>(2025-07-29) Eye Exam</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-6">
                    <h4 className="font-medium mb-2">Procedures:</h4>
                    <table className="w-full border text-sm">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="border px-2 py-1 text-left">Procedure</th>
                            <th className="border px-2 py-1 text-left">Order Date</th>
                            <th className="border px-2 py-1 text-left">Encounter Date</th>
                            <th className="border px-2 py-1 text-left">Order Description</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td className="border px-2 py-1">—</td>
                            <td className="border px-2 py-1">—</td>
                            <td className="border px-2 py-1">—</td>
                            <td className="border px-2 py-1">—</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <div className="mt-6">
                    <h4 className="font-medium mb-2">Documents:</h4>
                    <button
                        onClick={() => generateReport("Documents")}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                        Generate Report
                    </button>
                    <button
                        onClick={() => downloadReport("Documents")}
                        className="px-3 py-1 bg-blue-600 text-white rounded ml-2"
                    >
                        Download PDF
                    </button>
                </div>
                <div className="mt-6">
                    <button
                        onClick={() => setActiveTab(lastVisitedTab)}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

// ---------------- LABS ----------------
export const LabsFlat: React.FC<{ labsData: Lab[] }> = ({ labsData }) => (
    <div className="bg-white rounded-lg border p-6">
        <h4 className="font-semibold text-lg mb-4"></h4>
        {!labsData?.length ? (
            <div className="text-center py-8 text-gray-500">No recent lab results</div>
        ) : (
            <table className="w-full border text-sm">
                <thead className="bg-gray-100">
                <tr>
                    <th className="border px-2 py-1">Test</th>
                    <th className="border px-2 py-1">Order Date</th>
                    <th className="border px-2 py-1">Result</th>
                    <th className="border px-2 py-1">Reference Range</th>
                    <th className="border px-2 py-1">Status</th>
                </tr>
                </thead>
                <tbody>
                {labsData.map((lab, i) => (
                    <tr key={i}>
                        <td className="border px-2 py-1">{lab.testName}</td>
                        <td className="border px-2 py-1">{lab.orderDate}</td>
                        <td className="border px-2 py-1">{lab.result}</td>
                        <td className="border px-2 py-1">{lab.referenceRange}</td>
                        <td className="border px-2 py-1">{lab.status}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        )}
    </div>
);