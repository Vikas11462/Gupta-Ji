"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/product/product-card"
// import { categories } from "@/lib/data" // Deprecated
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

export default function ShopPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
    const [loadingProducts, setLoadingProducts] = useState(true)
    const { profile, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && profile?.role === 'admin') {
            router.push('/admin')
        }
    }, [profile, loading, router])

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const { data } = await supabase.from('categories').select('*').order('name')
            if (data && data.length > 0) {
                setCategories(data)
            } else {
                setCategories([])
            }
        } catch (e) {
            console.error('Error fetching categories', e)
        }
    }

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name')

            if (error) throw error
            setProducts(data || [])
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoadingProducts(false)
        }
    }

    if (loading || loadingProducts) return <div className="p-8 text-center">Loading...</div>

    const filteredProducts = selectedCategory
        ? products.filter((p) => p.category === selectedCategory)
        : products

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-8">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start">
                        {/* Sidebar / Filter */}
                        <aside className="w-full md:w-64 shrink-0 space-y-4">
                            <h2 className="text-lg font-semibold">Categories</h2>
                            <div className="flex flex-wrap gap-2 md:flex-col">
                                <Button
                                    variant={selectedCategory === null ? "default" : "ghost"}
                                    className="justify-start"
                                    onClick={() => setSelectedCategory(null)}
                                >
                                    All Products
                                </Button>
                                {categories.map((category) => (
                                    <Button
                                        key={category.id}
                                        variant={selectedCategory === category.name ? "default" : "ghost"}
                                        className="justify-start"
                                        onClick={() => setSelectedCategory(category.name)}
                                    >
                                        {category.name}
                                    </Button>
                                ))}
                            </div>
                        </aside>

                        {/* Product Grid */}
                        <div className="flex-1">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold">
                                    {selectedCategory ? selectedCategory : "All Products"}
                                </h1>
                                <p className="text-muted-foreground">
                                    Showing {filteredProducts.length} results
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div className="py-12 text-center text-muted-foreground">
                                    No products found in this category.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
