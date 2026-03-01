import { OptimizerProvider } from "@/context/OptimizerContext";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <OptimizerProvider>{children}</OptimizerProvider>;
}
