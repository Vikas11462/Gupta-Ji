'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, profile, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // FIX: Send them to login, but remember where they wanted to go!
                // After login, you can check this param and redirect them back.
                router.push(`/login?returnUrl=${encodeURIComponent(pathname)}`);
            } else if (profile?.role !== 'admin') {
                // If they are logged in but NOT an admin, send them home.
                // Ideally, trigger a toast notification here: "Unauthorized Access"
                router.push('/');
            }
        }
    }, [user, profile, loading, router, pathname]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!user || profile?.role !== 'admin') {
        return null;
    }

    return <>{children}</>;
}
