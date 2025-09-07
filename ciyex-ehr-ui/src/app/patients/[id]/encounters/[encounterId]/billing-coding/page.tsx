import CodeList from "@/components/encounter/coding/CodeList";

// Note: align with your build's PageProps where params is a Promise
type Props = { params: Promise<{ patientId: string; encounterId: string }> };

export const metadata = { title: "Billing & Coding" };

export default async function BillingCodingPage({ params }: Props) {
    const { patientId, encounterId } = await params;
    const patientIdNum = Number(patientId);
    const encounterIdNum = Number(encounterId);

    return (
        <div className="mx-auto max-w-3xl p-6">
            <CodeList patientId={patientIdNum} encounterId={encounterIdNum} />
        </div>
    );
}
