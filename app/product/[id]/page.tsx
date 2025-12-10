"use client"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { Plus, Minus } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function ProductPage() {
    const params = useParams()
    const { addItem, items, updateQuantity } = useCart()
    const [product, setProduct] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data, error } = await supabase
                    .from('products')
                    .select('*')
                    .eq('id', params.id)
                    .single()

                if (error) throw error
                setProduct(data)
            } catch (error) {
                console.error('Error fetching product:', error)
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchProduct()
        }
    }, [params.id])

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div>Loading...</div>
                </main>
                <Footer />
            </div>
        )
    }

    if (!product) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Product Not Found</h1>
                        <Button asChild className="mt-4">
                            <Link href="/shop">Back to Shop</Link>
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    const cartItem = items.find((item) => item.id === product.id)
    const quantity = cartItem ? cartItem.quantity : 0

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-12">
                <div className="container px-4 md:px-6">
                    <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
                        <div className="aspect-square rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground text-2xl overflow-hidden">
                            {product.image && product.image !== '/placeholder.svg' ? (
                                <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                                "Image"
                            )}
                        </div>
                        <div className="flex flex-col justify-center space-y-4">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold">{product.name}</h1>
                                <p className="text-lg text-muted-foreground">{product.category}</p>
                            </div>
                            <div className="text-2xl font-bold">₹{product.price}</div>
                            <p className="text-muted-foreground">{product.description}</p>

                            <div className="flex items-center gap-4 pt-4">
                                {quantity === 0 ? (
                                    <Button size="lg" onClick={() => addItem(product)}>
                                        Add to Cart
                                    </Button>
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 rounded-md border p-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => updateQuantity(product.id, quantity - 1)}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <span className="w-8 text-center font-medium">{quantity}</span>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => addItem(product)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <span className="text-sm text-muted-foreground">in cart</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
