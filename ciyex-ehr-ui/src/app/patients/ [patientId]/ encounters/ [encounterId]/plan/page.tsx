import PlanList from "@/components/plan/PlanList";

type Props = { params: { patientId: string; encounterId: string } };

export const metadata = { title: "Plan" };

export default function PlanPage({ params }: Props) {
    const patientId = Number(params.patientId);
    const encounterId = Number(params.encounterId);
    return (
        <div className="mx-auto max-w-3xl p-6">
            <PlanList patientId={patientId} encounterId={encounterId} />
        </div>
    );
}
