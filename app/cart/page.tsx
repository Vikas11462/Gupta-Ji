"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Plus, Minus, Trash2 } from "lucide-react"
import Link from "next/link"

export default function CartPage() {
    const { items, updateQuantity, removeItem, totalPrice } = useCart()

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-8">
                <div className="container px-4 md:px-6">
                    <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>

                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <p className="mb-4 text-lg text-muted-foreground">Your cart is empty.</p>
                            <Button asChild>
                                <Link href="/shop">Start Shopping</Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-8 lg:grid-cols-3">
                            <div className="lg:col-span-2 space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 rounded-lg border p-4">
                                        <div className="h-20 w-20 shrink-0 rounded-md bg-muted/50" />
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{item.name}</h3>
                                            <p className="text-sm text-muted-foreground">{item.category}</p>
                                            <div className="mt-1 font-bold">₹{item.price}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-8 text-center">{item.quantity}</span>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="h-8 w-8"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Plus className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => removeItem(item.id)}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="rounded-lg border bg-card p-6 shadow-sm h-fit">
                                <h2 className="mb-4 text-lg font-semibold">Order Summary</h2>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>₹{totalPrice}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Delivery</span>
                                        <span>Free</span>
                                    </div>
                                    <div className="my-4 border-t" />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>₹{totalPrice}</span>
                                    </div>
                                </div>
                                <Button className="mt-6 w-full" size="lg" asChild>
                                    <Link href="/checkout">Proceed to Checkout</Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    )
}
