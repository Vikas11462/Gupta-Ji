"use client"

import { Product } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { Plus, Minus, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface ProductCardProps {
    product: Product
    className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
    const { addItem, items, updateQuantity } = useCart()
    const cartItem = items.find((item) => item.id === product.id)
    const quantity = cartItem ? cartItem.quantity : 0

    return (
        <div className={cn("group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-lg hover:-translate-y-1", className)}>
            <Link href={`/product/${product.id}`}>
                <div className="aspect-square bg-muted relative overflow-hidden">
                    {product.image && product.image !== '/placeholder.svg' ? (
                        <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-secondary/50">
                            Image
                        </div>
                    )}
                    {/* Overlay gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
            </Link>
            <div className="p-4 space-y-3">
                <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{product.category}</p>
                    <Link href={`/product/${product.id}`}>
                        <h3 className="font-semibold leading-tight hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                    </Link>
                </div>

                <div className="flex items-center justify-between pt-1">
                    <span className="text-lg font-bold text-primary">₹{product.price}</span>

                    {quantity === 0 ? (
                        <Button size="sm" onClick={() => addItem(product)} className="rounded-full h-8 px-4 transition-transform active:scale-95">
                            Add <ShoppingCart className="ml-2 h-3.5 w-3.5" />
                        </Button>
                    ) : (
                        <div className="flex items-center gap-1 bg-secondary/50 rounded-full p-0.5 border border-border/50">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-full hover:bg-background"
                                onClick={() => updateQuantity(product.id, quantity - 1)}
                            >
                                <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-medium w-6 text-center tabular-nums">{quantity}</span>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 rounded-full hover:bg-background"
                                onClick={() => addItem(product)}
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
