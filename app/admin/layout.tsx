'use client';

import AdminGuard from '@/components/auth/admin-guard';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path ? 'text-primary font-bold bg-primary/10 px-3 py-1 rounded-full' : 'text-gray-600 hover:text-primary hover:bg-gray-50 px-3 py-1 rounded-full transition-all';
    };

    return (
        <AdminGuard>
            <div className="flex min-h-screen flex-col">
                <header className="border-b bg-white">
                    <div className="container mx-auto flex h-16 items-center justify-between px-4">
                        <div className="flex items-center gap-6">
                            <Link href="/admin" className="text-xl font-bold">
                                Gupta Ji Admin
                            </Link>
                            <nav className="flex gap-2 text-sm font-medium">
                                <Link href="/admin" className={isActive('/admin')}>
                                    Dashboard
                                </Link>
                                <Link href="/admin/products" className={isActive('/admin/products')}>
                                    Products
                                </Link>
                                <Link href="/admin/orders" className={isActive('/admin/orders')}>
                                    Orders
                                </Link>
                                <Link href="/admin/live-carts" className={isActive('/admin/live-carts')}>
                                    Live Carts
                                </Link>
                            </nav>
                        </div>

                    </div>
                </header>
                <main className="flex-1 bg-gray-50 p-8">
                    {children}
                </main>
            </div>
        </AdminGuard>
    );
}
