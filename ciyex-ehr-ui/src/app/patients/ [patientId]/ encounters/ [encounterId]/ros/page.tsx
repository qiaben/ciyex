import ROSList from "@/components/ros/ROSList";

type Props = { params: { patientId: string; encounterId: string } };

export const metadata = { title: "Review of Systems (ROS)" };

export default function ROSPage({ params }: Props) {
    const patientId = Number(params.patientId);
    const encounterId = Number(params.encounterId);
    return (
        <div className="mx-auto max-w-3xl p-6">
            <ROSList patientId={patientId} encounterId={encounterId} />
        </div>
    );
}
