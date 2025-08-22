// Server file can be minimal; it renders the client list with route params.
import PMHList from "@/components/pmh/PMHList";

type Props = {
    params: { patientId: string; encounterId: string };
};

export const metadata = {
    title: "Patient Medical History",
};

export default function Page({ params }: Props) {
    const patientId = Number(params.patientId);
    const encounterId = Number(params.encounterId);

    return (
        <div className="mx-auto max-w-3xl p-6">
            <PMHList patientId={patientId} encounterId={encounterId} />
        </div>
    );
}
