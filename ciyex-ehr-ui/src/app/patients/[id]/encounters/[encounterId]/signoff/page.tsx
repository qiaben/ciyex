import SignoffCard from "@/components/encounter/signoff/SignoffCard";

type Props = { params: Promise<{ patientId: string; encounterId: string }> };

export const metadata = { title: "Sign-off / Finalization" };

export default async function SignoffPage({ params }: Props) {
    const { patientId, encounterId } = await params;
    const patientIdNum = Number(patientId);
    const encounterIdNum = Number(encounterId);

    return (
        <div className="mx-auto max-w-3xl p-6">
            <SignoffCard patientId={patientIdNum} encounterId={encounterIdNum} />
        </div>
    );
}
