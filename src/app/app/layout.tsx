import { OptimizerProvider } from "@/context/OptimizerContext";
import { SidebarProvider } from "@/context/SidebarContext";
import { NotificationProvider } from "@/context/NotificationContext";
import DashboardTopNav from "@/components/DashboardTopNav";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <NotificationProvider>
                <OptimizerProvider>
                    <DashboardTopNav />
                    {children}
                </OptimizerProvider>
            </NotificationProvider>
        </SidebarProvider>
    );
}
