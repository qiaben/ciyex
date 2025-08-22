import SHList from "@/components/socialhistory/SHList";

type Props = { params: { patientId: string; encounterId: string } };

export const metadata = { title: "Social History (SH)" };

export default function SocialHistoryPage({ params }: Props) {
    const patientId = Number(params.patientId);
    const encounterId = Number(params.encounterId);
    return (
        <div className="mx-auto max-w-3xl p-6">
            <SHList patientId={patientId} encounterId={encounterId} />
        </div>
    );
}
