"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { Product, products } from "@/lib/data"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"

export interface CartItem extends Product {
    quantity: number
}

interface CartContextType {
    items: CartItem[]
    addItem: (product: Product) => void
    removeItem: (productId: string) => void
    updateQuantity: (productId: string, quantity: number) => void
    clearCart: () => void
    totalItems: number
    totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const { user } = useAuth()

    // Load from local storage on mount (initial load)
    useEffect(() => {
        const savedCart = localStorage.getItem("cart")
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart))
            } catch (e) {
                console.error("Failed to parse cart", e)
            }
        }
    }, [])

    // Sync with Supabase when user logs in
    useEffect(() => {
        if (!user) return

        const syncCart = async () => {
            // 1. Fetch existing cart from DB (without join, as FK might be missing)
            const { data: dbCart, error } = await supabase
                .from('cart_items')
                .select('*')
                .eq('user_id', user.id)

            if (error) {
                console.error('Error fetching cart:', error.message, error.details, error.hint)
                return
            }

            // 2. Merge local cart with DB cart
            if (dbCart && dbCart.length > 0) {
                const mappedItems = dbCart.map((item: any) => {
                    const product = products.find(p => p.id === item.product_id);
                    if (!product) return null;
                    return {
                        ...product,
                        quantity: item.quantity
                    };
                }).filter((item): item is CartItem => item !== null);

                setItems(mappedItems)
            } else if (items.length > 0) {
                // Push local items to DB
                for (const item of items) {
                    await supabase.from('cart_items').upsert({
                        user_id: user.id,
                        product_id: item.id,
                        quantity: item.quantity
                    })
                }
            }
        }

        syncCart()
    }, [user])

    // Save to local storage AND Supabase on change
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(items))

        const updateDb = async () => {
            if (!user) return

            // This is a naive implementation that might be chatty. 
            // In a real app, you'd debounce this or optimize diffs.
            // For now, we'll just upsert current items.
            // Note: Handling removals is trickier with this simple sync.
            // A better approach for "Live Cart" is to update DB on every action (add/remove) directly.
        }

        // We will handle DB updates in the actions (addItem, removeItem, etc.) for better consistency
    }, [items, user])

    const addItem = async (product: Product) => {
        let newItems: CartItem[];
        const existing = items.find((item) => item.id === product.id)

        if (existing) {
            newItems = items.map((item) =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            )
        } else {
            newItems = [...items, { ...product, quantity: 1 }]
        }

        setItems(newItems)

        // Sync to DB
        if (user) {
            const newItem = newItems.find(i => i.id === product.id)
            if (newItem) {
                await supabase.from('cart_items').upsert({
                    user_id: user.id,
                    product_id: newItem.id,
                    quantity: newItem.quantity
                }, { onConflict: 'user_id, product_id' })
            }
        }
    }

    const removeItem = async (productId: string) => {
        setItems((prev) => {
            const newItems = prev.filter((item) => item.id !== productId)
            return newItems
        })

        if (user) {
            await supabase.from('cart_items').delete().match({ user_id: user.id, product_id: productId })
        }
    }

    const updateQuantity = async (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeItem(productId)
            return
        }
        setItems((prev) => {
            const newItems = prev.map((item) =>
                item.id === productId ? { ...item, quantity } : item
            )
            return newItems
        })

        if (user) {
            await supabase.from('cart_items').upsert({
                user_id: user.id,
                product_id: productId,
                quantity: quantity
            }, { onConflict: 'user_id, product_id' })
        }
    }

    const clearCart = async () => {
        setItems([])
        if (user) {
            await supabase.from('cart_items').delete().eq('user_id', user.id)
        }
    }

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0)
    const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0)

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}
