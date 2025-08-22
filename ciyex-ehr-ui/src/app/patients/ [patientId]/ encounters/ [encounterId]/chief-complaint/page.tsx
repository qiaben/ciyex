import ChiefComplaintList from "@/components/cc/ChiefComplaintList";

type Props = { params: { patientId: string; encounterId: string } };

export const metadata = { title: "Chief Complaint" };

export default function ChiefComplaintPage({ params }: Props) {
    const patientId = Number(params.patientId);
    const encounterId = Number(params.encounterId);

    return (
        <div className="mx-auto max-w-3xl p-6">
            <ChiefComplaintList patientId={patientId} encounterId={encounterId} />
        </div>
    );
}
