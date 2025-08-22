import PEList from "@/components/physicalexam/PEList";

type Props = { params: { patientId: string; encounterId: string } };

export const metadata = { title: "Physical Examination" };

export default function PhysicalExamPage({ params }: Props) {
    const patientId = Number(params.patientId);
    const encounterId = Number(params.encounterId);
    return (
        <div className="mx-auto max-w-3xl p-6">
            <PEList patientId={patientId} encounterId={encounterId} />
        </div>
    );
}
