

type Props = { params: Promise<{ patientId: string; encounterId: string }> };

export const metadata = { title: "Plan" };

export default async function PlanPage({ params }: Props) {
    const { patientId: pidStr, encounterId: eidStr } = await params;
    const patientId = Number(pidStr);
    const encounterId = Number(eidStr);

    return (
        <div className="mx-auto max-w-3xl p-6">

        </div>
    );
}
