import { Metadata } from "next";
import SuperAdminPracticeSwitch from "@/components/common/SuperAdminPracticeSwitch";

export const metadata: Metadata = {
    title: "FlowBoard",
};

export default function Page() {
    return <SuperAdminPracticeSwitch />;
}
