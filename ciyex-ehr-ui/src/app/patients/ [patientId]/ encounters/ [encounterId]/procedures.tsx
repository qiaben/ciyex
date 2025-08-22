import ProcedureList from "@/components/procedure/ProcedureList";

type Props = { params: { patientId: string; encounterId: string } };

export const metadata = { title: "Procedures" };

export default function ProceduresPage({ params }: Props) {
    const patientId = Number(params.patientId);
    const encounterId = Number(params.encounterId);
    return (
        <div className="mx-auto max-w-3xl p-6">
            <ProcedureList patientId={patientId} encounterId={encounterId} />
        </div>
    );
}
