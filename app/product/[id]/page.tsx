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
import { dummyProducts } from "@/lib/dummy-data"

export default function ProductPage() {
    const params = useParams()
    const { addItem, items, updateQuantity } = useCart()
    const [product, setProduct] = useState<any>(null)
    const [relatedProducts, setRelatedProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // 1. Check Dummy Data first
                const dummyProduct = dummyProducts.find(p => p.id === params.id)
                if (dummyProduct) {
                    setProduct(dummyProduct)

                    // Dummy Data Related Products
                    const related = dummyProducts
                        .filter(p => p.category_id === dummyProduct.category_id && p.id !== dummyProduct.id)
                        .slice(0, 4)

                    setRelatedProducts(related)
                    return // Exit early
                }

                const { data, error } = await supabase
                    .from('products')
                    .select('*, categories(name)')
                    .eq('id', params.id)
                    .single()

                if (error) throw error
                setProduct(data)

                // Fetch related products
                let relatedItems: any[] = []

                if (data.category_id) {
                    // 1. Try to get products from same category
                    const { data: sameCategory } = await supabase
                        .from('products')
                        .select('*, categories(name)')
                        .eq('category_id', data.category_id)
                        .neq('id', data.id)
                        .limit(4)

                    if (sameCategory) {
                        relatedItems = [...sameCategory]
                    }
                }

                // 2. If we don't have enough, fetch more random products
                if (relatedItems.length < 4) {
                    const limit = 4 - relatedItems.length
                    const existingIds = [data.id, ...relatedItems.map(i => i.id)]

                    const { data: fallbackItems } = await supabase
                        .from('products')
                        .select('*, categories(name)')
                        .not('id', 'in', `(${existingIds.join(',')})`)
                        .limit(limit)

                    if (fallbackItems) {
                        relatedItems = [...relatedItems, ...fallbackItems]
                    }
                }

                setRelatedProducts(relatedItems)
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
                                <p className="text-lg text-muted-foreground">{product.categories?.name || 'Uncategorized'}</p>
                            </div>
                            <div className="text-2xl font-bold">₹{product.price}</div>
                            <p className="text-muted-foreground">{product.description}</p>

                            <div className="flex items-center gap-4 pt-4">
                                {(product.stock !== undefined && product.stock <= 0) ? (
                                    <Button size="lg" disabled className="bg-gray-300 text-gray-500">
                                        Out of Stock
                                    </Button>
                                ) : quantity === 0 ? (
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
                                                disabled={product.stock !== undefined && quantity >= product.stock}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-muted-foreground">in cart</span>
                                            {product.stock !== undefined && product.stock < 10 && (
                                                <span className="text-xs text-red-500">Only {product.stock} left!</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>


                {/* Related Products Section */}
                {
                    relatedProducts.length > 0 && (
                        <div className="container mt-20 px-4 md:px-6">
                            <h2 className="mb-8 text-2xl font-bold">You Might Also Like</h2>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {relatedProducts.map((related) => (
                                    <Link key={related.id} href={`/product/${related.id}`} className="group block">
                                        <div className="rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
                                            <div className="aspect-square w-full overflow-hidden rounded-t-lg bg-gray-100">
                                                {related.image && related.image !== '/placeholder.svg' ? (
                                                    <img
                                                        src={related.image}
                                                        alt={related.name}
                                                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                                        Img
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <h3 className="line-clamp-1 font-semibold group-hover:underline">{related.name}</h3>
                                                <p className="text-sm text-muted-foreground">{related.categories?.name}</p>
                                                <div className="mt-2 font-bold">₹{related.price}</div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )
                }
            </main >
            <Footer />
        </div >
    )
}
