import React from "react";

// Define the Patient type based on the fields used in the component
interface Patient {
    title?: string;
    lastName?: string;
    firstName?: string;
    middleInitial?: string;
    suffix?: string;
    dateOfBirth?: string;
    gender?: string;
    maritalStatus?: string;
    siblings?: string;
    differentlyAbled?: string;
    preferredName?: string;
    previousNames?: string;
    chart?: string;
    mrn?: string;
    ptssn?: string;
    ssn?: string;
    status?: string;
    registerDate?: string;
    birthGender?: string;
    birthTime?: string;
    sexualOrientation?: string;
    genderIdentity?: string;
    ethnicity?: string;
    race?: string;
    additionalRace?: string;
    language?: string;
    communicationPreference?: string;
    other?: string;
    category?: string;
    referringProvider?: string;
    primaryCarePhysician?: string;
    publicityCodeset?: string;
    immunizationRegistryId?: string;
    address?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
    phoneNumber?: string;
    cellPhone?: string;
    email?: string;
    fax?: string;
    socialNetworks?: string;
    additionalContactName?: string;
    additionalContactAddress?: string;
    additionalContactPhones?: string;
    additionalContactEmail?: string;
    additionalContactDob?: string;
    additionalContactRelation?: string;
    emergencyName?: string;
    emergencyAddress?: string;
    emergencyPhones?: string;
    emergencyEmail?: string;
    emergencyDob?: string;
    emergencyRelation?: string;
    previousContactAddress?: string;
    previousContactPhones?: string;
    previousContactActiveDates?: string;
    pharmacy?: string;
    erxPharmacy?: string;
    labCenter?: string;
    radiologyCenter?: string;
    serviceLocation?: string;
    employerName?: string;
    employerAddress?: string;
    employerStatus?: string;
    employerPhones?: string;
    employerEmail?: string;
    occupation?: string;
    hipaaNoticeReceived?: string;
    entityName?: string;
    networkContactNames?: string;
    networkAddress?: string;
    networkPhoneFax?: string;
    networkComments?: string;
    enterpriseMpiId?: string;
    regionalPatientId?: string;
    nationalPatientId?: string;
    vfcEligibility?: string;
    patientClass?: string;
    consentNonPhi?: string;
    nokLastName?: string;
    nokFirstName?: string;
    nokMiPrefixSuffix?: string;
    nokDemographics?: string;
    nokRelationship?: string;
    nokContactRole?: string;
    nokPrimaryFlag?: string;
    nokAddress?: string;
    nokPhonesEmails?: string;
    repName?: string;
    repType?: string;
    repVipPatientId?: string;
    amendmentRequested?: string;
    amendmentReason?: string;
    amendmentDate?: string;
    amendmentStatus?: string;
    amendmentNotes?: string;
    adStatus?: string;
    adType?: string;
    adActive?: string;
    adFreeText?: string;
    adStart?: string;
    adEnd?: string;
    adContactName?: string;
    adContactAddress?: string;
    adContactPhones?: string;
    adContactEmailUrl?: string;
    [key: string]: string | undefined; // Add index signature
}

interface Props {
    patient: Patient;
    demoForm: Partial<Patient>;
    setDemoForm: (updater: (prev: Partial<Patient>) => Partial<Patient>) => void;
    editDemographics: boolean;
    setEditDemographics: (v: boolean) => void;
    saveDemographics: () => Promise<void>;
    router: { back: () => void };
    formatDateLocal: (date: string) => string;
    calculateAgeLocal: (date: string) => number | string;
}

