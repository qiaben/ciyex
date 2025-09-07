// "use client";
//
// import { useParams, useRouter } from "next/navigation";
// import Link from "next/link";
//
// // Encounter sections (adjust paths if needed)
// import ChiefComplaintList from "@/components/encounter/cc/ChiefComplaintList";
//
//
// // Optional: your admin layout wrapper if you use it globally
// import AdminLayout from "@/app/(admin)/layout";
// import HPIList from "@/components/encounter/hpi/HPIList";
// import PMHList from "@/components/encounter/pmh/PMHList";
// import FHList from "@/components/encounter/familyhistory/FHList";
// import PEList from "@/components/encounter/physicalexam/PEList";
// import ROSList from "@/components/encounter/ros/ROSList";
// import ProcedureList from "@/components/encounter/procedure/ProcedureList";
// import CodeList from "@/components/encounter/coding/CodeList";
// import PlanList from "@/components/encounter/plan/PlanList";
// import ProviderNoteList from "@/components/encounter/providernote/ProviderNoteList";
// import ProviderSignatureCard from "@/components/encounter/providersignature/ProviderSignatureCard";
// import SignoffCard from "@/components/encounter/signoff/SignoffCard";
// import FeeScheduleCard from "@/components/encounter/fees/FeeScheduleCard";
//
// export default function EncounterTabsPage() {
//     const params = useParams();
//     const router = useRouter();
//
//     const patientId = Number(params?.id);
//     const encounterId = Number(params?.encounterId);
//
//     if (!patientId || !encounterId) {
//         return (
//             <AdminLayout>
//                 <div className="p-6 text-center text-red-600">
//                     Missing patient or encounter id.
//                     <div className="mt-3">
//                         <button
//                             onClick={() => router.push("/patients")}
//                             className="px-3 py-1.5 rounded bg-blue-600 text-white"
//                         >
//                             Back to Patients
//                         </button>
//                     </div>
//                 </div>
//             </AdminLayout>
//         );
//     }
//
//     const toc = [
//         { id: "chief-complaint", label: "cc" },
//         { id: "hpi", label: "HPI" },
//         { id: "pmh", label: "Past Medical Hx" },
//         { id: "fh", label: "Family History" },
//         { id: "pe", label: "Physical Exam" },
//         { id: "ros", label: "ROS" },
//         { id: "procedures", label: "Procedures" },
//         { id: "codes", label: "Codes" },
//         { id: "plan", label: "Plan" },
//         { id: "notes", label: "Provider Notes" },
//         { id: "signature", label: "Provider Signature" },
//         { id: "signoff", label: "Sign-off / Finalize" },
//         { id: "fees", label: "Fee Schedule" },
//     ];
//
//     return (
//         <AdminLayout>
//             <div className="border-b bg-white sticky top-0 z-40">
//                 <div className="max-w-screen-2xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
//                     <div className="flex items-center gap-2">
//                         <Link
//                             href={`/patients/${patientId}`}
//                             className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 border border-gray-300 text-xs font-medium text-gray-700"
//                         >
//                             ← Patient
//                         </Link>
//                         <div className="text-xs text-gray-600">
//                             Encounter <span className="font-semibold">#{encounterId}</span>
//                         </div>
//                     </div>
//                     <div className="hidden md:flex flex-wrap gap-1">
//                         {toc.map((t) => (
//                             <a
//                                 key={t.id}
//                                 href={`#${t.id}`}
//                                 className="px-2 py-1 rounded-md text-xs border bg-white hover:bg-gray-50 text-gray-700"
//                             >
//                                 {t.label}
//                             </a>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//
//             <div className="w-full max-w-screen-2xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-[minmax(0,17fr)_minmax(0,5fr)] gap-4">
//                 {/* Main */}
//                 <main className="min-w-0 space-y-4">
//                     <section id="chief-complaint" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2">Chief Complaint</h2>
//                             <ChiefComplaintList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="hpi" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2">History of Present Illness (HPI)</h2>
//                             <HPIList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="pmh" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2">Past Medical History</h2>
//                             <PMHList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="fh" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2">Family History</h2>
//                             <FHList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="pe" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2">Physical Exam</h2>
//                             <PEList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="ros" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2">Review of Systems</h2>
//                             <ROSList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="procedures" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2">Procedures</h2>
//                             <ProcedureList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="codes" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2">Codes</h2>
//                             <CodeList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="plan" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2">Plan</h2>
//                             <PlanList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="notes" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2">Provider Notes</h2>
//                             <ProviderNoteList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="signature" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2">Provider Signature</h2>
//                             <ProviderSignatureCard patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="signoff" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2">Sign-off / Finalization</h2>
//                             <SignoffCard patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="fees" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2">Fee Schedule</h2>
//                             <FeeScheduleCard patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//                 </main>
//
//                 {/* Side TOC */}
//                 <aside className="min-w-0">
//                     <div className="sticky top-24 bg-white rounded-2xl border p-4 shadow-sm">
//                         <div className="text-sm font-semibold text-gray-800 mb-2">Sections</div>
//                         <div className="grid gap-1">
//                             {toc.map((t) => (
//                                 <a
//                                     key={t.id}
//                                     href={`#${t.id}`}
//                                     className="px-2 py-1 rounded-md text-xs bg-gray-50 hover:bg-gray-100 border text-gray-700"
//                                 >
//                                     {t.label}
//                                 </a>
//                             ))}
//                         </div>
//                     </div>
//                 </aside>
//             </div>
//         </AdminLayout>
//     );
// }


