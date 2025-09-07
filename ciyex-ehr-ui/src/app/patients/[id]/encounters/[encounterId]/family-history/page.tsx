import FHList from "@/components/encounter/familyhistory/FHList";

type Props = { params: Promise<{ patientId: string; encounterId: string }> };

export const metadata = { title: "Family History (FH)" };

export default async function FamilyHistoryPage({ params }: Props) {
    const { patientId: pidStr, encounterId: eidStr } = await params;
    const patientId = Number(pidStr);
    const encounterId = Number(eidStr);

    return (
        <div className="mx-auto max-w-3xl p-6">
            <FHList patientId={patientId} encounterId={encounterId} />
        </div>
    );
}
