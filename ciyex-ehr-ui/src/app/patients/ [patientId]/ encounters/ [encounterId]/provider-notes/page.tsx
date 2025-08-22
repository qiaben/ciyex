import ProviderNoteList from "@/components/providernote/ProviderNoteList";

type Props = { params: Promise<{ patientId: string; encounterId: string }> };

export const metadata = { title: "Provider Notes" };

export default async function ProviderNotesPage({ params }: Props) {
    const { patientId: pidStr, encounterId: eidStr } = await params;
    const patientId = Number(pidStr);
    const encounterId = Number(eidStr);

    return (
        <div className="mx-auto max-w-3xl p-6">
            <ProviderNoteList patientId={patientId} encounterId={encounterId} />
        </div>
    );
}