// "use client";
//
// import { useParams, useRouter } from "next/navigation";
// import Link from "next/link";
//
// // Layout
// import AdminLayout from "@/app/(admin)/layout";
//
// // Encounter sections (paths per your structure)
// import ChiefComplaintList from "@/components/encounter/cc/ChiefComplaintList";
// import HPIList from "@/components/encounter/hpi/HPIList";
// import PMHList from "@/components/encounter/pmh/PMHList";
// import FHList from "@/components/encounter/familyhistory/FHList";
// import PEList from "@/components/encounter/physicalexam/PEList";
// import ROSList from "@/components/encounter/ros/ROSList";
// import SHList from "@/components/encounter/socialhistory/SHList"; // NEW: Social History
// import ProcedureList from "@/components/encounter/procedure/ProcedureList";
// import CodeList from "@/components/encounter/coding/CodeList";
// import AssessmentList from "@/components/encounter/assessment/AssessmentList"; // NEW
// import PlanList from "@/components/encounter/plan/PlanList";
// import AssignedProviderList from "@/components/encounter/assigned/AssignedProviderList"; // NEW
// import ProviderNoteList from "@/components/encounter/providernote/ProviderNoteList";
// import ProviderSignatureCard from "@/components/encounter/providersignature/ProviderSignatureCard";
// import SignoffCard from "@/components/encounter/signoff/SignoffCard";
// import FeeScheduleCard from "@/components/encounter/fees/FeeScheduleCard";
//
// export default function EncounterTabsPage() {
//     const params = useParams();
//     const router = useRouter();
//
//     const patientId = Number(params?.id);
//     const encounterId = Number(params?.encounterId);
//
//     if (!patientId || !encounterId) {
//         return (
//             <AdminLayout>
//                 <div className="p-6 text-center text-red-600">
//                     Missing patient or encounter id.
//                     <div className="mt-3">
//                         <button
//                             onClick={() => router.push("/patients")}
//                             className="px-3 py-1.5 rounded bg-blue-600 text-white"
//                         >
//                             Back to Patients
//                         </button>
//                     </div>
//                 </div>
//             </AdminLayout>
//         );
//     }
//
//     const toc = [
//         { id: "assigned-providers", label: "Assigned Providers" }, // NEW
//         { id: "chief-complaint", label: "CC" },
//         { id: "hpi", label: "HPI" },
//         { id: "pmh", label: "Past Medical Hx" },
//         { id: "fh", label: "Family History" },
//         { id: "sh", label: "Social History" }, // NEW
//         { id: "pe", label: "Physical Exam" },
//         { id: "ros", label: "ROS" },
//         { id: "procedures", label: "Procedures" },
//         { id: "codes", label: "Codes" },
//         { id: "assessment", label: "Assessment" }, // NEW
//         { id: "plan", label: "Plan" },
//         { id: "notes", label: "Provider Notes" },
//         { id: "signature", label: "Provider Signature" },
//         { id: "signoff", label: "Sign-off / Finalize" },
//         { id: "fees", label: "Fee Schedule" },
//     ] as const;
//
//     return (
//         <AdminLayout>
//             {/* Sticky header with quick anchors */}
//             <div className="border-b bg-white sticky top-0 z-40">
//                 <div className="max-w-screen-2xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
//                     <div className="flex items-center gap-2">
//                         <Link
//                             href={`/patients/${patientId}`}
//                             className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 border border-gray-300 text-xs font-medium text-gray-700"
//                         >
//                             ← Patient
//                         </Link>
//                         <div className="text-xs text-gray-600">
//                             Encounter <span className="font-semibold">#{encounterId}</span>
//                         </div>
//                     </div>
//                     <div className="hidden md:flex flex-wrap gap-1">
//                         {toc.map((t) => (
//                             <a
//                                 key={t.id}
//                                 href={`#${t.id}`}
//                                 className="px-2 py-1 rounded-md text-xs border bg-white hover:bg-gray-50 text-gray-700"
//                             >
//                                 {t.label}
//                             </a>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//
//             <div className="w-full max-w-screen-2xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-[minmax(0,17fr)_minmax(0,5fr)] gap-4">
//                 {/* Main column */}
//                 <main className="min-w-0 space-y-4">
//                     {/* NEW: Assigned Providers up top so roles/attending are set early */}
//                     <section id="assigned-providers" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2"> </h2>
//                             <AssignedProviderList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="chief-complaint" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2"> </h2>
//                             <ChiefComplaintList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="hpi" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2"> </h2>
//                             <HPIList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="pmh" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2"> </h2>
//                             <PMHList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="fh" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2"> </h2>
//                             <FHList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     {/* NEW: Social History */}
//                     <section id="sh" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2"> </h2>
//                             <SHList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="pe" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2"> </h2>
//                             <PEList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="ros" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2"> </h2>
//                             <ROSList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="procedures" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2"> </h2>
//                             <ProcedureList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="codes" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2"> </h2>
//                             <CodeList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     {/* NEW: Assessment between Codes and Plan */}
//                     <section id="assessment" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2"> </h2>
//                             <AssessmentList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="plan" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2"> </h2>
//                             <PlanList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="notes" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2"> </h2>
//                             <ProviderNoteList patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="signature" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2"> </h2>
//                             <ProviderSignatureCard patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="signoff" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2"> </h2>
//                             <SignoffCard patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//
//                     <section id="fees" className="scroll-mt-24">
//                         <div className="bg-white rounded-2xl border p-4 shadow-sm">
//                             <h2 className="text-lg font-semibold mb-2"> </h2>
//                             <FeeScheduleCard patientId={patientId} encounterId={encounterId} />
//                         </div>
//                     </section>
//                 </main>
//
//                 {/* Side table of contents */}
//                 <aside className="min-w-0">
//                     <div className="sticky top-24 bg-white rounded-2xl border p-4 shadow-sm">
//                         <div className="text-sm font-semibold text-gray-800 mb-2">Sections</div>
//                         <div className="grid gap-1">
//                             {toc.map((t) => (
//                                 <a
//                                     key={t.id}
//                                     href={`#${t.id}`}
//                                     className="px-2 py-1 rounded-md text-xs bg-gray-50 hover:bg-gray-100 border text-gray-700"
//                                 >
//                                     {t.label}
//                                 </a>
//                             ))}
//                         </div>
//                     </div>
//                 </aside>
//             </div>
//         </AdminLayout>
//     );
// }



