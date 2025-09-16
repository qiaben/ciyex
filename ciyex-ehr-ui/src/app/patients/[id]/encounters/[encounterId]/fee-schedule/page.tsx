

type Props = { params: Promise<{ patientId: string; encounterId: string }> };

export const metadata = { title: "Fee Schedule" };

export default async function FeeSchedulePage({ params }: Props) {
    const { patientId, encounterId } = await params;
    const patientIdNum = Number(patientId);
    const encounterIdNum = Number(encounterId);

    return (
        <div className="mx-auto max-w-5xl p-6">

        </div>
    );
}
