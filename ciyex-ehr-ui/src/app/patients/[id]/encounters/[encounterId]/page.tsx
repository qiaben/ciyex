//
//
//
// "use client";
//
// import { useParams, useRouter } from "next/navigation";
// import Link from "next/link";
// import { useEffect, useRef, useState } from "react";
//
// // If you already have this helper, keep using it.
// import {fetchWithOrg} from "@/utils/fetchWithOrg";
//
// import AdminLayout from "@/app/(admin)/layout";
//
// // Sections
// import AssignedProviderList from "@/components/encounter/assigned/AssignedProviderList";
// import ChiefComplaintList from "@/components/encounter/cc/ChiefComplaintList";
// import HPIList from "@/components/encounter/hpi/HPIList";
// import PatientMHList from "@/components/encounter/pmh/PatientMHList";
// import PMHList from "@/components/encounter/pastmh/PMHList";
// import FHList from "@/components/encounter/familyhistory/FHList";
// import SHList from "@/components/encounter/socialhistory/SHList";
// import PEList from "@/components/encounter/physicalexam/PEList";
// import ROSList from "@/components/encounter/ros/ROSList";
// import ProcedureList from "@/components/encounter/procedure/ProcedureList";
// import CodeList from "@/components/encounter/coding/CodeList";
// import AssessmentList from "@/components/encounter/assessment/AssessmentList";
// import PlanList from "@/components/encounter/plan/PlanList";
// import ProviderNoteList from "@/components/encounter/providernote/ProviderNoteList";
// import ProviderSignatureCard from "@/components/encounter/providersignature/ProviderSignatureCard";
// import SignoffCard from "@/components/encounter/signoff/SignoffCard";
// //import FeeScheduleCard from "@/components/encounter/fees/FeeScheduleCard";
// import DateTimeFinalizedCard from "@/components/encounter/datetimefinalized/DateTimeFinalizedCard";
// import EncounterSummary from "@/components/encounter/summary/Encountersummary";
//
//
//
//
// // (Optional) If you already have this component per your earlier share
// // import EncounterDropdown from "@/components/encounter/EncounterDropdown";
//
// type EncounterStatus = "SIGNED" | "UNSIGNED" | "INCOMPLETE";
//
// export default function EncounterTabsPage() {
//     const params = useParams();
//     const router = useRouter();
//
//     const appointmentId = Number(params?.id);          // /record/appointments/[id]
//     const encounterId = Number(params?.encounterId);   // /encounters/[encounterId]
//
//     const [activeSection, setActiveSection] = useState<string>("");
//     const [status, setStatus] = useState<EncounterStatus>("UNSIGNED");
//     const [loadingStatus, setLoadingStatus] = useState(false);
//     const summaryRef = useRef<HTMLDivElement | null>(null);
//
//     if (!appointmentId || !encounterId) {
//         return (
//             <AdminLayout>
//                 <div className="p-6 text-center text-red-600">
//                     Missing appointment or encounter id.
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
//     // ---- TOC (includes Summary tab) ----
//     const toc = [
//        // NEW
//         { id: "assigned-providers", label: "Assigned Providers" },
//         { id: "chief-complaint", label: "Chief Complaint" },
//         { id: "hpi", label: "History of Present Illness" },
//         { id: "pmh", label: "Patient Medical Hx" },
//         { id: "pastpmh", label: "Past Medical Hx" },
//         { id: "fh", label: "Family History" },
//         { id: "sh", label: "Social History" },
//         { id: "pe", label: "Physical Exam" },
//         { id: "ros", label: "Review of Systems" },
//         { id: "procedures", label: "Procedures" },
//         { id: "codes", label: "Codes" },
//         { id: "assessment", label: "Assessment" },
//         { id: "plan", label: "Plan" },
//         { id: "notes", label: "Provider Notes" },
//         { id: "signature", label: "Provider Signature" },
//        // { id: "fees", label: "Fee Schedule" },
//         { id: "datetime", label: "Date/Time Finalized" },
//         { id: "signoff", label: "Sign-off / Finalize" },
//         { id: "summary", label: "Summary" },
//     ];
//
//     // ---- Load encounter to get current status ----
//     // useEffect(() => {
//     //     (async () => {
//     //         try {
//     //             const res = await fetchWithOrg(
//     //                 `${process.env.NEXT_PUBLIC_API_URL}/api/encounters/${encounterId}`
//     //             );
//     //             if (res.ok) {
//     //                 const data = await res.json();
//     //                 if (data?.status) setStatus(data.status as EncounterStatus);
//     //             }
//     //         } catch {
//     //             // ignore
//     //         }
//     //     })();
//     // }, [encounterId]);
//     useEffect(() => {
//         if (!encounterId) return;
//         (async () => {
//             try {
//                 const res = await fetchWithOrg(`${process.env.NEXT_PUBLIC_API_URL}/api/encounters/${encounterId}`);
//                 if (res.ok) {
//                     const data = await res.json();
//                     if (data?.status) setStatus(data.status as EncounterStatus);
//                 }
//             } catch {
//                 // ignore
//             }
//         })();
//     }, [encounterId]);
//
//     if (!appointmentId || !encounterId) {
//         return (
//             <AdminLayout>
//                 <div className="p-6 text-center text-red-600">Missing appointment or encounter id.</div>
//             </AdminLayout>
//         );
//     }
//
//
//     // ---- Highlight active section as you scroll ----
//     useEffect(() => {
//         const observer = new IntersectionObserver(
//             (entries) => {
//                 const visible = entries.find((e) => e.isIntersecting);
//                 if (visible?.target.id) setActiveSection(visible.target.id);
//             },
//             { rootMargin: "-30% 0px -60% 0px", threshold: 0.2 }
//         );
//
//         toc.forEach((t) => {
//             const el = document.getElementById(t.id);
//             if (el) observer.observe(el);
//         });
//
//         return () => observer.disconnect();
//     }, []);
//
//     // ---- Status mutations (Sign / Unsign / Incomplete) ----
//     async function updateStatus(next: EncounterStatus) {
//         try {
//             setLoadingStatus(true);
//             const res = await fetchWithOrg(
//                 `${process.env.NEXT_PUBLIC_API_URL}/api/encounters/${encounterId}`,
//                 {
//                     method: "PUT",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify({ status: next }),
//                 }
//             );
//             if (!res.ok) throw new Error("Failed to update status");
//             setStatus(next);
//         } catch (err) {
//             console.error(err);
//             alert("Could not update encounter status. Please try again.");
//         } finally {
//             setLoadingStatus(false);
//         }
//     }
//
//     // ---- Download Summary as PDF (DOM → PDF) ----
//     async function downloadSummaryPdf() {
//         if (!summaryRef.current) return;
//         const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
//             import("html2canvas"),
//             import("jspdf"),
//         ]);
//
//         const node = summaryRef.current;
//         const canvas = await html2canvas(node, { scale: 2, useCORS: true });
//         const imgData = canvas.toDataURL("image/png");
//
//         const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
//         const pageWidth = pdf.internal.pageSize.getWidth();
//         const pageHeight = pdf.internal.pageSize.getHeight();
//
//         const imgWidth = pageWidth;
//         const imgHeight = (canvas.height * imgWidth) / canvas.width;
//
//         let heightLeft = imgHeight;
//         let position = 0;
//
//         pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
//         heightLeft -= pageHeight;
//
//         while (heightLeft > 0) {
//             position = heightLeft - imgHeight;
//             pdf.addPage();
//             pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
//             heightLeft -= pageHeight;
//         }
//
//         pdf.save(`encounter-${encounterId}-summary.pdf`);
//     }
//
//     // ---- Render ----
//     return (
//         <AdminLayout>
//             {/* Top header with back link & actions (Sign/Incomplete/Unsign) */}
//             <div className="border-b bg-white sticky top-0 z-50">
//                 <div className="max-w-screen-2xl mx-auto px-3 py-2 grid grid-cols-1 md:grid-cols-3 items-center gap-2">
//                     <div className="flex items-center gap-2">
//                         <Link
//                             href={`/record/appointments/${appointmentId}`}
//                             className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 border text-xs font-medium text-gray-700"
//                         >
//                             ← Back
//                         </Link>
//                         <div className="text-sm text-gray-600">
//                             Encounter <span className="font-semibold">#{encounterId}</span>
//                         </div>
//                         <span
//                             className={`ml-2 rounded px-2 py-0.5 text-xs border ${
//                                 status === "SIGNED"
//                                     ? "bg-green-50 text-green-700 border-green-200"
//                                     : status === "INCOMPLETE"
//                                         ? "bg-amber-50 text-amber-700 border-amber-200"
//                                         : "bg-gray-50 text-gray-700 border-gray-200"
//                             }`}
//                             title="Current status"
//                         >
//               {status}
//             </span>
//                     </div>
//
//                     {/* Optional encounter switcher */}
//                     <div className="hidden md:flex justify-center">
//                         {/* Uncomment if you have this component already */}
//                         {/* <EncounterDropdown
//               appointmentId={appointmentId}
//               onSelect={(eId) =>
//                 router.push(`/record/appointments/${appointmentId}/encounters/${eId}`)
//               }
//             /> */}
//                     </div>
//
//                     <div className="flex justify-start md:justify-end items-center gap-2">
//                         <button
//                             className="px-3 py-1.5 rounded bg-green-600 text-white disabled:opacity-60"
//                             disabled={loadingStatus || status === "SIGNED"}
//                             onClick={() => updateStatus("SIGNED")}
//                         >
//                             {loadingStatus && status !== "SIGNED" ? "Saving..." : "Sign"}
//                         </button>
//                         <button
//                             className="px-3 py-1.5 rounded bg-amber-500 text-white disabled:opacity-60"
//                             disabled={loadingStatus || status === "INCOMPLETE"}
//                             onClick={() => updateStatus("INCOMPLETE")}
//                             title="Mark this encounter as Incomplete"
//                         >
//                             Set Incomplete
//                         </button>
//                         <button
//                             className="px-3 py-1.5 rounded bg-gray-600 text-white disabled:opacity-60"
//                             disabled={loadingStatus || status === "UNSIGNED"}
//                             onClick={() => updateStatus("UNSIGNED")}
//                             title="Revert to Un-signed"
//                         >
//                             Unsign
//                         </button>
//                     </div>
//                 </div>
//
//                 {/* Sticky tabs row */}
//                 <div className="bg-white border-t border-b">
//                     <div className="max-w-screen-2xl mx-auto px-3 py-2 flex flex-wrap gap-1 overflow-x-auto">
//                         {toc.map((t) => (
//                             <a
//                                 key={t.id}
//                                 href={`#${t.id}`}
//                                 className={`px-3 py-1.5 rounded-md text-xs font-medium border whitespace-nowrap transition ${
//                                     activeSection === t.id
//                                         ? "bg-blue-600 text-white"
//                                         : "bg-white hover:bg-gray-50 text-gray-700"
//                                 }`}
//                             >
//                                 {t.label}
//                             </a>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//
//             {/* Two-column layout: left anchors, right content */}
//             <div className="w-full max-w-screen-2xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-4">
//                 {/* Left anchor list */}
//                 <aside className="hidden lg:block w-[260px]">
//                     <div className="sticky top-[120px] max-h-[calc(100vh-120px)] overflow-auto bg-white rounded-2xl border p-4 shadow-md">
//                         <div className="text-sm font-semibold text-gray-800 mb-2">Sections</div>
//                         <div className="grid gap-1">
//                             {toc.map((t) => (
//                                 <a
//                                     key={t.id}
//                                     href={`#${t.id}`}
//                                     className={`px-2 py-1 rounded-md text-xs border transition ${
//                                         activeSection === t.id
//                                             ? "bg-blue-600 text-white"
//                                             : "bg-gray-50 hover:bg-gray-100 text-gray-700"
//                                     }`}
//                                 >
//                                     {t.label}
//                                 </a>
//                             ))}
//                         </div>
//                     </div>
//                 </aside>
//
//                 {/* Right main content */}
//                 <main className="min-w-0 space-y-6">
//
//
//                 {/*    /!* Remaining sections *!/*/}
//                     {[
//                         "assigned-providers",
//                         "chief-complaint",
//                         "hpi",
//                         "pmh",
//                         "pastpmh",
//                         "fh",
//                         "sh",
//                         "pe",
//                         "ros",
//                         "procedures",
//                         "codes",
//                         "assessment",
//                         "plan",
//                         "notes",
//                         "signature",
//                         //"fees",
//                         "datetime",
//                         "signoff",
//                         "summary"
//                     ].map((id, index) => (
//                         <section
//                             key={id}
//                             id={id}
//                             aria-label={id}
//                             className={`scroll-mt-[130px] rounded-2xl border shadow-sm p-6 ${
//                                 index % 2 === 0 ? "bg-gray-50" : "bg-white"
//                             }`}
//                         >
//                             {id === "assigned-providers" && (
//                                 <AssignedProviderList patientId={appointmentId} encounterId={encounterId} />
//                             )}
//                             {id === "chief-complaint" && (
//                                 <ChiefComplaintList patientId={appointmentId} encounterId={encounterId} />
//                             )}
//                             {id === "hpi" && <HPIList patientId={appointmentId} encounterId={encounterId} />}
//                             {id === "pmh" && <PatientMHList patientId={appointmentId} encounterId={encounterId} />}
//                             {id === "pastpmh" && <PMHList patientId={appointmentId} encounterId={encounterId} />}
//                             {id === "fh" && (
//                                 <FHList patientId={appointmentId} encounterId={encounterId} />
//                             )}
//                             {id === "sh" && <SHList patientId={appointmentId} encounterId={encounterId} />}
//                             {id === "pe" && <PEList patientId={appointmentId} encounterId={encounterId} />}
//                             {id === "ros" && <ROSList patientId={appointmentId} encounterId={encounterId} />}
//                             {id === "procedures" && (
//                                 <ProcedureList patientId={appointmentId} encounterId={encounterId} />
//                             )}
//                             {id === "codes" && <CodeList patientId={appointmentId} encounterId={encounterId} />}
//                             {id === "assessment" && (
//                                 <AssessmentList patientId={appointmentId} encounterId={encounterId} />
//                             )}
//                             {id === "plan" && <PlanList patientId={appointmentId} encounterId={encounterId} />}
//                             {id === "notes" && (
//                                 <ProviderNoteList patientId={appointmentId} encounterId={encounterId} />
//                             )}
//                             {id === "signature" && (
//                                 <ProviderSignatureCard patientId={appointmentId} encounterId={encounterId} />
//                             )}
//                             {/*{id === "fees" && (*/}
//                             {/*    <FeeScheduleCard patientId={appointmentId} encounterId={encounterId} />*/}
//                             {/*)}*/}
//                             {id === "datetime" && (
//                                 <DateTimeFinalizedCard patientId={appointmentId} encounterId={encounterId} />
//                             )}
//                             {id === "signoff" && <SignoffCard patientId={appointmentId} encounterId={encounterId} />}
//                             {id === "summary" && (
//                                 <EncounterSummary
//                                     patientId={appointmentId}
//                                     encounterId={encounterId}
//                                     showDownload={true}   // set false if you don’t want a button here
//
//                                 />
//                             )}
//                         </section>
//                     ))}
//                 </main>
//             </div>
//         </AdminLayout>
//     );
// }
//
// /** Local, lightweight action bar used on Summary sections */
// function SectionActionBar({
//                               onEditAnchor,
//                           }: {
//     onEditAnchor?: string; // e.g., '#hpi' to jump to the editor section
// }) {
//     return (
//         <div className="mt-3 flex flex-wrap items-center gap-2">
//             <button
//                 onClick={() => {
//                     // Navigate user to Provider Signature tab for eSign
//                     const el = document.querySelector("#signature");
//                     if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
//                 }}
//                 className="px-2.5 py-1 rounded border text-xs bg-white hover:bg-gray-50"
//                 title="eSign this section"
//             >
//                 eSign
//             </button>
//
//             <button
//                 onClick={() => window.print()}
//                 className="px-2.5 py-1 rounded border text-xs bg-white hover:bg-gray-50"
//                 title="Print this section"
//             >
//                 Print
//             </button>
//
//             <button
//                 onClick={() => {
//                     if (onEditAnchor) {
//                         const el = document.querySelector(onEditAnchor);
//                         if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
//                     }
//                 }}
//                 className="px-2.5 py-1 rounded border text-xs bg-white hover:bg-gray-50"
//                 title="Edit this section"
//             >
//                 Edit
//             </button>
//
//             <button
//                 onClick={() => {
//                     // Implement per-section DELETE API as needed
//                     alert("Delete handler: wire to the section’s DELETE endpoint.");
//                 }}
//                 className="px-2.5 py-1 rounded border text-xs bg-white hover:bg-gray-50 text-red-600 border-red-200"
//                 title="Delete this section"
//             >
//                 Delete
//             </button>
//         </div>
//     );
// }





