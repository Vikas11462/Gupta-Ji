"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, ShoppingBag, Star } from "lucide-react"

import { ProductCard } from "@/components/product/product-card"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"

export default function Home() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    if (!loading && profile?.role === 'admin') {
      router.push('/admin')
    }
  }, [profile, loading, router])

  useEffect(() => {
    fetchFeaturedProducts()
  }, [])

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('popular', true)
        .limit(4)

      if (error) throw error
      setFeaturedProducts(data || [])
    } catch (error) {
      console.error('Error fetching featured products:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  if (loading) return null

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 relative">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 md:py-32 lg:py-40">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4 max-w-3xl"
              >
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm">
                  <Star className="mr-2 h-3.5 w-3.5 fill-primary" />
                  Premium Quality Delivered
                </div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
                  Skip the Rush, <br />
                  <span className="text-gradient">Order Online</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-2xl/relaxed">
                  Experience the future of shopping with Gupta Jii Store.
                  Premium products, instant delivery, and a seamless experience.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 min-w-[200px]"
              >
                <Button asChild size="lg" className="h-12 px-8 text-lg rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                  <Link href="/shop">
                    Start Shopping <ShoppingBag className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild className="h-12 px-8 text-lg rounded-full backdrop-blur-sm bg-background/50">
                  <Link href="/about">
                    Our Story
                  </Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex items-end justify-between mb-12">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Trending Now</h2>
                <p className="text-muted-foreground">Curated selection of our most popular items</p>
              </div>
              <Link href="/shop" className="group hidden md:inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                View All Products
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {loadingProducts ? (
                // Skeleton loading state
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <div className="aspect-square rounded-xl bg-muted animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                      <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
                    </div>
                  </div>
                ))
              ) : (
                featuredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))
              )}
            </div>

            <div className="mt-8 text-center md:hidden">
              <Button variant="ghost" asChild>
                <Link href="/shop">
                  View All Products <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
