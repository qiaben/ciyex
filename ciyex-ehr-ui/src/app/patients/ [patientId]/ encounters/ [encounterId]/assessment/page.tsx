import AssessmentList from "@/components/assessment/AssessmentList";

type Props = { params: { patientId: string; encounterId: string } };

export const metadata = { title: "Assessment" };

export default function AssessmentPage({ params }: Props) {
    const patientId = Number(params.patientId);
    const encounterId = Number(params.encounterId);
    return (
        <div className="mx-auto max-w-3xl p-6">
            <AssessmentList patientId={patientId} encounterId={encounterId} />
        </div>
    );
}