"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback ,useMemo} from "react";

// If you already have this helper, keep using it.
import {fetchWithOrg} from "@/utils/fetchWithOrg";


import AdminLayout from "@/app/(admin)/layout";

// Sections
import AssignedProviderList from "@/components/encounter/assigned/AssignedProviderList";
import ChiefComplaintList from "@/components/encounter/cc/ChiefComplaintList";
import HPIList from "@/components/encounter/hpi/HPIList";
import PatientMHList from "@/components/encounter/pmh/PatientMHList";
import PMHList from "@/components/encounter/pastmh/PMHList";
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
//import FeeScheduleCard from "@/components/encounter/fees/FeeScheduleCard";
import DateTimeFinalizedCard from "@/components/encounter/datetimefinalized/DateTimeFinalizedCard";
import EncounterSummary from "@/components/encounter/summary/Encountersummary";
import VitalsList from "@/components/encounter/Vitals/VitalsList";


// (Optional) If you already have this component per your earlier share
// import EncounterDropdown from "@/components/encounter/EncounterDropdown";

type EncounterStatus = "SIGNED" | "UNSIGNED" | "INCOMPLETE";

export default function EncounterTabsPage() {
    const params = useParams();
    const router = useRouter();

    const appointmentId = Number(params?.id);          // /record/appointments/[id]
    const encounterId = Number(params?.encounterId);   // /encounters/[encounterId]

    const [activeSection, setActiveSection] = useState<string>("");
    const [status, setStatus] = useState<EncounterStatus>("UNSIGNED");
    const [loadingStatus, setLoadingStatus] = useState(false);
    const summaryRef = useRef<HTMLDivElement | null>(null);

    // ---- TOC (includes Summary tab) ----

    const toc = useMemo(
        () => [
            { id: "assigned-providers", label: "Assigned Providers" },
            { id: "chief-complaint", label: "Chief Complaint" },
            { id: "hpi", label: "History of Present Illness" },
            { id: "pmh", label: "Patient Medical Hx" },
            { id: "pastpmh", label: "Past Medical Hx" },
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
            // { id: "fees", label: "Fee Schedule" },
            { id: "datetime", label: "Date/Time Finalized" },
            { id: "signoff", label: "Sign-off / Finalize" },
            { id: "vitals", label: "vitals" },
            { id: "summary", label: "Summary" },
        ],
        []
    );

// ---- Load encounter to get current status ----
    useEffect(() => {
        if (!encounterId) return;
        (async () => {
            try {
                const res = await fetchWithOrg(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/encounters/${encounterId}`
                );
                if (res.ok) {
                    const data = await res.json();
                    if (data?.status) setStatus(data.status as EncounterStatus);
                }
            } catch {
                // ignore
            }
        })();
    }, [encounterId]);

// ---- Highlight active section as you scroll ----
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
    }, [toc]);

    // ---- Status mutations (Sign / Unsign / Incomplete) ----
    const updateStatus = useCallback(async (next: EncounterStatus) => {
        try {
            setLoadingStatus(true);
            const res = await fetchWithOrg(
                `${process.env.NEXT_PUBLIC_API_URL}/api/encounters/${encounterId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: next }),
                }
            );
            if (!res.ok) throw new Error("Failed to update status");
            setStatus(next);
        } catch (err) {
            console.error(err);
            alert("Could not update encounter status. Please try again.");
        } finally {
            setLoadingStatus(false);
        }
    }, [encounterId]);

    // ---- Download Summary as PDF (DOM → PDF) ----
    const downloadSummaryPdf = useCallback(async () => {
        if (!summaryRef.current) return;
        const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
            import("html2canvas"),
            import("jspdf"),
        ]);

        const node = summaryRef.current;
        const canvas = await html2canvas(node, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`encounter-${encounterId}-summary.pdf`);
    }, [encounterId]);

    // Early return after all hooks
    if (!appointmentId || !encounterId) {
        return (
            <AdminLayout>
                <div className="p-6 text-center text-red-600">
                    Missing appointment or encounter id.
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

    // ---- Render ----
    return (
        <AdminLayout>
            {/* Top header with back link & actions (Sign/Incomplete/Unsign) */}
            <div className="border-b bg-white sticky top-0 z-50">
                <div className="max-w-screen-2xl mx-auto px-3 py-2 grid grid-cols-1 md:grid-cols-3 items-center gap-2">
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/record/appointments/${appointmentId}`}
                            className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 border text-xs font-medium text-gray-700"
                        >
                            ← Back
                        </Link>
                        <div className="text-sm text-gray-600">
                            Encounter <span className="font-semibold">#{encounterId}</span>
                        </div>
                        <span
                            className={`ml-2 rounded px-2 py-0.5 text-xs border ${
                                status === "SIGNED"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : status === "INCOMPLETE"
                                        ? "bg-amber-50 text-amber-700 border-amber-200"
                                        : "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                            title="Current status"
                        >
                            {status}
                        </span>
                    </div>

                    {/* Optional encounter switcher */}
                    <div className="hidden md:flex justify-center">
                        {/* Uncomment if you have this component already */}
                        {/* <EncounterDropdown
                            appointmentId={appointmentId}
                            onSelect={(eId) =>
                                router.push(`/record/appointments/${appointmentId}/encounters/${eId}`)
                            }
                        /> */}
                    </div>

                    <div className="flex justify-start md:justify-end items-center gap-2">
                        <button
                            className="px-3 py-1.5 rounded bg-green-600 text-white disabled:opacity-60"
                            disabled={loadingStatus || status === "SIGNED"}
                            onClick={() => updateStatus("SIGNED")}
                        >
                            {loadingStatus && status !== "SIGNED" ? "Saving..." : "Sign"}
                        </button>
                        <button
                            className="px-3 py-1.5 rounded bg-amber-500 text-white disabled:opacity-60"
                            disabled={loadingStatus || status === "INCOMPLETE"}
                            onClick={() => updateStatus("INCOMPLETE")}
                            title="Mark this encounter as Incomplete"
                        >
                            Set Incomplete
                        </button>
                        <button
                            className="px-3 py-1.5 rounded bg-gray-600 text-white disabled:opacity-60"
                            disabled={loadingStatus || status === "UNSIGNED"}
                            onClick={() => updateStatus("UNSIGNED")}
                            title="Revert to Un-signed"
                        >
                            Unsign
                        </button>
                        <button
                            className="px-3 py-1.5 rounded bg-blue-600 text-white disabled:opacity-60"
                            onClick={downloadSummaryPdf}
                            title="Download Summary as PDF"
                        >
                            Download PDF
                        </button>
                    </div>
                </div>

                {/* Sticky tabs row */}
                <div className="bg-white border-t border-b">
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

            {/* Two-column layout: left anchors, right content */}
            <div className="w-full max-w-screen-2xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-4">
                {/* Left anchor list */}
                <aside className="hidden lg:block w-[260px]">
                    <div className="sticky top-[120px] max-h-[calc(100vh-120px)] overflow-auto bg-white rounded-2xl border p-4 shadow-md">
                        <div className="text-sm font-semibold text-gray-800 mb-2">Sections</div>
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

                {/* Right main content */}
                <main className="min-w-0 space-y-6">
                    {/* Remaining sections */}
                    {[
                        "assigned-providers",
                        "chief-complaint",
                        "hpi",
                        "pmh",
                        "pastpmh",
                        "fh",
                        "sh",
                        "pe",
                        "ros",
                        "procedures",
                        "codes",
                        "assessment",
                        "plan",
                        "notes",
                        "signature",
                        //"fees",
                        "vitals",
                        "datetime",
                        "signoff",
                        "summary"
                    ].map((id, index) => (
                        <section
                            key={id}
                            id={id}
                            aria-label={id}
                            className={`scroll-mt-[130px] rounded-2xl border shadow-sm p-6 ${
                                index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            }`}
                            ref={id === "summary" ? summaryRef : undefined}
                        >
                            {id === "assigned-providers" && (
                                <AssignedProviderList patientId={appointmentId} encounterId={encounterId} />
                            )}
                            {id === "chief-complaint" && (
                                <ChiefComplaintList patientId={appointmentId} encounterId={encounterId} />
                            )}
                            {id === "hpi" && <HPIList patientId={appointmentId} encounterId={encounterId} />}
                            {id === "pmh" && <PatientMHList patientId={appointmentId} encounterId={encounterId} />}
                            {id === "pastpmh" && <PMHList patientId={appointmentId} encounterId={encounterId} />}
                            {id === "fh" && (
                                <FHList patientId={appointmentId} encounterId={encounterId} />
                            )}
                            {id === "sh" && <SHList patientId={appointmentId} encounterId={encounterId} />}
                            {id === "pe" && <PEList patientId={appointmentId} encounterId={encounterId} />}
                            {id === "ros" && <ROSList patientId={appointmentId} encounterId={encounterId} />}
                            {id === "procedures" && (
                                <ProcedureList patientId={appointmentId} encounterId={encounterId} />
                            )}
                            {id === "codes" && <CodeList patientId={appointmentId} encounterId={encounterId} />}
                            {id === "assessment" && (
                                <AssessmentList patientId={appointmentId} encounterId={encounterId} />
                            )}
                            {id === "plan" && <PlanList patientId={appointmentId} encounterId={encounterId} />}
                            {id === "notes" && (
                                <ProviderNoteList patientId={appointmentId} encounterId={encounterId} />
                            )}
                            {id === "signature" && (
                                <ProviderSignatureCard patientId={appointmentId} encounterId={encounterId} />
                            )}
                            {/*{id === "fees" && (*/}
                            {/*    <FeeScheduleCard patientId={appointmentId} encounterId={encounterId} />*/}
                            {/*)}*/}
                            {id === "datetime" && (
                                <DateTimeFinalizedCard patientId={appointmentId} encounterId={encounterId} />
                            )}
                            {id === "vitals" && (
                                <VitalsList patientId={appointmentId} encounterId={encounterId} />
                            )}

                            {id === "signoff" && <SignoffCard patientId={appointmentId} encounterId={encounterId} />}
                            {id === "summary" && (
                                <EncounterSummary
                                    patientId={appointmentId}
                                    encounterId={encounterId}
                                    showDownload={true}   // set false if you don't want a button here
                                />
                            )}
                        </section>
                    ))}
                </main>
            </div>
        </AdminLayout>
    );

}