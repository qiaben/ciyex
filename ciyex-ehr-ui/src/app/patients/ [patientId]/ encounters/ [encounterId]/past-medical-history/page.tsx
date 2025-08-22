import PMHList from "@/components/pastmh/PMHList";

type Props = { params: { patientId: string; encounterId: string } };

export const metadata = { title: "Past Medical History (PMH)" };

export default function PMHPage({ params }: Props) {
    const patientId = Number(params.patientId);
    const encounterId = Number(params.encounterId);
    return (
        <div className="mx-auto max-w-3xl p-6">
            <PMHList patientId={patientId} encounterId={encounterId} />
        </div>
    );
}
