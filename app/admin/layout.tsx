'use client';

import AdminGuard from '@/components/auth/admin-guard';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminGuard>
            <div className="flex min-h-screen flex-col">
                <header className="border-b bg-white">
                    <div className="container mx-auto flex h-16 items-center justify-between px-4">
                        <div className="flex items-center gap-6">
                            <Link href="/admin" className="text-xl font-bold">
                                Gupta Jii Admin
                            </Link>
                            <nav className="flex gap-4 text-sm font-medium">
                                <Link href="/admin" className="hover:text-primary">
                                    Dashboard
                                </Link>
                                <Link href="/admin/products" className="hover:text-primary">
                                    Products
                                </Link>
                                <Link href="/admin/orders" className="hover:text-primary">
                                    Orders
                                </Link>
                                <Link href="/admin/live-carts" className="hover:text-primary">
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
