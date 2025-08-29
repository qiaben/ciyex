"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchWithAuth } from "@/utils/fetchWithAuth";
import AdminLayout from "@/app/(admin)/layout";

import Link from "next/link";
import DemographicsFlat from "@/components/DemographicsFlat";

import HistoryFlat from "@/components/HistoryFlat";
import InsuranceFlat from "@/components/InsuranceFlat";
import {
    AppointmentsFlat,
    BillingFlat,
    MedicationsFlat,
    ReportFlat,
    AllergiesFlat,
    DocumentsFlat,
    LabsFlat,
} from "@/components/PatientComponents";

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
    familyMembers?: string[];
    careTeam?: string[];
    // ✅ Allow safe extension (string keys can map to different primitive types)
    [key: string]: string | number | boolean | string[] | undefined;
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

interface EncounterFormData {
    visitCategory: string;
    encounterClass: string;
    encounterType: string;
    sensitivity: string;
    encounterProvider: string;
    referringProvider: string;
    facility: string;
    billingFacility: string;
    inCollection: string;
    dischargeDisposition: string;
    reasonForVisit: string;
    issues: string[];
}

interface Allergy {
    id: string;
    substance: string;
    reaction?: string;
    severity?: string;
    status: "Active" | "Inactive" | string;
    notes?: string;
}

interface HistoryForm {
    general: { riskFactors: string; examsTests: string };
    family: {
        father: string;
        mother: string;
        siblings: string;
        spouse: string;
        offspring: string;
        diagFather: string;
        diagMother: string;
        diagSiblings: string;
        diagSpouse: string;
        diagOffspring: string;
    };
    relatives: {
        cancer: string;
        diabetes: string;
        heartProblems: string;
        epilepsy: string;
        suicide: string;
        tuberculosis: string;
        hbp: string;
        stroke: string;
        mentalIllness: string;
    };
    lifestyle: {
        tobacco: string;
        coffee: string;
        alcohol: string;
        drugs: string;
        counseling: string;
        exercise: string;
        hazardous: string;
        sleep: string;
        seatbelt: string;
    };
    other: { nameValue: string; additionalHistory: string };
}

interface EncounterFormProps {
    onCancel: () => void | Promise<void>;
    onSave: () => void | Promise<void>;
}


interface Appointment {
    id: string;
    date: string;
    provider: string;
    type: string;
    status: "Scheduled" | "Completed" | "Cancelled";
    notes?: string;
}

interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    route: string;
    status: "Active" | "Inactive" | "Completed";
    instructions?: string;
}


interface XmlResponse {
    success?: boolean;
    data?: Record<string, string>;
    [key: string]: string | boolean | Record<string, string> | undefined;
}

function parseXmlResponse(xmlText: string): Promise<XmlResponse> {
    return new Promise((resolve, reject) => {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, "text/xml");
            const response: XmlResponse = {};
            Array.from(xmlDoc.documentElement.children).forEach((child) => {
                if (child.children.length > 0) {
                    if (child.nodeName === "data") {
                        response.data = {};
                        Array.from(child.children).forEach((dataChild) => {
                            response.data![dataChild.nodeName] = dataChild.textContent || "";
                        });
                    } else {
                        response[child.nodeName] = child.textContent || "";
                    }
                } else {
                    response[child.nodeName] = child.textContent || "";
                }
            });
            if ("success" in response && typeof response.success === "string") {
                response.success = response.success === "true";
            }

            resolve(response);
        } catch {
            reject(new Error("Failed to parse XML response"));
        }
    });
}

