import HPIList from "@/components/hpi/HPIList";

type Props = { params: { patientId: string; encounterId: string } };

export const metadata = { title: "History of Present Illness (HPI)" };

export default function HPIPage({ params }: Props) {
    const patientId = Number(params.patientId);
    const encounterId = Number(params.encounterId);
    return (
        <div className="mx-auto max-w-3xl p-6">
            <HPIList patientId={patientId} encounterId={encounterId} />
        </div>
    );
}
