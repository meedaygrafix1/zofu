import { OptimizerProvider } from "@/context/OptimizerContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import DashboardTopNav from "@/components/DashboardTopNav";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // This ThemeProvider overrides the root layout's forcedTheme="light",
        // enabling dark mode only within the /app/* dashboard routes.
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <OptimizerProvider>
                <DashboardTopNav />
                {children}
            </OptimizerProvider>
        </ThemeProvider>
    );
}
