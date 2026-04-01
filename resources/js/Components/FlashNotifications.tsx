import { useEffect } from 'react';
import { toast } from 'sonner';
import { usePage } from '@inertiajs/react';

interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

export default function FlashNotifications() {
    const flash = (usePage().props as any).flash as FlashMessages | undefined;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
        if (flash?.info) {
            toast.info(flash.info);
        }
    }, [flash]);

    return null;
}
