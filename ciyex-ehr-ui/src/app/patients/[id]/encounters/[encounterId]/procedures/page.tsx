

type Props = { params: Promise<{ patientId: string; encounterId: string }> };

export const metadata = { title: "Procedures" };

export default async function ProceduresPage({ params }: Props) {
    const { patientId, encounterId } = await params;
    const patientIdNum = Number(patientId);
    const encounterIdNum = Number(encounterId);

    return (
        <div className="mx-auto max-w-3xl p-6">

        </div>
    );
}
