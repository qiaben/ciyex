

export const metadata = { title: "History of Present Illness (HPI)" };

export default async function HPIPage({
                                          params,
                                      }: {
    params: Promise<{ patientId: string; encounterId: string }>;
}) {
    const { patientId, encounterId } = await params;

    return (
        <div className="mx-auto max-w-3xl p-6">

        </div>
    );
}
