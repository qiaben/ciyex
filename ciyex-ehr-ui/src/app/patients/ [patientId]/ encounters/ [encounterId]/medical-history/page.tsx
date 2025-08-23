// Server file can be minimal; it renders the client list with route params.
import PMHList from "@/components/pmh/PMHList";

export const metadata = {
    title: "Patient Medical History",
};

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ patientId: string; encounterId: string }>;
}) {
    const { patientId, encounterId } = await params;

    return (
        <div className="mx-auto max-w-3xl p-6">
            <PMHList patientId={Number(patientId)} encounterId={Number(encounterId)} />
        </div>
    );
}
