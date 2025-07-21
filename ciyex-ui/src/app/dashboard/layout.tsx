import SidebarMenu from "@/app/components/dashboard/SidebarMenu";
import TopBar from "@/app/components/dashboard/TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen">
            <SidebarMenu />
            <div className="flex-1 flex flex-col">
                <TopBar />
                <main className="flex-1 p-4">{children}</main>
            </div>
        </div>
    );
}
