import FHList from "@/components/familyhistory/FHList";

type Props = { params: { patientId: string; encounterId: string} };

export const metadata = { title: "Family History (FH)" };

export default function FamilyHistoryPage({ params }: Props) {
    const patientId = Number(params.patientId);
    const encounterId = Number(params.encounterId);

    return (
        <div className="mx-auto max-w-3xl p-6">
            <FHList patientId={patientId} encounterId={encounterId} />
        </div>
    );
}