export default function DemographicsFlat({
                                             patient,
                                             demoForm,
                                             setDemoForm,
                                             editDemographics,
                                             setEditDemographics,
                                             saveDemographics,
                                             router,
                                             formatDateLocal,
                                             calculateAgeLocal,
                                         }: Props) {
    return (
        <div className="rounded-none bg-white p-2 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style jsx>{`
        ::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>

            {/* Demographics header row */}
            <div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
                <h2 className="text-base font-semibold text-slate-900">Demographics</h2>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                        Back
                    </button>

                    {!editDemographics ? (
                        <button
                            onClick={() => setEditDemographics(true)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                            Edit
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditDemographics(false);
                                    router.back();
                                }}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await saveDemographics();
                                        setEditDemographics(false);
                                        router.back();
                                    } catch (err) {
                                        alert((err as Error).message);
                                    }
                                }}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            >
                                Save
                            </button>
                        </>
                    )}
                </div>
            </div>

            {!editDemographics ? (
                /* READ-ONLY: 6 flat sections */
                <div className="space-y-6">
                    {/* Section 1: Patient Information */}
                    <section>
                        <h3 className="mb-2 text-sm font-semibold text-slate-800">1 — Patient Information</h3>
                        <div className="grid grid-cols-1 gap-1 text-xs text-slate-800 md:grid-cols-2 lg:grid-cols-3">
                            <p><span className="text-slate-500">Title:</span> {patient?.title || "—"}</p>
                            <p><span className="text-slate-500">Last Name:</span> {patient?.lastName || "—"}</p>
                            <p><span className="text-slate-500">First Name:</span> {patient?.firstName || "—"}</p>
                            <p><span className="text-slate-500">MI:</span> {patient?.middleInitial || "—"}</p>
                            <p><span className="text-slate-500">Suffix:</span> {patient?.suffix || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-1">
                                <span className="text-slate-500">DOB:</span> {formatDateLocal(patient?.dateOfBirth || "")}
                                <span className="ml-1 inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px]">Age {calculateAgeLocal(patient?.dateOfBirth || "")}</span>
                            </p>
                            <p><span className="text-slate-500">Gender:</span> {patient?.gender || "—"}</p>
                            <p><span className="text-slate-500">Marital Status:</span> {patient?.maritalStatus || "—"}</p>
                            <p><span className="text-slate-500">Siblings:</span> {patient?.siblings || "—"}</p>
                            <p><span className="text-slate-500">Differently Abled:</span> {patient?.differentlyAbled || "—"}</p>
                            <p><span className="text-slate-500">Preferred Name:</span> {patient?.preferredName || "—"}</p>
                            <p><span className="text-slate-500">Previous Name:</span> {patient?.previousNames || "—"}</p>
                            <p><span className="text-slate-500">Chart:</span> {patient?.chart || "—"}</p>
                            <p><span className="text-slate-500">MRN:</span> {patient?.mrn || "—"}</p>
                            <p><span className="text-slate-500">PTSSN:</span> {patient?.ptssn || patient?.ssn || "—"}</p>
                            <p><span className="text-slate-500">Status:</span> <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-700">{patient?.status || "—"}</span></p>
                            <p><span className="text-slate-500">Register Date:</span> {patient?.registerDate || "—"}</p>
                            <p><span className="text-slate-500">Birth Gender:</span> {patient?.birthGender || "—"}</p>
                            <p><span className="text-slate-500">Birth Time:</span> {patient?.birthTime || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Sexual Orientation (SNOMED CT):</span> {patient?.sexualOrientation || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Gender Identity (SNOMED CT):</span> {patient?.genderIdentity || "—"}</p>
                            <p><span className="text-slate-500">Ethnicity:</span> {patient?.ethnicity || "—"}</p>
                            <p><span className="text-slate-500">Race:</span> {patient?.race || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Additional Race:</span> {patient?.additionalRace || "—"}</p>
                            <p><span className="text-slate-500">Language:</span> {patient?.language || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Communication Preference:</span> {patient?.communicationPreference || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Other:</span> {patient?.other || "—"}</p>
                            <p><span className="text-slate-500">Category:</span> {patient?.category || "—"}</p>
                            <p><span className="text-slate-500">Referring Physician:</span> {patient?.referringProvider || "—"}</p>
                            <p><span className="text-slate-500">Primary Care Physician:</span> {patient?.primaryCarePhysician || "—"}</p>
                            <p><span className="text-slate-500">Publicity Codeset:</span> {patient?.publicityCodeset || "—"}</p>
                            <p><span className="text-slate-500">Immunization Registry ID:</span> {patient?.immunizationRegistryId || "—"}</p>
                        </div>
                    </section>
                    <hr className="border-slate-200" />

                    {/* Section 2: Contacts & Related */}
                    <section>
                        <h3 className="mb-2 text-sm font-semibold text-slate-800">2 — Contacts & Related</h3>
                        <div className="grid grid-cols-1 gap-1 text-xs text-slate-800 md:grid-cols-2 lg:grid-cols-3">
                            <p><span className="text-slate-500">Address1:</span> {patient?.address || "—"}</p>
                            <p><span className="text-slate-500">Address2:</span> {patient?.address2 || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">City / State / Zip / Country:</span> {patient?.city || "—"}/{patient?.state || "—"}/{patient?.zip || "—"}/{patient?.country || "—"}</p>
                            <p><span className="text-slate-500">Home Phone:</span> {patient?.phoneNumber || "—"}</p>
                            <p><span className="text-slate-500">Cell:</span> {patient?.cellPhone || "—"}</p>
                            <p><span className="text-slate-500">Email:</span> {patient?.email || "—"}</p>
                            <p><span className="text-slate-500">Fax:</span> {patient?.fax || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Social Networks:</span> {patient?.socialNetworks || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3 font-medium text-slate-900">Additional Contact</p>
                            <p><span className="text-slate-500">Name:</span> {patient?.additionalContactName || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Address:</span> {patient?.additionalContactAddress || "—"}</p>
                            <p><span className="text-slate-500">Phones:</span> {patient?.additionalContactPhones || "—"}</p>
                            <p><span className="text-slate-500">Email:</span> {patient?.additionalContactEmail || "—"}</p>
                            <p><span className="text-slate-500">DOB:</span> {patient?.additionalContactDob || "—"}</p>
                            <p><span className="text-slate-500">Relation:</span> {patient?.additionalContactRelation || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3 font-medium text-slate-900">Emergency Contact</p>
                            <p><span className="text-slate-500">Name:</span> {patient?.emergencyName || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Address:</span> {patient?.emergencyAddress || "—"}</p>
                            <p><span className="text-slate-500">Phones:</span> {patient?.emergencyPhones || "—"}</p>
                            <p><span className="text-slate-500">Email:</span> {patient?.emergencyEmail || "—"}</p>
                            <p><span className="text-slate-500">DOB:</span> {patient?.emergencyDob || "—"}</p>
                            <p><span className="text-slate-500">Relation:</span> {patient?.emergencyRelation || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3 font-medium text-slate-900">Previous Contact</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Address:</span> {patient?.previousContactAddress || "—"}</p>
                            <p><span className="text-slate-500">Phones:</span> {patient?.previousContactPhones || "—"}</p>
                            <p><span className="text-slate-500">Active From/To:</span> {patient?.previousContactActiveDates || "—"}</p>
                        </div>
                    </section>
                    <hr className="border-slate-200" />

                    {/* Section 3: Preferences & Employer */}
                    <section>
                        <h3 className="mb-2 text-sm font-semibold text-slate-800">3 — Preferences & Employer</h3>
                        <div className="grid grid-cols-1 gap-1 text-xs text-slate-800 md:grid-cols-2 lg:grid-cols-3">
                            <p><span className="text-slate-500">Pharmacy:</span> {patient?.pharmacy || "—"}</p>
                            <p><span className="text-slate-500">eRx Pharmacy:</span> {patient?.erxPharmacy || "—"}</p>
                            <p><span className="text-slate-500">Laboratory Center:</span> {patient?.labCenter || "—"}</p>
                            <p><span className="text-slate-500">Radiology Center:</span> {patient?.radiologyCenter || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Service Location:</span> {patient?.serviceLocation || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3 font-medium text-slate-900">Employer</p>
                            <p><span className="text-slate-500">Employer:</span> {patient?.employerName || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Address:</span> {patient?.employerAddress || "—"}</p>
                            <p><span className="text-slate-500">Status:</span> {patient?.employerStatus || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Phones:</span> {patient?.employerPhones || "—"}</p>
                            <p><span className="text-slate-500">Email:</span> {patient?.employerEmail || "—"}</p>
                            <p><span className="text-slate-500">Occupation:</span> {patient?.occupation || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">HIPAA Notice Received:</span> {patient?.hipaaNoticeReceived ?? "—"}</p>
                        </div>
                    </section>
                    <hr className="border-slate-200" />

                    {/* Section 4: Patient Network & Next of Kin */}
                    <section>
                        <h3 className="mb-2 text-sm font-semibold text-slate-800">4 — Patient Network & Next of Kin</h3>
                        <div className="grid grid-cols-1 gap-1 text-xs text-slate-800 md:grid-cols-2 lg:grid-cols-3">
                            <p><span className="text-slate-500">Entity Name / Last, First:</span> {patient?.entityName || "—"}</p>
                            <p><span className="text-slate-500">Contact Name(s):</span> {patient?.networkContactNames || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Address:</span> {patient?.networkAddress || "—"}</p>
                            <p><span className="text-slate-500">Phone / Fax:</span> {patient?.networkPhoneFax || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Comments:</span> {patient?.networkComments || "—"}</p>
                            <p><span className="text-slate-500">Enterprise MPI ID:</span> {patient?.enterpriseMpiId || "—"}</p>
                            <p><span className="text-slate-500">Regional Patient Identifier:</span> {patient?.regionalPatientId || "—"}</p>
                            <p><span className="text-slate-500">National Patient Identifier:</span> {patient?.nationalPatientId || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3 font-medium text-slate-900">Next of Kin</p>
                            <p><span className="text-slate-500">Last Name:</span> {patient?.nokLastName || "—"}</p>
                            <p><span className="text-slate-500">First Name:</span> {patient?.nokFirstName || "—"}</p>
                            <p><span className="text-slate-500">MI / Prefix / Suffix:</span> {patient?.nokMiPrefixSuffix || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">DOB / Gender / Race / Marital Status:</span> {patient?.nokDemographics || "—"}</p>
                            <p><span className="text-slate-500">Relationship to Patient:</span> {patient?.nokRelationship || "—"}</p>
                            <p><span className="text-slate-500">Contact Role:</span> {patient?.nokContactRole || "—"}</p>
                            <p><span className="text-slate-500">Primary (flag):</span> {patient?.nokPrimaryFlag ?? "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Address:</span> {patient?.nokAddress || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Phones / Email:</span> {patient?.nokPhonesEmails || "—"}</p>
                        </div>
                    </section>
                    <hr className="border-slate-200" />

                    {/* Section 5: Patient Representative & Amendment */}
                    <section>
                        <h3 className="mb-2 text-sm font-semibold text-slate-800">5 — Patient Representative & Amendment</h3>
                        <div className="grid grid-cols-1 gap-1 text-xs text-slate-800 md:grid-cols-2 lg:grid-cols-3">
                            <p><span className="text-slate-500">Rep Name:</span> {patient?.repName || "—"}</p>
                            <p><span className="text-slate-500">Rep Type:</span> {patient?.repType || "—"}</p>
                            <p><span className="text-slate-500">VIP Patient ID:</span> {patient?.repVipPatientId || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3 font-medium text-slate-900">Amendment</p>
                            <p><span className="text-slate-500">Requested Amendment:</span> {patient?.amendmentRequested || "—"}</p>
                            <p><span className="text-slate-500">Reason:</span> {patient?.amendmentReason || "—"}</p>
                            <p><span className="text-slate-500">Date:</span> {patient?.amendmentDate || "—"}</p>
                            <p><span className="text-slate-500">Status:</span> {patient?.amendmentStatus || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Notes / Free Text:</span> {patient?.amendmentNotes || "—"}</p>
                            <p><span className="text-slate-500">Audit Log:</span> <span className="cursor-pointer text-blue-600 hover:underline">View</span></p>
                        </div>
                    </section>
                    <hr className="border-slate-200" />

                    {/* Section 6: Advance Directive */}
                    <section>
                        <h3 className="mb-2 text-sm font-semibold text-slate-800">6 — Advance Directive</h3>
                        <div className="grid grid-cols-1 gap-1 text-xs text-slate-800 md:grid-cols-2 lg:grid-cols-3">
                            <p><span className="text-slate-500">Advance Directive Status:</span> {patient?.adStatus || "—"}</p>
                            <p><span className="text-slate-500">Directive Type:</span> {patient?.adType || "—"}</p>
                            <p><span className="text-slate-500">Active:</span> {patient?.adActive ?? "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Free Text:</span> {patient?.adFreeText || "—"}</p>
                            <p><span className="text-slate-500">Start Effective Date:</span> {patient?.adStart || "—"}</p>
                            <p><span className="text-slate-500">End Effective Date:</span> {patient?.adEnd || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3 font-medium text-slate-900">Contact</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Name:</span> {patient?.adContactName || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Address:</span> {patient?.adContactAddress || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Phones:</span> {patient?.adContactPhones || "—"}</p>
                            <p className="md:col-span-2 lg:col-span-3"><span className="text-slate-500">Email / URL:</span> {patient?.adContactEmailUrl || "—"}</p>
                        </div>
                    </section>
                </div>
            ) : (
                /* EDIT MODE: Flat form (6 sections) */
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                            await saveDemographics();
                            setEditDemographics(false);
                            router.back();
                        } catch (err) {
                            alert((err as Error).message);
                        }
                    }}
                    className="space-y-6"
                >
                    {/* Edit/Cancel buttons above Patient Information */}
                    <div className="mb-2 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setEditDemographics(false);
                                router.back();
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        >
                            Save
                        </button>
                    </div>

                    {/* Section 1 */}
                    <section>
                        <h3 className="mb-2 text-sm font-semibold text-slate-800">1 — Patient Information</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                ["title", "Title"],
                                ["lastName", "Last Name"],
                                ["firstName", "First Name"],
                                ["middleInitial", "MI"],
                                ["suffix", "Suffix"],
                                ["dateOfBirth", "DOB"],
                                ["gender", "Gender"],
                                ["maritalStatus", "Marital Status"],
                                ["siblings", "Siblings"],
                                ["differentlyAbled", "Differently Abled"],
                                ["preferredName", "Preferred Name"],
                                ["previousNames", "Previous Name"],
                                ["chart", "Chart"],
                                ["mrn", "MRN"],
                                ["ptssn", "PTSSN"],
                                ["status", "Status"],
                                ["registerDate", "Register Date"],
                                ["birthGender", "Birth Gender"],
                                ["birthTime", "Birth Time"],
                                ["sexualOrientation", "Sexual Orientation (SNOMED CT)"],
                                ["genderIdentity", "Gender Identity (SNOMED CT)"],
                                ["ethnicity", "Ethnicity"],
                                ["race", "Race"],
                                ["additionalRace", "Additional Race"],
                                ["language", "Language"],
                                ["communicationPreference", "Communication Preference"],
                                ["other", "Other"],
                                ["category", "Category"],
                                ["referringProvider", "Referring Physician"],
                                ["primaryCarePhysician", "Primary Care Physician"],
                                ["publicityCodeset", "Publicity Codeset"],
                                ["immunizationRegistryId", "Immunization Registry ID"],
                            ].map(([key, label]) => (
                                <div key={key} className="flex flex-col">
                                    <label className="mb-1 block text-[11px] text-slate-600">{label}</label>
                                    <input
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
                                        value={demoForm[key] ?? ""}
                                        onChange={(e) =>
                                            setDemoForm((p) => ({
                                                ...p,
                                                [key]: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h3 className="mb-2 text-sm font-semibold text-slate-800">2 — Contacts & Related</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                ["address", "Address1"],
                                ["address2", "Address2"],
                                ["city", "City"],
                                ["state", "State"],
                                ["zip", "Zip"],
                                ["country", "Country"],
                                ["phoneNumber", "Home Phone"],
                                ["cellPhone", "Cell"],
                                ["email", "Email"],
                                ["fax", "Fax"],
                                ["socialNetworks", "Social Networks"],
                                ["additionalContactName", "Additional Contact Name"],
                                ["additionalContactAddress", "Additional Contact Address"],
                                ["additionalContactPhones", "Additional Contact Phones"],
                                ["additionalContactEmail", "Additional Contact Email"],
                                ["additionalContactDob", "Additional Contact DOB"],
                                ["additionalContactRelation", "Additional Contact Relation"],
                                ["emergencyName", "Emergency Name"],
                                ["emergencyAddress", "Emergency Address"],
                                ["emergencyPhones", "Emergency Phones (Home/Cell/Work)"],
                                ["emergencyEmail", "Emergency Email"],
                                ["emergencyDob", "Emergency DOB"],
                                ["emergencyRelation", "Emergency Relation"],
                                ["previousContactAddress", "Previous Contact Address"],
                                ["previousContactPhones", "Previous Contact Phones"],
                                ["previousContactActiveDates", "Previous Contact Active From/To"],
                            ].map(([key, label]) => (
                                <div key={key} className="flex flex-col">
                                    <label className="mb-1 block text-[11px] text-slate-600">{label}</label>
                                    <input
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm outline-none transition focus:border-emerald-300 focus:ring-2 focus:ring-emerald-200"
                                        value={demoForm[key] ?? ""}
                                        onChange={(e) =>
                                            setDemoForm((p) => ({
                                                ...p,
                                                [key]: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h3 className="mb-2 text-sm font-semibold text-slate-800">3 — Preferences & Employer</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                ["pharmacy", "Pharmacy"],
                                ["erxPharmacy", "eRx Pharmacy"],
                                ["labCenter", "Laboratory Center"],
                                ["radiologyCenter", "Radiology Center"],
                                ["serviceLocation", "Service Location"],
                                ["employerName", "Employer Name"],
                                ["employerAddress", "Employer Address"],
                                ["employerStatus", "Employer Status"],
                                ["employerPhones", "Employer Phones (Work/Home/Cell/Fax)"],
                                ["employerEmail", "Employer Email"],
                                ["occupation", "Occupation"],
                                ["hipaaNoticeReceived", "HIPAA Notice Received"],
                            ].map(([key, label]) => (
                                <div key={key} className="flex flex-col">
                                    <label className="mb-1 block text-[11px] text-slate-600">{label}</label>
                                    <input
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm outline-none transition focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
                                        value={demoForm[key] ?? ""}
                                        onChange={(e) =>
                                            setDemoForm((p) => ({
                                                ...p,
                                                [key]: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h3 className="mb-2 text-sm font-semibold text-slate-800">4 — Patient Network & Next of Kin</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                ["entityName", "Entity Name / Last, First"],
                                ["networkContactNames", "Contact Name(s)"],
                                ["networkAddress", "Address"],
                                ["networkPhoneFax", "Phone / Fax"],
                                ["networkComments", "Comments"],
                                ["enterpriseMpiId", "Enterprise MPI ID"],
                                ["regionalPatientId", "Regional Patient Identifier"],
                                ["nationalPatientId", "National Patient Identifier"],
                                ["vfcEligibility", "VFC Eligibility"],
                                ["patientClass", "Patient Class"],
                                ["consentNonPhi", "Consent to share non-PHI?"],
                                ["nokLastName", "NOK Last Name"],
                                ["nokFirstName", "NOK First Name"],
                                ["nokMiPrefixSuffix", "NOK MI / Prefix / Suffix"],
                                ["nokDemographics", "NOK DOB / Gender / Race / Marital Status"],
                                ["nokRelationship", "NOK Relationship to Patient"],
                                ["nokContactRole", "NOK Contact Role"],
                                ["nokPrimaryFlag", "NOK Primary (flag)"],
                                ["nokAddress", "NOK Address"],
                                ["nokPhonesEmails", "NOK Phones/Emails"],
                            ].map(([key, label]) => (
                                <div key={key} className="flex flex-col">
                                    <label className="mb-1 block text-[11px] text-slate-600">{label}</label>
                                    <input
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                                        value={demoForm[key] ?? ""}
                                        onChange={(e) =>
                                            setDemoForm((p) => ({
                                                ...p,
                                                [key]: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h3 className="mb-2 text-sm font-semibold text-slate-800">5 — Patient Representative & Amendment</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                ["repName", "Rep Name"],
                                ["repType", "Rep Type"],
                                ["repVipPatientId", "VIP Patient ID"],
                                ["amendmentRequested", "Requested Amendment"],
                                ["amendmentReason", "Reason"],
                                ["amendmentDate", "Date"],
                                ["amendmentStatus", "Status"],
                                ["amendmentNotes", "Notes / Free Text"],
                            ].map(([key, label]) => (
                                <div key={key} className="flex flex-col">
                                    <label className="mb-1 block text-[11px] text-slate-600">{label}</label>
                                    <input
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                                        value={demoForm[key] ?? ""}
                                        onChange={(e) =>
                                            setDemoForm((p) => ({
                                                ...p,
                                                [key]: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h3 className="mb-2 text-sm font-semibold text-slate-800">6 — Advance Directive</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                ["adStatus", "Advance Directive Status"],
                                ["adType", "Directive Type"],
                                ["adActive", "Active (Yes/No)"],
                                ["adFreeText", "Free Text"],
                                ["adStart", "Start Effective Date"],
                                ["adEnd", "End Effective Date"],
                                ["adContactName", "Contact Name"],
                                ["adContactAddress", "Contact Address"],
                                ["adContactPhones", "Contact Phones"],
                                ["adContactEmailUrl", "Contact Email / URL"],
                            ].map(([key, label]) => (
                                <div key={key} className="flex flex-col">
                                    <label className="mb-1 block text-[11px] text-slate-600">{label}</label>
                                    <input
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 shadow-sm outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                                        value={demoForm[key] ?? ""}
                                        onChange={(e) =>
                                            setDemoForm((p) => ({
                                                ...p,
                                                [key]: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                </form>
            )}
        </div>
    );
}