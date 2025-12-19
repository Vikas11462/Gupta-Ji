import { useState, useEffect } from "react"
import { Product } from "@/lib/data"
import { ProductCard } from "./product-card"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"
import { Sparkles, TrendingUp } from "lucide-react"

export function FeaturedProducts() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                // Fetch random 4 products for "Trending"
                // In a real app, you might have a 'is_featured' flag or order by sales
                const { data } = await supabase
                    .from('products')
                    .select('*, categories(name)')
                    .limit(8)

                if (data) {
                    // Shuffle array to simulate "trending" randomness
                    const shuffled = data.sort(() => 0.5 - Math.random())
                    setProducts(shuffled.slice(0, 4))
                }
            } catch (error) {
                console.error('Error fetching featured:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchFeatured()
    }, [])

    if (loading) return null

    return (
        <section className="py-20 relative overflow-hidden">
            {/* Decorative Background Blobs */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 w-[400px] h-[400px] bg-accent/30 rounded-full blur-3xl -z-10" />

            <div className="container px-4 md:px-6">
                <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-2 text-primary font-medium tracking-wide text-sm uppercase">
                            <TrendingUp className="h-4 w-4" />
                            <span>Hot Right Now</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                            Trending <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Products</span>
                        </h2>
                        <p className="text-muted-foreground max-w-lg text-lg">
                            The most coveted items of the season, picked just for you.
                        </p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <ProductCard product={product} className="h-full bg-white/50 backdrop-blur-sm border-white/20 hover:border-primary/20" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
