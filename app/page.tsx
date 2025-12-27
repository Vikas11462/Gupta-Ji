"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, ShoppingBag, Star, Smartphone, Laptop, Headphones, Car, Bike, Watch, Speaker, Zap, Home as HomeIcon, Wrench } from "lucide-react"
import { FeaturedProducts } from "@/components/product/featured-products"


import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { motion } from "framer-motion"

export default function Home() {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  useEffect(() => {
    if (!loading && profile?.role === 'admin') {
      router.push('/admin')
    }
  }, [profile, loading, router])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  // Helper to get icon based on category name
  // Helper to get icon based on category name
  const getCategoryIcon = (name: string) => {
    const lowerName = name.toLowerCase();

    // Electronics
    if (lowerName.includes('phone') || lowerName.includes('mobile')) return <Smartphone className="h-8 w-8 text-blue-500" />;
    if (lowerName.includes('laptop') || lowerName.includes('computer')) return <Laptop className="h-8 w-8 text-slate-700" />;
    if (lowerName.includes('audio') || lowerName.includes('headphone') || lowerName.includes('ear')) return <Headphones className="h-8 w-8 text-violet-500" />;
    if (lowerName.includes('smart') || lowerName.includes('watch')) return <Watch className="h-8 w-8 text-amber-500" />;
    if (lowerName.includes('speaker') || lowerName.includes('sound')) return <Speaker className="h-8 w-8 text-indigo-500" />;

    // Auto (Car/Bike)
    if (lowerName.includes('car') || lowerName.includes('auto')) return <Car className="h-8 w-8 text-red-500" />;
    if (lowerName.includes('bike') || lowerName.includes('motor')) return <Bike className="h-8 w-8 text-orange-500" />;
    if (lowerName.includes('tool') || lowerName.includes('repair')) return <Wrench className="h-8 w-8 text-gray-500" />;

    // Household
    if (lowerName.includes('home') || lowerName.includes('decor')) return <HomeIcon className="h-8 w-8 text-teal-500" />;
    if (lowerName.includes('electric') || lowerName.includes('power')) return <Zap className="h-8 w-8 text-yellow-500" />;

    return <ShoppingBag className="h-8 w-8 text-primary" />;
  }



  if (loading) return null

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 relative">
        {/* Hero Section */}
        {/* Premium Hero Section */}
        <section className="relative overflow-hidden pt-10 pb-20 md:pt-16 md:pb-32 lg:pb-40">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl opacity-60 translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-accent blur-3xl opacity-60 -translate-x-1/3 translate-y-1/4" />

          <div className="container px-4 md:px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left: Content */}
              <div className="flex flex-col items-start space-y-8 text-left">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="space-y-6 max-w-2xl"
                >
                  <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary backdrop-blur-sm shadow-sm">
                    <Star className="mr-2 h-3.5 w-3.5 fill-primary" />
                    Top Rated Tech & Accessories
                  </div>

                  <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-7xl leading-[1.1]">
                    Upgrade Your <br />
                    <span className="text-primary">Lifestyle</span> Today.
                  </h1>

                  <p className="text-lg text-muted-foreground md:text-xl leading-relaxed max-w-lg">
                    Discover premium electronics, car essentials, and smart home gadgets at unbeaten prices.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
                >
                  <Button asChild size="lg" className="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-105 active:scale-95 duration-300">
                    <Link href="/shop">
                      Start Shopping Now
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild className="h-14 px-10 text-lg rounded-full border-2 hover:bg-secondary/50 transition-all">
                    <Link href="/about">
                      View Offers
                    </Link>
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="flex items-center gap-6 text-sm font-medium text-muted-foreground pt-4"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Free Delivery
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    24/7 Support
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    Secure Payment
                  </div>
                </motion.div>

              </div>

              {/* Right: Visual */}
              <motion.div
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative hidden lg:block"
              >
                <div className="relative h-[600px] w-full max-w-[600px] mx-auto">
                  {/* Main Hero Image */}
                  <div className="relative z-10 drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500 ease-in-out">
                    <Image
                      src="/hero-electronics.png"
                      alt="Electronics and Gadgets Collection"
                      width={800}
                      height={800}
                      className="object-contain"
                      priority
                    />
                  </div>
                  {/* Floating Elements (Optional decorative circles behind) */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-tr from-primary/20 to-accent rounded-full blur-2xl -z-0" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured / Trending Section */}
        {/* <FeaturedProducts /> */}

        {/* Shop by Category Section */}
        {/* <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex items-end justify-between mb-8">
              <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Shop by Category</h2>
                <p className="text-muted-foreground">Find what you're looking for</p>
              </div>
              <Link href="/shop" className="group hidden md:inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                View All Categories
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
              {loadingCategories ? (
                // Skeleton loading state
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse border border-border/50" />
                ))
              ) : (
                categories.map((category, index) => (
                  <Link key={category.id} href={`/shop?category_id=${category.id}`}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ y: -5, scale: 1.02 }}
                      className="group flex flex-col items-center justify-center p-4 h-full aspect-square rounded-2xl border border-transparent bg-white shadow-sm hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />

                      <div className="mb-3 p-4 bg-secondary/50 rounded-full group-hover:scale-110 transition-transform duration-300 z-10">
                        {getCategoryIcon(category.name)}
                      </div>
                      <span className="font-medium text-center text-sm md:text-base line-clamp-2 z-10 text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </span>
                    </motion.div>
                  </Link>
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
        </section> */}
      </main>
      <Footer />
    </div>
  )
}
