import ChiefComplaintList from "@/components/cc/ChiefComplaintList";

export const metadata = { title: "Chief Complaint" };

export default async function ChiefComplaintPage({
                                                     params,
                                                 }: {
    params: Promise<{ patientId: string; encounterId: string }>;
}) {
    const { patientId, encounterId } = await params;

    return (
        <div className="mx-auto max-w-3xl p-6">
            <ChiefComplaintList
                patientId={Number(patientId)}
                encounterId={Number(encounterId)}
            />
        </div>
    );
}
