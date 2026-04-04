import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

/**
 * Returns { isPro, isLoading } for the currently authenticated user.
 *
 * "Pro" status is written to Supabase as user_metadata.is_pro = true.
 * Until billing goes live, all users return isPro = false.
 *
 * To grant a user Pro access manually (e.g. for testing):
 *   supabase.auth.updateUser({ data: { is_pro: true } })
 */
export function useProStatus() {
    const [isPro, setIsPro] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const supabase = createClient();

        supabase.auth.getUser().then(({ data }) => {
            if (cancelled) return;
            const is_pro = data?.user?.user_metadata?.is_pro === true;
            setIsPro(is_pro);
            setIsLoading(false);
        });

        return () => { cancelled = true; };
    }, []);

    return { isPro, isLoading };
}