"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

import AdminLayout from "@/app/(admin)/layout";

// Encounter sections (each of these renders its own title)
import AssignedProviderList from "@/components/encounter/assigned/AssignedProviderList";
import ChiefComplaintList from "@/components/encounter/cc/ChiefComplaintList";
import HPIList from "@/components/encounter/hpi/HPIList";
import PMHList from "@/components/encounter/pmh/PMHList";
import FHList from "@/components/encounter/familyhistory/FHList";
import SHList from "@/components/encounter/socialhistory/SHList";
import PEList from "@/components/encounter/physicalexam/PEList";
import ROSList from "@/components/encounter/ros/ROSList";
import ProcedureList from "@/components/encounter/procedure/ProcedureList";
import CodeList from "@/components/encounter/coding/CodeList";
import AssessmentList from "@/components/encounter/assessment/AssessmentList";
import PlanList from "@/components/encounter/plan/PlanList";
import ProviderNoteList from "@/components/encounter/providernote/ProviderNoteList";
import ProviderSignatureCard from "@/components/encounter/providersignature/ProviderSignatureCard";
import SignoffCard from "@/components/encounter/signoff/SignoffCard";
import FeeScheduleCard from "@/components/encounter/fees/FeeScheduleCard";
import DateTimeFinalizedCard from "@/components/encounter/datetimefinalized/DateTimeFinalizedCard";

