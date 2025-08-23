import PEList from "@/components/physicalexam/PEList";

type Props = { params: Promise<{ patientId: string; encounterId: string }> };

export const metadata = { title: "Physical Examination" };

export default async function PhysicalExamPage({ params }: Props) {
    const { patientId: pidStr, encounterId: eidStr } = await params;
    const patientId = Number(pidStr);
    const encounterId = Number(eidStr);

    return (
        <div className="mx-auto max-w-3xl p-6">
            <PEList patientId={patientId} encounterId={encounterId} />
        </div>
    );
}
