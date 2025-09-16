

// NOTE: params is a Promise in your Next.js build
type Props = { params: Promise<{ patientId: string; encounterId: string }> };

export const metadata = { title: "Assigned Provider(s)" };

export default async function AssignedProvidersPage({ params }: Props) {
    const { patientId, encounterId } = await params;
    const patientIdNum = Number(patientId);
    const encounterIdNum = Number(encounterId);
    return (
        <div className="mx-auto max-w-3xl p-6">

        </div>
    );
}
