'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { ArrowLeft, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { products as staticProducts } from '@/lib/data'; // Fallback

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

export default function ProfilePage() {
    const { user, profile, signOut, loading: authLoading } = useAuth();
    const router = useRouter();

    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }

        if (profile && user) {
            setFullName(profile.full_name || '');
            setPhone(profile.phone || '');
            setAddress(profile.address || '');
            fetchOrders(user.id);
        }
    }, [user, profile, authLoading, router]);

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

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            if (!user) throw new Error('No user logged in');

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    phone: phone,
                    address: address,
                })
                .eq('id', user.id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Profile updated successfully!' });

        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    };

    if (authLoading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-8">
            <div className="mb-6">
                <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </div>

            <h1 className="mb-8 text-3xl font-bold">My Profile</h1>

            <div className="rounded-lg border bg-card p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{user.email}</p>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="text-sm font-medium text-red-600 hover:text-red-500"
                    >
                        Sign Out
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label htmlFor="fullName" className="mb-2 block text-sm font-medium">
                            Full Name
                        </label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Enter your full name"
                        />
                    </div>

                    <div>
                        <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                            Phone Number
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Enter your phone number"
                        />
                    </div>

                    <div>
                        <label htmlFor="address" className="mb-2 block text-sm font-medium">
                            Delivery Address
                        </label>
                        <textarea
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Enter your full delivery address"
                        />
                    </div>

                    {message && (
                        <div className={`rounded-md p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>

            {/* Order History Section */}
            <div className="mt-12">
                <h2 className="mb-6 text-2xl font-bold">Order History</h2>

                {loadingOrders ? (
                    <div className="text-center text-gray-500">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="rounded-lg border bg-gray-50 p-8 text-center text-gray-500">
                        <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                        <p>You haven't placed any orders yet.</p>
                        <Link href="/" className="mt-4 inline-block text-primary hover:underline">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="overflow-hidden rounded-lg border bg-white shadow-sm">
                                <div className="border-b bg-gray-50 px-6 py-4">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Order ID</p>
                                                <p className="font-mono font-medium">#{order.id.slice(0, 8)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Date</p>
                                                <div className="flex items-center gap-1 font-medium">
                                                    <Clock className="h-3 w-3 text-gray-400" />
                                                    {new Date(order.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium capitalize 
                                                ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                        'bg-blue-100 text-blue-700'}`}>
                                                {order.status === 'delivered' ? <CheckCircle className="h-3 w-3" /> :
                                                    order.status === 'cancelled' ? <XCircle className="h-3 w-3" /> :
                                                        <Clock className="h-3 w-3" />}
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    {item.product.image && item.product.image !== '/placeholder.svg' ? (
                                                        <div className="h-12 w-12 overflow-hidden rounded-md border">
                                                            <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-400">
                                                            Img
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-medium">{item.product.name}</p>
                                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                <p className="font-medium">₹{item.price * item.quantity}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 flex justify-between border-t pt-4">
                                        <span className="font-semibold">Total Amount</span>
                                        <span className="text-lg font-bold">₹{order.total_amount}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
