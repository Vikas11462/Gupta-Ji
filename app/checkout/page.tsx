'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { supabase } from '@/lib/supabase';

export default function CheckoutPage() {
    const { user, loading } = useAuth();
    const { items, totalPrice: total, clearCart } = useCart();
    const router = useRouter();
    const [placingOrder, setPlacingOrder] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login?redirect=/checkout');
        }
    }, [user, loading, router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async () => {
        if (!user) return;

        // Validation
        if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
            setError('Please fill in all customer details (Name, Phone, Address).');
            return;
        }

        setPlacingOrder(true);
        setError(null);

        try {
            console.log('Attempting to place order...');

            const orderPayload = {
                user_id: user.id,
                total_amount: total,
                status: 'pending',
                payment_method: 'cod',
                created_at: new Date().toISOString(),
                // Store customer details in the order
                // Note: Ensure your 'orders' table has these columns or a 'metadata' jsonb column.
                // If not, you might need to adjust this part. 
                // For now, we'll assume we can pass them or they are just for validation.
                // Ideally, we should save them. Let's try to save them in a metadata column if specific columns don't exist,
                // or just pass them and see if Supabase accepts them (if columns exist).
                // Given I can't check schema easily, I'll assume standard columns or 'shipping_address' etc.
                // Let's use a 'shipping_info' jsonb column if possible, or just individual columns.
                // SAFE BET: Try to insert into specific columns if they exist, otherwise we might error.
                // BUT, since I can't migrate DB, I will assume the user wants me to just VALIDATE for now,
                // OR I will try to save them.
                // Let's try to save them as 'shipping_address' (combining all) or similar.
                // Actually, let's just use a metadata object for safety if we are unsure of schema.
                // Wait, the user said "verify those befor order they must be filled".
                // I will add them to the insert payload. If it fails, I'll know.
                // customized fields
                customer_name: formData.name,
                customer_phone: formData.phone,
                customer_address: formData.address
            };

            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert([
                    {
                        user_id: user.id,
                        total_amount: total,
                        status: 'pending',
                        payment_method: 'cod',
                        created_at: new Date().toISOString(),
                        // customized fields
                        customer_name: formData.name,
                        customer_phone: formData.phone,
                        customer_address: formData.address
                    },
                ])
                .select()
                .single();

            if (orderError) throw orderError;

            // Insert Order Items
            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                price: item.price
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            clearCart();
            router.push('/');
        } catch (err: any) {
            console.error('Error placing order:', err);
            setError(err.message || 'Failed to place order. Please try again.');
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (!user) return null;

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="mb-4 text-2xl font-bold">Your cart is empty</h1>
                <p className="text-gray-600">Add some items to your cart to proceed to checkout.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
            <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                    {/* Customer Details Form */}
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">Customer Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="mb-1 block text-sm font-medium">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border p-2"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div>
                                <label htmlFor="phone" className="mb-1 block text-sm font-medium">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border p-2"
                                    placeholder="Enter your phone number"
                                />
                            </div>
                            <div>
                                <label htmlFor="address" className="mb-1 block text-sm font-medium">Delivery Address</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full rounded-md border p-2"
                                    rows={3}
                                    placeholder="Enter your full address"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
                        {items.map((item) => (
                            <div key={item.id} className="mb-4 flex justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                </div>
                                <p className="font-medium">₹{item.price * item.quantity}</p>
                            </div>
                        ))}
                        <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
                            <span>Total</span>
                            <span>₹{total}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="mb-4 text-xl font-semibold">Payment Method</h2>
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <div className="flex items-center space-x-2">
                            <input type="radio" id="cod" name="payment" defaultChecked className="h-4 w-4" />
                            <label htmlFor="cod" className="font-medium">Cash on Delivery</label>
                        </div>

                        {error && (
                            <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handlePlaceOrder}
                            disabled={placingOrder}
                            className="mt-6 w-full rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            {placingOrder ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
