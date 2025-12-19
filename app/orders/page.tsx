'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck, Box } from 'lucide-react';
import { products as staticProducts } from '@/lib/data';

type OrderItem = {
    id: string;
    quantity: number;
    price: number;
    product: {
        name: string;
        image?: string;
    };
};

type Order = {
    id: string;
    created_at: string;
    status: string;
    total_amount: number;
    items: OrderItem[];
};

export default function OrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }

        if (user) {
            fetchOrders(user.id);
        }
    }, [user, authLoading, router]);

    const fetchOrders = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    items:order_items (
                        id,
                        quantity,
                        price,
                        product_id
                    )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Collect product IDs
            const productIds = new Set<string>();
            data?.forEach((order: any) => {
                order.items?.forEach((item: any) => {
                    if (item.product_id) productIds.add(item.product_id);
                });
            });

            // Fetch product details
            let productsMap: Record<string, any> = {};
            if (productIds.size > 0) {
                const { data: productsData } = await supabase
                    .from('products')
                    .select('id, name, image')
                    .in('id', Array.from(productIds));

                productsData?.forEach(p => {
                    productsMap[p.id] = p;
                });
            }

            // Map orders
            const mappedOrders = data?.map((order: any) => ({
                ...order,
                items: order.items?.map((item: any) => {
                    const product = productsMap[item.product_id] || staticProducts.find(p => p.id === item.product_id);
                    return {
                        ...item,
                        product: {
                            name: product?.name || 'Unknown Product',
                            image: product?.image
                        }
                    };
                })
            }));

            setOrders(mappedOrders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    if (authLoading) {
        return <div className="flex min-h-screen items-center justify-center p-8 text-primary">Loading your orders...</div>;
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8 min-h-screen">
            <div className="mb-6">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </div>

            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-primary">My Orders</h1>
                    <p className="text-muted-foreground mt-1">Track and manage your recent purchases.</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-full">
                    <Package className="h-8 w-8 text-primary" />
                </div>
            </div>

            {loadingOrders ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
                    <div className="mb-4 rounded-full bg-gray-100 p-4">
                        <Package className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold">No orders found</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">It looks like you haven't placed an order yet. Start shopping to fill this page!</p>
                    <Link href="/">
                        <button className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-transform hover:scale-105 hover:bg-primary/90">
                            Start Shopping
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-md">
                            <div className="border-b bg-muted/30 px-6 py-4">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-6">
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Order ID</p>
                                            <p className="font-mono font-bold text-foreground">#{order.id.slice(0, 8)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Date Was Placed</p>
                                            <div className="flex items-center gap-1.5 font-medium text-foreground">
                                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                {new Date(order.created_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm
                                            ${order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                            {order.status === 'delivered' ? <CheckCircle className="h-3.5 w-3.5" /> :
                                                order.status === 'cancelled' ? <XCircle className="h-3.5 w-3.5" /> :
                                                    <Truck className="h-3.5 w-3.5" />}
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Tracking Stepper */}
                                {order.status !== 'cancelled' && (
                                    <div className="mt-8 px-2 md:px-10">
                                        <div className="relative">
                                            {/* Progress Bar Background */}
                                            <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>

                                            {/* Steps */}
                                            <div className="relative flex justify-between">
                                                {['pending', 'processing', 'shipped', 'delivered'].map((step, index) => {
                                                    const currentStepIndex = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status.toLowerCase());
                                                    const isCompleted = index <= currentStepIndex;
                                                    const isCurrent = index === currentStepIndex;

                                                    return (
                                                        <div key={step} className="flex flex-col items-center gap-2">
                                                            <div className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-4 transition-all duration-500
                                                                ${isCompleted ? 'border-primary bg-primary text-primary-foreground scale-110' : 'border-gray-200 bg-white text-gray-300 dark:bg-gray-800 dark:border-gray-700'}`}>
                                                                {isCompleted && <CheckCircle className="h-4 w-4" />}
                                                            </div>
                                                            <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wide transition-colors duration-300
                                                                ${isCurrent ? 'text-primary' : isCompleted ? 'text-primary/70' : 'text-muted-foreground'}`}>
                                                                {step}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                <h4 className="flex items-center gap-2 font-semibold text-lg mb-4">
                                    <Box className="h-5 w-5 text-muted-foreground" />
                                    Items in this order
                                </h4>
                                <div className="space-y-4 divide-y">
                                    {order.items.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between pt-4 first:pt-0">
                                            <div className="flex items-center gap-4">
                                                <div className="h-16 w-16 overflow-hidden rounded-lg border bg-white p-1">
                                                    {item.product.image && item.product.image !== '/placeholder.svg' ? (
                                                        <img src={item.product.image} alt={item.product.name} className="h-full w-full object-contain rounded-md" />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-50 text-xs text-gray-400">
                                                            No Img
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground line-clamp-1">{item.product.name}</p>
                                                    <p className="text-sm text-muted-foreground">Qty: <span className="font-medium text-foreground">{item.quantity}</span></p>
                                                </div>
                                            </div>
                                            <p className="font-bold text-primary">₹{item.price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-6 flex justify-between rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
                                    <span className="font-medium text-muted-foreground">Total Order Amount</span>
                                    <span className="text-xl font-extrabold text-foreground">₹{order.total_amount}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
