import DateTimeFinalizedCard from "@/components/encounter/datetimefinalized/DateTimeFinalizedCard";

type Props = { params: Promise<{ patientId: string; encounterId: string }> };

export const metadata = { title: "Date/Time Finalized" };

export default async function DateTimeFinalizedPage({ params }: Props) {
    const { patientId, encounterId } = await params;
    const patientIdNum = Number(patientId);
    const encounterIdNum = Number(encounterId);

    return (
        <div className="mx-auto max-w-3xl p-6">
            <DateTimeFinalizedCard patientId={patientIdNum} encounterId={encounterIdNum} />
        </div>
    );
}
