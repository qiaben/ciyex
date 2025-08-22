import ProviderNoteList from "@/components/providernote/ProviderNoteList";

type Props = { params: { patientId: string; encounterId: string } };

export const metadata = { title: "Provider Notes" };

export default function ProviderNotesPage({ params }: Props) {
    const patientId = Number(params.patientId);
    const encounterId = Number(params.encounterId);

    return (
        <div className="mx-auto max-w-3xl p-6">
            <ProviderNoteList patientId={patientId} encounterId={encounterId} />
        </div>
    );
}