export default function EncounterTabsPage() {
    const params = useParams();
    const router = useRouter();

    const patientId = Number(params?.id);
    const encounterId = Number(params?.encounterId);

    const [activeSection, setActiveSection] = useState<string>("");

    if (!patientId || !encounterId) {
        return (
            <AdminLayout>
                <div className="p-6 text-center text-red-600">
                    Missing patient or encounter id.
                    <div className="mt-3">
                        <button
                            onClick={() => router.push("/patients")}
                            className="px-3 py-1.5 rounded bg-blue-600 text-white"
                        >
                            Back to Patients
                        </button>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    const toc = [
        { id: "assigned-providers", label: "Assigned Providers" },
        { id: "chief-complaint", label: "Chief Complaint" },
        { id: "hpi", label: "History of Present Illness" },
        { id: "pmh", label: "Past Medical Hx" },
        { id: "fh", label: "Family History" },
        { id: "sh", label: "Social History" },
        { id: "pe", label: "Physical Exam" },
        { id: "ros", label: "Review of Systems" },
        { id: "procedures", label: "Procedures" },
        { id: "codes", label: "Codes" },
        { id: "assessment", label: "Assessment" },
        { id: "plan", label: "Plan" },
        { id: "notes", label: "Provider Notes" },
        { id: "signature", label: "Provider Signature" },
        { id: "signoff", label: "Sign-off / Finalize" },
        { id: "fees", label: "Fee Schedule" },
        { id: "datetime", label: "date time finalized" },
    ];

    // Highlight active section on scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.find((e) => e.isIntersecting);
                if (visible?.target.id) setActiveSection(visible.target.id);
            },
            { rootMargin: "-30% 0px -60% 0px", threshold: 0.2 }
        );

        toc.forEach((t) => {
            const el = document.getElementById(t.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <AdminLayout>
            {/* Header */}
            <div className="border-b bg-white sticky top-0 z-50 shadow-sm">
                <div className="max-w-screen-2xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/patients/${patientId}`}
                            className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 border text-xs font-medium text-gray-700"
                        >
                            ← Patient
                        </Link>
                        <div className="text-sm text-gray-600">
                            Encounter <span className="font-semibold">#{encounterId}</span>
                        </div>
                    </div>
                </div>

                {/* Sticky tabs row */}
                <div className="bg-white border-t border-b sticky top-[38px] z-40">
                    <div className="max-w-screen-2xl mx-auto px-3 py-2 flex flex-wrap gap-1 overflow-x-auto">
                        {toc.map((t) => (
                            <a
                                key={t.id}
                                href={`#${t.id}`}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium border whitespace-nowrap transition ${
                                    activeSection === t.id
                                        ? "bg-blue-600 text-white"
                                        : "bg-white hover:bg-gray-50 text-gray-700"
                                }`}
                            >
                                {t.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="w-full max-w-screen-2xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-[minmax(0,17fr)_minmax(0,5fr)] gap-6 scroll-smooth">
                {/* Main content */}
                <main className="min-w-0 space-y-6">
                    {toc.map((t, index) => (
                        <section
                            key={t.id}
                            id={t.id}
                            aria-label={t.label}
                            className={`scroll-mt-40 rounded-2xl border shadow-sm p-6 ${
                                index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            }`}
                        >
                            {/* NOTE: removed outer <h2> so titles don't duplicate.
                  Each inner component renders its own header. */}
                            {t.id === "assigned-providers" && (
                                <AssignedProviderList
                                    patientId={patientId}
                                    encounterId={encounterId}
                                />
                            )}
                            {t.id === "chief-complaint" && (
                                <ChiefComplaintList
                                    patientId={patientId}
                                    encounterId={encounterId}
                                />
                            )}
                            {t.id === "hpi" && (
                                <HPIList patientId={patientId} encounterId={encounterId} />
                            )}
                            {t.id === "pmh" && (
                                <PMHList patientId={patientId} encounterId={encounterId} />
                            )}
                            {t.id === "fh" && (
                                // page.tsx (parent)
                                <FHList patientId={Number(params.id)} encounterId={Number(params.encounterId)} />

                            )}
                            {t.id === "sh" && (
                                <SHList patientId={patientId} encounterId={encounterId} />
                            )}
                            {t.id === "pe" && (
                                <PEList patientId={patientId} encounterId={encounterId} />
                            )}
                            {t.id === "ros" && (
                                <ROSList patientId={patientId} encounterId={encounterId} />
                            )}
                            {t.id === "procedures" && (
                                <ProcedureList
                                    patientId={patientId}
                                    encounterId={encounterId}
                                />
                            )}
                            {t.id === "codes" && (
                                <CodeList patientId={patientId} encounterId={encounterId} />
                            )}
                            {t.id === "assessment" && (
                                <AssessmentList
                                    patientId={patientId}
                                    encounterId={encounterId}
                                />
                            )}
                            {t.id === "plan" && (
                                <PlanList patientId={patientId} encounterId={encounterId} />
                            )}
                            {t.id === "notes" && (
                                <ProviderNoteList
                                    patientId={patientId}
                                    encounterId={encounterId}
                                />
                            )}
                            {t.id === "signature" && (
                                <ProviderSignatureCard
                                    patientId={patientId}
                                    encounterId={encounterId}
                                />
                            )}
                            {t.id === "signoff" && (
                                <SignoffCard patientId={patientId} encounterId={encounterId} />
                            )}
                            {t.id === "fees" && (
                                <FeeScheduleCard
                                    patientId={patientId}
                                    encounterId={encounterId}
                                />
                            )}
                            {t.id === "datetime" && (
                                <DateTimeFinalizedCard
                                    patientId={patientId}
                                    encounterId={encounterId}
                                />
                            )}
                        </section>
                    ))}
                </main>

                {/* Side TOC */}
                <aside className="hidden lg:block min-w-0">
                    <div className="sticky top-40 bg-white rounded-2xl border p-4 shadow-md">
                        <div className="text-sm font-semibold text-gray-800 mb-2">
                            Sections
                        </div>
                        <div className="grid gap-1">
                            {toc.map((t) => (
                                <a
                                    key={t.id}
                                    href={`#${t.id}`}
                                    className={`px-2 py-1 rounded-md text-xs border transition ${
                                        activeSection === t.id
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                                    }`}
                                >
                                    {t.label}
                                </a>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </AdminLayout>
    );
}
