'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import { products } from '@/lib/data';

type OrderItem = {
    id: string;
    quantity: number;
    price: number;
    product: {
        name: string;
    };
};

type Order = {
    id: string;
    created_at: string;
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    total_amount: number;
    status: string;
    items?: OrderItem[];
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            // Fetch orders with items (cannot join products due to missing FK)
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
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map product details from local data
            const ordersWithProducts = data?.map((order: any) => ({
                ...order,
                items: order.items?.map((item: any) => {
                    const product = products.find(p => p.id === item.product_id);
                    return {
                        ...item,
                        product: {
                            name: product?.name || 'Unknown Product'
                        }
                    };
                })
            }));

            setOrders(ordersWithProducts || []);
        } catch (err: any) {
            console.error('Error fetching orders:', err);
            setError(err.message || 'Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: string, newStatus: string) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId);

        if (error) {
            alert('Failed to update status');
        } else {
            fetchOrders(); // Refresh
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return 'bg-green-100 text-green-700';
            case 'shipped': return 'bg-blue-100 text-blue-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    if (loading) return <div className="p-8">Loading orders...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Orders Management</h1>

            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex flex-col justify-between gap-4 border-b pb-4 md:flex-row md:items-center">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-lg">Order #{order.id.slice(0, 8)}</span>
                                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    value={order.status}
                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                    className="rounded-md border p-2 text-sm"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-700">Customer Details</h3>
                                <div className="text-sm text-gray-600">
                                    <p><span className="font-medium">Name:</span> {order.customer_name}</p>
                                    <p><span className="font-medium">Phone:</span> {order.customer_phone}</p>
                                    <p><span className="font-medium">Address:</span> {order.customer_address}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="mb-2 font-semibold text-gray-700">Order Items</h3>
                                <div className="space-y-2">
                                    {order.items?.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span>{item.quantity}x {item.product?.name || 'Unknown Product'}</span>
                                            <span className="font-medium">₹{item.price * item.quantity}</span>
                                        </div>
                                    ))}
                                    <div className="mt-2 border-t pt-2 flex justify-between font-bold">
                                        <span>Total Amount</span>
                                        <span>₹{order.total_amount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {orders.length === 0 && (
                    <div className="py-12 text-center text-gray-500">
                        No orders found.
                    </div>
                )}
            </div>
        </div>
    );
}
