'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, RefreshCw } from 'lucide-react';

type CartItem = {
    id: string;
    quantity: number;
    product: {
        name: string;
        price: number;
        images: string[];
    };
    user_id: string;
};

type UserCart = {
    userId: string;
    userName: string;
    userEmail: string;
    userPhone?: string;
    items: CartItem[];
    total: number;
};

export default function LiveCartsPage() {
    const [carts, setCarts] = useState<UserCart[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCarts = async () => {
        setLoading(true);
        try {
            // 1. Fetch all cart items
            const { data: cartItems, error: cartError } = await supabase
                .from('cart_items')
                .select('*');

            if (cartError) throw cartError;

            // 2. Get unique user IDs and Product IDs
            const userIds = Array.from(new Set(cartItems?.map((item: any) => item.user_id) || [])) as string[];
            const productIds = Array.from(new Set(cartItems?.map((item: any) => item.product_id) || [])) as string[];

            // 3. Fetch profiles for these users
            let profilesMap: Record<string, any> = {};
            if (userIds.length > 0) {
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, full_name, email, phone')
                    .in('id', userIds);

                if (profilesError) throw profilesError;

                profiles?.forEach(p => {
                    profilesMap[p.id] = p;
                });
            }

            // 4. Fetch products details from DB
            let productsMap: Record<string, any> = {};
            if (productIds.length > 0) {
                const { data: productsData, error: productsError } = await supabase
                    .from('products')
                    .select('id, name, price, image')
                    .in('id', productIds);

                if (productsError) throw productsError;

                productsData?.forEach(p => {
                    productsMap[p.id] = p;
                });
            }

            // 5. Group items by user
            const groupedCarts: Record<string, UserCart> = {};

            cartItems?.forEach((item: any) => {
                const userId = item.user_id;
                const userProfile = profilesMap[userId];

                if (!groupedCarts[userId]) {
                    groupedCarts[userId] = {
                        userId,
                        userName: userProfile?.full_name || 'Unknown User',
                        userEmail: userProfile?.email || 'No Email',
                        userPhone: userProfile?.phone || '',
                        items: [],
                        total: 0
                    };
                }

                // Find product details from DB map
                const product = productsMap[item.product_id];
                const productName = product?.name || 'Unknown Product';
                const productPrice = product?.price || 0;
                const productImages = product?.image ? [product.image] : [];

                const itemTotal = productPrice * item.quantity;

                groupedCarts[userId].items.push({
                    id: item.id,
                    quantity: item.quantity,
                    product: {
                        name: productName,
                        price: productPrice,
                        images: productImages
                    },
                    user_id: userId
                });

                groupedCarts[userId].total += itemTotal;
            });

            setCarts(Object.values(groupedCarts));
        } catch (error: any) {
            console.error('Error fetching live carts:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            console.error('Error message:', error.message);
            console.error('Error hint:', error.hint);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCarts();
    }, []);

    const filteredCarts = carts.filter(cart =>
        cart.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cart.userPhone && cart.userPhone.includes(searchQuery))
    );

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-2xl font-bold">Live Active Carts</h1>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search by Name or Phone"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                        onClick={fetchCarts}
                        className="flex items-center gap-2 rounded-md border bg-white px-4 py-2 hover:bg-gray-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredCarts.map((cart) => (
                    <div key={cart.userId} className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-start justify-between border-b pb-4">
                            <div>
                                <h3 className="font-semibold">{cart.userName}</h3>
                                <p className="text-sm text-gray-500">{cart.userEmail}</p>
                                {cart.userPhone && <p className="text-sm text-gray-500">{cart.userPhone}</p>}
                            </div>
                            <div className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                <ShoppingCart className="h-3 w-3" />
                                {cart.items.length} items
                            </div>
                        </div>

                        <div className="space-y-3">
                            {cart.items.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        {item.quantity}x {item.product.name}
                                    </span>
                                    <span className="font-medium">₹{item.product.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex justify-between border-t pt-4 font-bold">
                            <span>Total Value</span>
                            <span>₹{cart.total}</span>
                        </div>
                    </div>
                ))}

                {filteredCarts.length === 0 && !loading && (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        No active carts found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}
