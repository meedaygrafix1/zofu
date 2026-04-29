import { OptimizerProvider } from "@/context/OptimizerContext";
import { SidebarProvider } from "@/context/SidebarContext";
import DashboardTopNav from "@/components/DashboardTopNav";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <OptimizerProvider>
                <DashboardTopNav />
                {children}
            </OptimizerProvider>
        </SidebarProvider>
    );
}
