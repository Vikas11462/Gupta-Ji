'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ShoppingBag, Users, ShoppingCart, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        users: 0,
        activeCarts: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
                const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
                const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                // Fetch all cart items to count unique users (active carts)
                // Using a Set to count unique user_ids
                const { data: cartItems } = await supabase.from('cart_items').select('user_id');
                const uniqueCarts = new Set(cartItems?.map(item => item.user_id)).size;

                setStats({
                    products: productsCount || 0,
                    orders: ordersCount || 0,
                    users: usersCount || 0,
                    activeCarts: uniqueCarts || 0
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="p-8">
            <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {/* Total Products */}
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Products</p>
                            <p className="text-2xl font-bold">{stats.products}</p>
                        </div>
                        <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                            <ShoppingBag className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                {/* Total Orders */}
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Orders</p>
                            <p className="text-2xl font-bold">{stats.orders}</p>
                        </div>
                        <div className="rounded-full bg-green-100 p-3 text-green-600">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                {/* Total Users */}
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                            <p className="text-2xl font-bold">{stats.users}</p>
                        </div>
                        <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                            <Users className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                {/* Live Carts */}
                <Link href="/admin/live-carts" className="block transition-transform hover:scale-105">
                    <div className="rounded-lg border bg-white p-6 shadow-sm ring-2 ring-orange-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Live Carts</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.activeCarts}</p>
                            </div>
                            <div className="rounded-full bg-orange-100 p-3 text-orange-600">
                                <ShoppingCart className="h-6 w-6" />
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-orange-600 font-medium">
                            Click to spy →
                        </div>
                    </div>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-bold">Quick Actions</h2>
                    <div className="space-y-3">
                        <Link href="/admin/products" className="flex items-center justify-between rounded-md border p-3 hover:bg-gray-50">
                            <span className="font-medium">Manage Products</span>
                            <span className="text-sm text-gray-500">Add, Edit, Delete</span>
                        </Link>
                        <Link href="/admin/orders" className="flex items-center justify-between rounded-md border p-3 hover:bg-gray-50">
                            <span className="font-medium">View Orders</span>
                            <span className="text-sm text-gray-500">Check status</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
