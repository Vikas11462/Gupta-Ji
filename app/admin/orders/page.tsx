'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, CheckCircle, Clock, XCircle } from 'lucide-react';

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
    const [searchQuery, setSearchQuery] = useState('');

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        // ... existing fetch logic is fine, we filter locally
        try {
            // 1. Fetch orders
            const { data: dbOrders, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            // 2. Fetch Order Items manually (avoiding join issues)
            const orderIds = dbOrders?.map((o: any) => o.id) || [];
            const validOrderIds = orderIds.filter((id: string) =>
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
            );

            let orderItems: any[] = [];

            if (validOrderIds.length > 0) {
                const { data: itemsData, error: itemsError } = await supabase
                    .from('order_items')
                    .select('*')
                    .in('order_id', validOrderIds);

                if (itemsError) throw itemsError;
                orderItems = itemsData || [];
            }

            // 3. Collect Product IDs from items
            const productIds = new Set<string>();
            orderItems.forEach((item: any) => {
                if (item.product_id) productIds.add(item.product_id);
            });

            // 4. Fetch Products
            const validProductIds = Array.from(productIds).filter(id =>
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
            );

            let productsMap: Record<string, any> = {};
            if (validProductIds.length > 0) {
                const { data: productsData, error: productsError } = await supabase
                    .from('products')
                    .select('id, name')
                    .in('id', validProductIds);

                if (productsError) throw productsError;

                productsData?.forEach(p => {
                    productsMap[p.id] = p;
                });
            }

            // 5. Map everything together
            const ordersWithDetails = dbOrders?.map((order: any) => {
                // Find items for this order
                const myItems = orderItems.filter((item: any) => item.order_id === order.id);

                // Map product details to items
                const myItemsWithProducts = myItems.map((item: any) => {
                    const product = productsMap[item.product_id];
                    return {
                        ...item,
                        product: {
                            name: product?.name || 'Unknown Product'
                        }
                    };
                });

                return {
                    ...order,
                    items: myItemsWithProducts
                };
            });

            setOrders(ordersWithDetails || []);


        } catch (err: any) {
            console.error('Error fetching orders:', err, err.message);
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

    const filteredOrders = orders.filter(order => {
        const query = searchQuery.toLowerCase();
        return (
            order.id.toLowerCase().includes(query) ||
            order.customer_name?.toLowerCase().includes(query) ||
            order.customer_phone?.includes(query)
        );
    });

    if (loading) return <div className="p-8">Loading orders...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-2xl font-bold">Orders Management</h1>
                <div className="w-full md:w-auto">
                    <input
                        type="text"
                        placeholder="Search Order ID, Name, or Phone"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary md:w-80"
                    />
                </div>
            </div>

            <div className="space-y-4">
                {filteredOrders.map((order) => (
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

                {filteredOrders.length === 0 && (
                    <div className="py-12 text-center text-gray-500">
                        {searchQuery ? 'No orders found matching your search.' : 'No orders found.'}
                    </div>
                )}
            </div>
        </div>
    );
}
