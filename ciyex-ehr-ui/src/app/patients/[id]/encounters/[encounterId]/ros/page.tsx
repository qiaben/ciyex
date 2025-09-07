import ROSList from "@/components/encounter/ros/ROSList";

type Props = { params: Promise<{ patientId: string; encounterId: string }> };

export const metadata = { title: "Review of Systems (ROS)" };

export default async function ROSPage({ params }: Props) {
    const { patientId: pidStr, encounterId: eidStr } = await params;
    const patientId = Number(pidStr);
    const encounterId = Number(eidStr);

    return (
        <div className="mx-auto max-w-3xl p-6">
            <ROSList patientId={patientId} encounterId={encounterId} />
        </div>
    );
}
