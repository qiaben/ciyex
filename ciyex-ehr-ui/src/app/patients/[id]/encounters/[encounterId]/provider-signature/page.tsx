import ProviderSignatureCard from "@/components/encounter/providersignature/ProviderSignatureCard";

// Align with generated PageProps: params is a Promise
type Props = { params: Promise<{ patientId: string; encounterId: string }> };

export const metadata = { title: "Provider Signature" };

export default async function ProviderSignaturePage({ params }: Props) {
    const { patientId, encounterId } = await params;
    const patientIdNum = Number(patientId);
    const encounterIdNum = Number(encounterId);

    return (
        <div className="mx-auto max-w-3xl p-6">
            <ProviderSignatureCard patientId={patientIdNum} encounterId={encounterIdNum} />
        </div>
    );
}