export default function PatientDashboardPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [historyForm, setHistoryForm] = useState<HistoryForm>({
        general: {riskFactors: "", examsTests: ""},
        family: {
            father: "",
            mother: "",
            siblings: "",
            spouse: "",
            offspring: "",
            diagFather: "",
            diagMother: "",
            diagSiblings: "",
            diagSpouse: "",
            diagOffspring: "",
        },
        relatives: {
            cancer: "",
            diabetes: "",
            heartProblems: "",
            epilepsy: "",
            suicide: "",
            tuberculosis: "",
            hbp: "",
            stroke: "",
            mentalIllness: "",
        },
        lifestyle: {
            tobacco: "",
            coffee: "",
            alcohol: "",
            drugs: "",
            counseling: "",
            exercise: "",
            hazardous: "",
            sleep: "",
            seatbelt: "",
        },
        other: {nameValue: "", additionalHistory: ""},
    });

    const [activeHistoryTab, setActiveHistoryTab] = useState<keyof HistoryForm>("general");
    const [editHistory, setEditHistory] = useState(false);
    const [lastVisitedTab, setLastVisitedTab] = useState("dashboard");
    const [billing, setBilling] = useState<{
        patientBalanceDue: number;
        insuranceBalanceDue: number;
        totalBalanceDue: number;
    } | null>(null);
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);
    const [allergies, setAllergies] = useState<Allergy[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<string>("dashboard");
    const [highlightedTab, setHighlightedTab] = useState<string>("dashboard");
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [showEncounterForm, setShowEncounterForm] = useState(false);
    const [encounterForm, setEncounterForm] = useState<EncounterFormData>({
        visitCategory: "",
        encounterClass: "Outpatient",
        encounterType: "",
        sensitivity: "Normal",
        encounterProvider: "",
        referringProvider: "",
        facility: "",
        billingFacility: "",
        inCollection: "No",
        dischargeDisposition: "",
        reasonForVisit: "",
        issues: [],
    });
    const [useDateRange, setUseDateRange] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [editInsurance, setEditInsurance] = useState(false);
    const [insuranceSubTab, setInsuranceSubTab] = useState<"primary" | "secondary" | "tertiary">("primary");
    const [editDemographics, setEditDemographics] = useState(false);
    const [demoForm, setDemoForm] = useState<Partial<Patient>>({});
    const emptyPolicy: InsurancePolicy = {
        acceptsAssignment: "Yes",
        subscriberSex: "Unassigned",
    };
    const [insuranceForm, setInsuranceForm] = useState<InsuranceForm>({
        primary: {...emptyPolicy, provider: patient?.insuranceProvider},
        secondary: {...emptyPolicy},
        tertiary: {...emptyPolicy},
    });

    const setPolicyField = <K extends keyof InsurancePolicy>(
        level: InsuranceLevel,
        field: K,
        value: InsurancePolicy[K]
    ) => {
        setInsuranceForm((prev) => ({
            ...prev,
            [level]: {
                ...prev[level],
                [field]: value,
            },
        }));
    };

    const [reportFilters, setReportFilters] = useState<string[]>([]);
    const toggleFilter = (filter: string) => {
        setReportFilters((prev) =>
            prev.includes(filter)
                ? prev.filter((f) => f !== filter)
                : [...prev, filter]
        );
    };

    const generateReport = async (type: string, filters?: string[]) => {
        try {
            const res = await fetchWithAuth(`/api/reports/generate?type=${type}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({filters}),
            });
            const data = await res.json();
            console.log("Report generated:", data);
        } catch (err) {
            console.error("Error generating report:", err);
        }
    };

    const downloadReport = async (type: string, filters?: string[]) => {
        try {
            const res = await fetchWithAuth(`/api/reports/download?type=${type}`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({filters}),
            });

            if (!res.ok) {
                throw new Error(`Failed to download report: ${res.status} ${res.statusText}`);
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${type}-report.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            console.error("Error downloading report:", message);
        }
    };

    const tabsHeaderRef = useRef<HTMLDivElement | null>(null);
    const mainContentRef = useRef<HTMLDivElement | null>(null);
    const [headerH, setHeaderH] = useState<number>(64);
    const tabContentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    const ignoreInitialIntersection = useRef<boolean>(true);

    useEffect(() => {
        const recompute = () => setHeaderH(tabsHeaderRef.current?.offsetHeight ?? 64);
        recompute();
        const ro = new ResizeObserver(recompute);
        if (tabsHeaderRef.current) ro.observe(tabsHeaderRef.current);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        const t = setTimeout(() => {
            ignoreInitialIntersection.current = false;
        }, 700);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const root = mainContentRef.current;
        if (!root) return;
        const onScroll = () => {
            if (ignoreInitialIntersection.current) ignoreInitialIntersection.current = false;
        };
        root.addEventListener("scroll", onScroll, {passive: true});
        return () => root.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const root = mainContentRef.current;
        if (!root) return;

        if (viewMode !== "dashboard") {
            return;
        }

        const sections = Object.entries(tabContentRefs.current)
            .map(([key, el]) => ({key, el}))
            .filter((s): s is { key: string; el: HTMLDivElement } => !!s.el);

        sections.forEach(({key, el}) => {
            (el as HTMLElement).dataset.tabkey = key;
        });

        const observer = new IntersectionObserver(
            (entries) => {
                if (ignoreInitialIntersection.current) return;
                const visible = entries.filter((e) => e.isIntersecting);
                if (visible.length === 0) return;
                const top = visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
                const key = (top.target as HTMLElement).dataset.tabkey!;
                if (key) setHighlightedTab(key);
            },
            {
                root,
                rootMargin: `-${headerH + 8}px 0px -45% 0px`,
                threshold: [0, 0.05, 0.2, 0.5, 0.75, 1],
            }
        );

        sections.forEach(({el}) => observer.observe(el));
        return () => observer.disconnect();
    }, [headerH, viewMode, patient, showEncounterForm]);

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                setLoading(true);
                const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${id}`);
                const text = await res.text();
                const data =
                    res.headers.get("content-type")?.includes("application/xml") || text.startsWith("<")
                        ? await parseXmlResponse(text)
                        : JSON.parse(text);

                if (!res.ok) throw new Error(data.message || `HTTP error! status: ${res.status}`);
                if (data.success) {
                    const fetched = data.data as Patient;
                    setPatient(fetched);
                    setDemoForm({...fetched});
                } else {
                    throw new Error(data.message || "Failed to fetch patient");
                }

                const fetchHistory = async () => {
                    try {
                        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${id}/history`);
                        const data = await res.json();
                        if (res.ok && data.success) {
                            setHistoryForm(data.data);
                        }
                    } catch (e) {
                        console.error("Failed to fetch history:", e);
                    }
                };

                const fetchBilling = async () => {
                    try {
                        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${id}/billing`);
                        const data = await res.json();
                        if (res.ok && data.success) {
                            setBilling(data.data);
                        }
                    } catch (e) {
                        console.error("Failed to fetch billing:", e);
                    }
                };

                const fetchAppointments = async () => {
                    try {
                        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${id}/appointments`);
                        const data = await res.json();
                        if (res.ok && data.success) setAppointments(data.data);
                    } catch (e) {
                        console.error("Failed to fetch appointments:", e);
                    }
                };

                const fetchMedications = async () => {
                    try {
                        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${id}/medications`);
                        const data = await res.json();
                        if (res.ok && data.success) setMedications(data.data);
                    } catch (e) {
                        console.error("Failed to fetch medications:", e);
                    }
                };

                const fetchAllergies = async () => {
                    try {
                        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${id}/allergies`);
                        const data = await res.json();
                        if (res.ok && data.success) setAllergies(data.data);
                    } catch (e) {
                        console.error("Failed to fetch allergies:", e);
                    }
                };

                await Promise.all([
                    fetchAppointments(),
                    fetchMedications(),
                    fetchAllergies(),
                    fetchHistory(),
                    fetchBilling(),
                ]);
            } catch (err: unknown) {
                console.error("Patient data fetch failed:", err);
                const message = err instanceof Error ? err.message : "An unknown error occurred";
                setError(message);
                if (message.includes("401")) router.push("/login");
            } finally {
                setLoading(false);
            }
        };

        if (id) void fetchPatientData(); // ✅ mark promise as intentionally unhandled
    }, [id, router]);

    async function saveDemographics() {
        if (!demoForm || !patient) return;
        const payload = {...patient, ...demoForm};
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patient.id}`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload),
        });

        const text = await res.text();
        const data =
            res.headers.get("content-type")?.includes("application/xml") || text.startsWith("<")
                ? await parseXmlResponse(text)
                : JSON.parse(text);

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to save demographics");
        }

        const updated: Patient = data.data ?? payload;
        setPatient(updated);
        setEditDemographics(false);
    }

    async function saveHistory() {
        if (!patient) return;
        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patient.id}/history`, {
            method: "PUT",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(historyForm),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.message || "Failed to save history");
        setEditHistory(false);
        setHistoryForm(data.data);
    }

    async function saveInsurance() {
        if (!patient) throw new Error("No patient loaded");

        const payload = {policies: insuranceForm};
        const res = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patient.id}/insurance`,
            {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(payload),
            }
        );

        const text = await res.text();
        const data =
            res.headers.get("content-type")?.includes("application/xml") || text.startsWith("<")
                ? await parseXmlResponse(text)
                : JSON.parse(text);

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to save insurance");
        }

        if (data.data?.policies) {
            setInsuranceForm(data.data.policies as InsuranceForm);
        }
    }

    async function saveEncounter() {
        if (!patient) throw new Error("No patient loaded");
        const res = await fetchWithAuth(
            `${process.env.NEXT_PUBLIC_API_URL}/api/patients/${patient.id}/encounters`,
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(encounterForm),
            }
        );
        const text = await res.text();
        const data =
            res.headers.get("content-type")?.includes("application/xml") || text.startsWith("<")
                ? await parseXmlResponse(text)
                : JSON.parse(text);

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to save encounter");
        }

        setShowEncounterForm(false);
        setEncounterForm({
            visitCategory: "",
            encounterClass: "Outpatient",
            encounterType: "",
            sensitivity: "Normal",
            encounterProvider: "",
            referringProvider: "",
            facility: "",
            billingFacility: "",
            inCollection: "No",
            dischargeDisposition: "",
            reasonForVisit: "",
            issues: [],
        });
    }

    const handleOpenEncounter = () => {
        setShowEncounterForm(true);
        setHighlightedTab("appointments");
        setViewMode("appointments");
    };

    const handleCloseEncounter = () => {
        setShowEncounterForm(false);
    };

    const onQuickAction = (key: string) => {
        setViewMode(key);
        setHighlightedTab(key);
    };

    const onTabClick = (key: string) => {
        if (key !== "report") {
            setLastVisitedTab(key);
        }
        setViewMode(key);
        setHighlightedTab(key);
        mainContentRef.current?.scrollTo({top: 0, behavior: "smooth"});
    };

    const formatDateLocal = (date: string) => {
        return date ? new Date(date).toLocaleDateString() : "—";
    };

    const calculateAgeLocal = (dob: string) => {
        if (!dob) return "—";
        const ageDifMs = Date.now() - new Date(dob).getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const formatDateTimeLocal = (date: string) => {
        return date ? new Date(date).toLocaleString() : "—";
    };

    const filteredAppointments = appointments.filter((appt) =>
        appt.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <AdminLayout>
                <div className="p-6 text-center">Loading patient data...</div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="p-6 text-center text-red-600">Error: {error}</div>
            </AdminLayout>
        );
    }

    if (!patient) {
        return (
            <AdminLayout>
                <div className="p-6 text-center">
                    <p>Patient not found</p>
                    <button
                        onClick={() => router.push("/patients")}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Back to Patients List
                    </button>
                </div>
            </AdminLayout>
        );
    }

    const patientTabs = [
        {key: "dashboard", label: "Dashboard"},

        {key: "demographics", label: "Demographics"},
        {key: "appointments", label: "Appointments"},
        {key: "insurance", label: "Insurance"},
        {key: "history", label: "History"},
        {key: "report", label: "Report"},
        {key: "allergies", label: "Allergies"},
        {key: "medications", label: "Medications"},
        {key: "labs", label: "Labs"},
        {key: "documents", label: "Documents"},
        {key: "messages", label: "Messages"},
        {key: "transactions", label: "Transactions"},
        {key: "issues", label: "Issues"},
        {key: "vitals", label: "Vitals"},
    ];

    const renderTabContent = (tabKey: string) => {
        switch (tabKey) {
            case "dashboard": {
                return (
                    <div className="space-y-6">
                        {/* Dashboard Card */}
                        {/* Two Column Grid: Recent Activity + Upcoming */}
                        <div className="grid md:grid-cols-2 gap-6 ">
                            {/* Recent Activity */}
                            <div className="pr-6">
                                <div className="bg-white rounded-md border border-gray-200 p-4">

                                <h5 className="text-sm font-semibold text-gray-800 mb-2">Recent Activity</h5>
                                    {appointments.length > 0 ? (
                                        <ul className="text-sm space-y-1 text-gray-600 list-disc pl-4">
                                            {appointments
                                                .filter((a) => a.status === "Completed")
                                                .slice(-3)
                                                .map((appt) => (
                                                    <li key={appt.id}>
                                                        {formatDateTimeLocal(appt.date)} — {appt.type}
                                                    </li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No recent activity</p>
                                    )}
                                    <button
                                        onClick={() => onTabClick("appointments")}
                                        className="mt-3 text-xs text-blue-600 hover:underline"
                                    >
                                        View full details →
                                    </button>
                                </div>
                            </div>

                            {/* Upcoming Appointments */}
                            <div className="pl-6">
                                <div className="bg-white rounded-md border border-gray-200 p-4">

                                <h5 className="text-sm font-semibold text-gray-800 mb-2">Upcoming</h5>
                                    {appointments.find((a) => a.status === "Scheduled") ? (
                                        <p className="text-sm text-gray-600">
                                            {formatDateTimeLocal(
                                                appointments.find((a) => a.status === "Scheduled")!.date
                                            )}{" "}
                                            — with {appointments.find((a) => a.status === "Scheduled")!.provider}
                                        </p>
                                    ) : (
                                        <p className="text-gray-500 text-sm">No upcoming appointments</p>
                                    )}
                                    <button
                                        onClick={() => onTabClick("appointments")}
                                        className="mt-3 text-xs text-blue-600 hover:underline"
                                    >
                                        View full details →
                                    </button>
                                </div>
                            </div>
                        </div>


                        {/* Demographics */}
                        <div
                            id="demographics"
                            ref={(el) => {
                                if (el) tabContentRefs.current["demographics"] = el
                            }}
                            data-tabkey="demographics"
                            style={{ scrollMarginTop: headerH + 12 }}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
                        >
                            <h4 className="text-sm font-semibold text-gray-800 mb-3">Demographics</h4>
                            <div className="grid md:grid-cols-2 gap-x-8 gap-y-1 text-sm text-gray-600">
                                <div>
                                    <div>
                                        <span className="font-medium">Name:</span> {patient.firstName}{" "}
                                        {patient.lastName}
                                    </div>
                                    <div>
                                        <span className="font-medium">Gender:</span> {patient.gender || "—"}
                                    </div>
                                    <div>
                                        <span className="font-medium">Address:</span>{" "}
                                        {patient.address || "—"}
                                    </div>
                                </div>
                                <div>
                                    <div>
                                        <span className="font-medium">DOB:</span>{" "}
                                        {formatDateLocal(patient.dateOfBirth)}
                                    </div>
                                    <div>
                                        <span className="font-medium">MRN:</span> {patient.mrn || "—"}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => onTabClick("demographics")}
                                className="mt-3 text-xs text-blue-600 hover:underline"
                            >
                                View full details →
                            </button>
                        </div>

                        {/* Appointments */}
                        <div
                            id="appointments"
                            ref={(el) => {
                                if (el) tabContentRefs.current["appointments"] = el
                            }}
                            data-tabkey="appointments"
                            style={{ scrollMarginTop: headerH + 12 }}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
                        >
                            <h4 className="text-sm font-semibold text-gray-800 mb-3">Appointments</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search appointments..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
                                    />
                                    <button
                                        onClick={() => onTabClick("appointments")}
                                        className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                                    >
                                        Schedule
                                    </button>
                                </div>
                                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                                    <table className="min-w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-700 font-semibold">
                                        <tr>
                                            <th className="px-4 py-2 text-left">Date</th>
                                            <th className="px-4 py-2 text-left">Provider</th>
                                            <th className="px-4 py-2 text-left">Type</th>
                                            <th className="px-4 py-2 text-left">Status</th>
                                            <th className="px-4 py-2 text-left">Action</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {filteredAppointments.length > 0 ? (
                                            filteredAppointments.slice(0, 2).map((appt) => (
                                                <tr key={appt.id} className="border-t">
                                                    <td className="px-4 py-2">{formatDateLocal(appt.date)}</td>
                                                    <td className="px-4 py-2">{appt.provider}</td>
                                                    <td className="px-4 py-2">{appt.type}</td>
                                                    <td className="px-4 py-2">
                        <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                                appt.status === "Scheduled"
                                    ? "bg-blue-100 text-blue-700"
                                    : appt.status === "Completed"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-600"
                            }`}
                        >
                          {appt.status}
                        </span>
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <button
                                                            onClick={() => onTabClick("appointments")}
                                                            className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
                                                        >
                                                            Encounter
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={5}
                                                    className="px-4 py-6 text-center text-gray-400"
                                                >
                                                    No appointments scheduled
                                                </td>
                                            </tr>
                                        )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <button
                                onClick={() => onTabClick("appointments")}
                                className="mt-3 text-xs text-blue-600 hover:underline"
                            >
                                View full details →
                            </button>
                        </div>

                        {/* Insurance */}
                        <div
                            id="insurance"
                            ref={(el) => {
                                if (el) tabContentRefs.current["insurance"] = el
                            }}
                            data-tabkey="insurance"
                            style={{ scrollMarginTop: headerH + 12 }}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
                        >
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Insurance</h4>
                            <p className="text-sm text-gray-600">
                                {patient.insuranceProvider || "No insurance data"}
                            </p>
                            <button
                                onClick={() => onTabClick("insurance")}
                                className="mt-3 text-xs text-blue-600 hover:underline"
                            >
                                View full details →
                            </button>
                        </div>

                        {/* History */}
                        <div
                            id="history"
                            ref={(el) => {
                                if (el) tabContentRefs.current["history"] = el
                            }}
                            data-tabkey="history"
                            style={{ scrollMarginTop: headerH + 12 }}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
                        >
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">History</h4>
                            <p className="text-sm text-gray-500">
                                Family history and lifestyle details
                            </p>
                            <button
                                onClick={() => onTabClick("history")}
                                className="mt-3 text-xs text-blue-600 hover:underline"
                            >
                                View full details →
                            </button>
                        </div>

                        {/* Report */}
                        <div
                            id="report"
                            ref={(el) => {
                                if (el) tabContentRefs.current["report"] = el
                            }}
                            data-tabkey="report"
                            style={{ scrollMarginTop: headerH + 12 }}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
                        >
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Report</h4>
                            <p className="text-sm text-gray-500">Generate clinical reports</p>
                            <button
                                onClick={() => onTabClick("report")}
                                className="mt-3 text-xs text-blue-600 hover:underline"
                            >
                                View full details →
                            </button>
                        </div>

                        {/* Allergies */}
                        <div
                            id="allergies"
                            ref={(el) => {
                                if (el) tabContentRefs.current["allergies"] = el
                            }}
                            data-tabkey="allergies"
                            style={{ scrollMarginTop: headerH + 12 }}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
                        >
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Allergies</h4>
                            {allergies.length > 0 ? (
                                <ul className="text-sm text-gray-600 list-disc pl-4">
                                    {allergies.slice(0, 2).map((a) => (
                                        <li key={a.id}>{a.substance}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">No allergies</p>
                            )}
                            <button
                                onClick={() => onTabClick("allergies")}
                                className="mt-3 text-xs text-blue-600 hover:underline"
                            >
                                View full details →
                            </button>
                        </div>

                        {/* Medications */}
                        <div
                            id="medications"
                            ref={(el) => {
                                if (el) tabContentRefs.current["medications"] = el
                            }}
                            data-tabkey="medications"
                            style={{ scrollMarginTop: headerH + 12 }}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
                        >
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Medications</h4>
                            {medications.length > 0 ? (
                                <ul className="text-sm text-gray-600 list-disc pl-4">
                                    {medications.slice(0, 2).map((m) => (
                                        <li key={m.id}>
                                            {m.name} {m.dosage}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">No medications</p>
                            )}
                            <button
                                onClick={() => onTabClick("medications")}
                                className="mt-3 text-xs text-blue-600 hover:underline"
                            >
                                View full details →
                            </button>
                        </div>

                        {/* Labs */}
                        <div
                            id="labs"
                            ref={(el) => {
                                if (el) tabContentRefs.current["labs"] = el
                            }}
                            data-tabkey="labs"
                            style={{ scrollMarginTop: headerH + 12 }}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
                        >
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Labs</h4>
                            <p className="text-sm text-gray-500">View recent lab results</p>
                            <button
                                onClick={() => onTabClick("labs")}
                                className="mt-3 text-xs text-blue-600 hover:underline"
                            >
                                View full details →
                            </button>
                        </div>

                        {/* Documents */}
                        <div
                            id="documents"
                            ref={(el) => {
                                if (el) tabContentRefs.current["documents"] = el
                            }}
                            data-tabkey="documents"
                            style={{ scrollMarginTop: headerH + 12 }}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
                        >
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Documents</h4>
                            {selectedDoc ? (
                                <p className="text-sm text-gray-600">Last opened: {selectedDoc}</p>
                            ) : (
                                <p className="text-sm text-gray-500">No documents</p>
                            )}
                            <button
                                onClick={() => onTabClick("documents")}
                                className="mt-3 text-xs text-blue-600 hover:underline"
                            >
                                View full details →
                            </button>
                        </div>

                        {/* Messages */}
                        <div
                            id="messages"
                            ref={(el) => {
                                if (el) tabContentRefs.current["messages"] = el
                            }}
                            data-tabkey="messages"
                            style={{ scrollMarginTop: headerH + 12 }}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
                        >
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Messages</h4>
                            <p className="text-sm text-gray-500">Patient communications</p>
                            <button
                                onClick={() => onTabClick("messages")}
                                className="mt-3 text-xs text-blue-600 hover:underline"
                            >
                                View full details →
                            </button>
                        </div>

                        {/* Transactions */}
                        <div
                            id="transactions"
                            ref={(el) => {
                                if (el) tabContentRefs.current["transactions"] = el
                            }}
                            data-tabkey="transactions"
                            style={{ scrollMarginTop: headerH + 12 }}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
                        >
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Transactions</h4>
                            {billing ? (
                                <p className="text-sm text-gray-600">
                                    Balance: ${billing.totalBalanceDue}
                                </p>
                            ) : (
                                <p className="text-sm text-gray-500">No billing data</p>
                            )}
                            <button
                                onClick={() => onTabClick("transactions")}
                                className="mt-3 text-xs text-blue-600 hover:underline"
                            >
                                View full details →
                            </button>
                        </div>

                        {/* Issues */}
                        <div
                            id="issues"
                            ref={(el) => {
                                if (el) tabContentRefs.current["issues"] = el
                            }}
                            data-tabkey="issues"
                            style={{ scrollMarginTop: headerH + 12 }}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
                        >
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Issues</h4>
                            <p className="text-sm text-gray-500">No issues recorded</p>
                            <button
                                onClick={() => onTabClick("issues")}
                                className="mt-3 text-xs text-blue-600 hover:underline"
                            >
                                View full details →
                            </button>
                        </div>

                        {/* Vitals */}
                        <div
                            id="vitals"
                            ref={(el) => {
                                if (el) tabContentRefs.current["vitals"] = el
                            }}
                            data-tabkey="vitals"
                            style={{ scrollMarginTop: headerH + 12 }}
                            className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
                        >
                            <h4 className="text-sm font-semibold text-gray-800 mb-2">Vitals</h4>
                            <p className="text-sm text-gray-500">No vitals recorded</p>
                            <button
                                onClick={() => onTabClick("vitals")}
                                className="mt-3 text-xs text-blue-600 hover:underline"
                            >
                                View full details →
                            </button>
                        </div>
                    </div>
                )
            }


            case "history":
                return (
                    <HistoryFlat
                        historyForm={historyForm}
                        setHistoryForm={setHistoryForm}
                        editHistory={editHistory}
                        setEditHistory={setEditHistory}
                        activeHistoryTab={activeHistoryTab}
                        setActiveHistoryTab={setActiveHistoryTab}
                        saveHistory={saveHistory}
                    />
                );
            case "insurance":
                return (
                    <InsuranceFlat
                        patient={patient}
                        insuranceForm={insuranceForm}
                        setInsuranceForm={setInsuranceForm}
                        editInsurance={editInsurance}
                        setEditInsurance={setEditInsurance}
                        insuranceSubTab={insuranceSubTab}
                        setInsuranceSubTab={setInsuranceSubTab}
                        saveInsurance={saveInsurance}
                        setPolicyField={setPolicyField}
                        setViewMode={setViewMode}
                        setHighlightedTab={setHighlightedTab}
                    />
                );
            case "appointments":
                return (
                    <AppointmentsFlat
                        filteredAppointments={filteredAppointments}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        formatDateTimeLocal={formatDateTimeLocal}
                    />
                );
            case "billing":
                return <BillingFlat billing={billing}/>;
            case "medications":
                return (
                    <MedicationsFlat
                        medications={medications}
                        setActiveTab={setViewMode}
                    />
                );
            case "report":
                return (
                    <ReportFlat
                        useDateRange={useDateRange}
                        setUseDateRange={setUseDateRange}
                        startDate={startDate}
                        setStartDate={setStartDate}
                        endDate={endDate}
                        setEndDate={setEndDate}
                        generateReport={generateReport}
                        downloadReport={downloadReport}
                        reportFilters={reportFilters}
                        toggleFilter={toggleFilter}
                        lastVisitedTab={lastVisitedTab}
                        setActiveTab={setViewMode}
                    />
                );
            case "allergies":
                return (
                    <AllergiesFlat
                        allergies={allergies}
                        setActiveTab={setViewMode}
                    />
                );
            case "demographics":
                return (
                    <DemographicsFlat
                        patient={patient}
                        demoForm={demoForm}
                        setDemoForm={setDemoForm}
                        editDemographics={editDemographics}
                        setEditDemographics={setEditDemographics}
                        saveDemographics={saveDemographics}
                        calculateAgeLocal={calculateAgeLocal}
                    />
                );





            case "documents":
                return (
                    <DocumentsFlat
                        selectedDoc={selectedDoc}
                        setSelectedDoc={setSelectedDoc}
                    />
                );
            case "labs":
                return <LabsFlat labsData={[]}/>;
            default:
                return (
                    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                        <div className="text-center py-8">
                            <div
                                className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3"
                            >
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    ></path>
                                </svg>
                            </div>
                            <h5 className="text-gray-700 font-medium">No data available</h5>
                            <p className="text-gray-500 text-sm mt-1">This section is currently empty</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <AdminLayout>
            <style jsx global>{`
                html,
                body {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    overflow-y: auto;
                    overflow-x: hidden;
                }
            `}</style>
            <style jsx>{`
                .pageScroll {
                    min-height: 100vh;
                    width: 100%;
                    overflow-y: auto;
                    overflow-x: hidden;
                    -webkit-overflow-scrolling: touch;
                }

                .patientSummary *,
                .quickActions * {
                    overflow: visible !important;
                    height: auto !important;
                    max-height: none !important;
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }

                .hide-scrollbar {
                    -ms-overflow-style: none; /* IE & Edge */
                    scrollbar-width: none; /* Firefox */
                }

                .hide-scrollbar::-webkit-scrollbar {
                    display: none; /* Chrome, Safari, Opera */
                }

                .patientSummary *::-webkit-scrollbar,
                .quickActions *::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            {/* Light gray page background */}
            <div className="pageScroll bg-gray-50">
                <div
                    ref={tabsHeaderRef}
                    className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur px-3 py-1.5"
                >
                    <div className="flex items-center justify-between gap-3 min-w-0">
                        <div className="flex items-center gap-3 min-w-0">
                            <Link
                                href="/patients"
                                className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 border border-gray-300 text-xs font-medium text-gray-700 flex items-center"
                            >
                                <svg
                                    className="w-3 h-3 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                                Patients
                            </Link>
                            <div className="flex items-center min-w-0">
              <span className="text-xs text-gray-500 mr-1 shrink-0">
                Patient:
              </span>
                                <div
                                    className="px-2 py-0.5 rounded bg-blue-50 text-xs font-medium text-blue-800 truncate">
                                    {patient.firstName} {patient.lastName}
                                </div>
                                {patient.mrn && (
                                    <div
                                        className="ml-2 px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-600 shrink-0">
                                        MRN: {patient.mrn}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                className="h-8 px-3 rounded bg-blue-600 hover:bg-blue-700 text-xs font-medium text-white shadow-sm inline-flex items-center"
                                onClick={handleOpenEncounter}
                            >
                                <svg
                                    className="w-3 h-3 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                    />
                                </svg>
                                New Encounter
                            </button>
                        </div>
                    </div>
                    <div className="mt-1.5">
                        <div className="flex flex-wrap gap-2">
                            {patientTabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    className={`h-8 inline-flex items-center px-3 rounded-md text-xs font-medium whitespace-nowrap leading-none transition-colors ${
                                        highlightedTab === tab.key
                                            ? "bg-blue-600 text-white shadow"
                                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                    }`}
                                    onClick={() => onTabClick(tab.key)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-screen-2xl mx-auto p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,17fr)_minmax(0,3fr)] gap-4">
                        <main
                            ref={mainContentRef}
                            className="min-w-0 overflow-y-auto hide-scrollbar"
                            style={{height: `calc(100vh - ${headerH}px)`}}
                        >
                            {showEncounterForm ? (
                                <main className="flex-1 p-6 overflow-auto">
                                    <EncounterForm
                                        onCancel={handleCloseEncounter}
                                        onSave={saveEncounter}
                                    />
                                </main>
                            ) : (
                                <>
                                    {viewMode === "dashboard" ? (
                                        <div
                                            id="dashboard"
                                            ref={(el) => void (tabContentRefs.current.dashboard = el)}
                                            style={{scrollMarginTop: headerH + 12}}
                                        >
                                            <h2 className="text-lg font-semibold mb-3"></h2>
                                            <div className="min-w-0">
                                                {renderTabContent("dashboard")}
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            id={viewMode}
                                            ref={(el) => {
                                                tabContentRefs.current[viewMode] = el;
                                            }}
                                            style={{scrollMarginTop: headerH + 12}}
                                            className="min-w-0"
                                        >
                                            <div className="min-w-0">
                                                {renderTabContent(viewMode)}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </main>

                        <aside className="min-w-0 hide-scrollbar overflow-y-auto">
                            <div
                                style={{
                                    position: "sticky",
                                    top: headerH + 12,
                                    height: `calc(100vh - ${headerH + 24}px)`,
                                }}
                                className="flex flex-col gap-4"
                            >
                                <div
                                    className="flex-[0_0_30%] bg-gradient-to-br from-indigo-50 to-white rounded-2xl shadow-md p-4 flex flex-col">
                                    <h3 className="text-sm font-semibold text-gray-800 mb-2 tracking-wide">
                                        Patient Summary
                                    </h3>
                                    <div className="space-y-1 text-sm flex-1">
                                        <div className="font-semibold text-lg text-gray-900 truncate">
                                            {patient.firstName} {patient.lastName}
                                        </div>
                                        <div className="text-gray-500">
                                            {formatDateLocal(patient.dateOfBirth)} · Age{" "}
                                            {calculateAgeLocal(patient.dateOfBirth)}
                                        </div>
                                        <div className="text-gray-700">
                                            {patient.phoneNumber || "—"}
                                        </div>
                                        <div className="text-gray-400 text-xs italic">
                                            {appointments.length > 0
                                                ? `Last visit: ${formatDateLocal(
                                                    appointments[appointments.length - 1].date
                                                )}`
                                                : "No visits recorded"}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-[0_0_25%] bg-white rounded-2xl shadow-md p-4 flex flex-col">
                                    <h3 className="text-sm font-semibold text-gray-800 mb-2 tracking-wide">
                                        Quick Actions
                                    </h3>
                                    <div className="grid grid-cols-1 gap-2 flex-1">
                                        {[
                                            {key: "appointments", label: "Appointments", color: "blue"},
                                            {key: "billing", label: "Billing", color: "yellow"},
                                            {key: "demographics", label: "Demographics", color: "purple"},
                                            {key: "messages", label: "Messages", color: "green"},
                                        ].map(({key, label, color}) => {
                                            const colors: Record<
                                                string,
                                                { active: string; inactive: string }
                                            > = {
                                                blue: {
                                                    active: "bg-blue-600 text-white",
                                                    inactive:
                                                        "bg-blue-50 text-blue-700 hover:bg-blue-100",
                                                },
                                                yellow: {
                                                    active: "bg-yellow-500 text-white",
                                                    inactive:
                                                        "bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
                                                },
                                                purple: {
                                                    active: "bg-purple-600 text-white",
                                                    inactive:
                                                        "bg-purple-50 text-purple-700 hover:bg-purple-100",
                                                },
                                                green: {
                                                    active: "bg-green-600 text-white",
                                                    inactive:
                                                        "bg-green-50 text-green-700 hover:bg-green-100",
                                                },
                                            };
                                            const base =
                                                "w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shadow-sm";
                                            const isActive = highlightedTab === key;
                                            return (
                                                <button
                                                    key={key}
                                                    onClick={() => onQuickAction(key)}
                                                    className={`${base} ${
                                                        isActive
                                                            ? colors[color].active
                                                            : colors[color].inactive
                                                    }`}
                                                >
                                                    {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function EncounterForm({ onCancel, onSave }: EncounterFormProps) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">New Encounter</h2>
            {/* Form fields here */}
            <div className="flex justify-end gap-2 mt-6">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                    Cancel
                </button>
                <button onClick={onSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Save
                </button>
            </div>
        </div>
    );
}