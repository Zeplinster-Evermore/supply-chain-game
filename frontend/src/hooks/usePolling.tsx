import { useEffect, useRef } from "react";

export function usePolling(callback: () => Promise<void>, interval = 10000) {
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        let cancelled = false;

        const tick = async () => {
            if (cancelled) return;

            await callback();

            timeoutRef.current = window.setTimeout(tick, interval);
        };

        void tick();

        return () => {
            cancelled = true;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [callback, interval]);
}