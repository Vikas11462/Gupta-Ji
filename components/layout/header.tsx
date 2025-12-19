"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ShoppingCart, Search, Menu, User, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/lib/supabase"

export function Header() {
    const { totalItems } = useCart()
    const { user, signOut, profile } = useAuth()
    const pathname = usePathname()
    const router = useRouter()

    const [query, setQuery] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showResults, setShowResults] = useState(false)

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length > 0) {
                setIsSearching(true)
                setShowResults(true)
                try {
                    const { data } = await supabase
                        .from('products')
                        .select('id, name, price, image_url')
                        .ilike('name', `%${query}%`)
                        .limit(5)

                    setResults(data || [])
                } catch (error) {
                    console.error('Search error:', error)
                } finally {
                    setIsSearching(false)
                }
            } else {
                setResults([])
                setShowResults(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const handleSearch = () => {
        if (!query.trim()) return
        setShowResults(false)
        router.push(`/shop?search=${encodeURIComponent(query)}`)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    const isActive = (path: string) => pathname === path ? "bg-primary/10 text-primary" : "hover:bg-primary/10 hover:text-primary"



    return (
        <header className="sticky top-0 z-50 w-full border-t-4 border-primary border-b border-border/40 bg-white/80 backdrop-blur-xl shadow-sm supports-[backdrop-filter]:bg-white/60 dark:bg-black/50 dark:border-white/10">
            <div className="container flex h-16 md:h-20 items-center justify-between px-4 md:px-6 transition-all">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                    <Link href={profile?.role === 'admin' ? "/admin" : "/"} className="flex items-center gap-2 group">
                        <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
                            G
                        </div>
                        <span className="text-xl font-bold tracking-tight text-primary group-hover:text-primary/80 transition-colors">Gupta Ji</span>
                    </Link>
                </div>

                <div className="hidden flex-1 items-center justify-center px-6 md:flex">
                    <div className="relative w-full max-w-lg group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-10" />
                        <input
                            type="search"
                            placeholder="What are you looking for today?"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => { if (query) setShowResults(true) }}
                            // onBlur={() => setTimeout(() => setShowResults(false), 200)} // Delayed hide to allow clicking
                            className="h-12 w-full rounded-2xl border-2 border-transparent bg-secondary/50 px-12 py-2 text-sm shadow-inner transition-all 
                                     placeholder:text-muted-foreground/70
                                     focus-visible:outline-none focus-visible:border-primary/20 focus-visible:bg-background focus-visible:shadow-lg focus-visible:shadow-primary/5"
                        />

                        {/* Search Results Dropdown */}
                        {showResults && (query.trim().length > 0) && (
                            <>
                                <div
                                    className="fixed inset-0 z-0 bg-transparent"
                                    onClick={() => setShowResults(false)}
                                />
                                <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-border/50 bg-white/95 backdrop-blur-md shadow-xl overflow-hidden z-20 dark:bg-zinc-900/95">
                                    {isSearching ? (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            Searching...
                                        </div>
                                    ) : results.length > 0 ? (
                                        <ul className="max-h-[300px] overflow-y-auto py-2">
                                            {results.map((product) => (
                                                <li key={product.id}>
                                                    <Link
                                                        href={`/product/${product.id}`}
                                                        className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors cursor-pointer group/item"
                                                        onClick={() => {
                                                            setShowResults(false)
                                                            setQuery("")
                                                        }}
                                                    >
                                                        {product.image_url ? (
                                                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border/50">
                                                                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                                                            </div>
                                                        ) : (
                                                            <div className="h-10 w-10 shrink-0 rounded-md bg-secondary flex items-center justify-center text-xs text-muted-foreground">
                                                                IMG
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-foreground group-hover/item:text-primary transition-colors line-clamp-1">{product.name}</span>
                                                            <span className="text-xs text-muted-foreground">₹{product.price}</span>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                            <li className="border-t border-border/50 mt-1">
                                                <button
                                                    className="w-full px-4 py-3 text-sm text-primary font-medium hover:bg-primary/5 transition-colors text-left"
                                                    onClick={handleSearch}
                                                >
                                                    See all results for "{query}"
                                                </button>
                                            </li>
                                        </ul>
                                    ) : (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            No products found.
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </Button>
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary transition-colors">
                            <ShoppingCart className="h-6 w-6" />
                            {totalItems > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground animate-in zoom-in ring-2 ring-background">
                                    {totalItems}
                                </span>
                            )}
                            <span className="sr-only">Cart</span>
                        </Button>
                    </Link>
                    {user ? (
                        <div className="flex items-center gap-1">
                            <Link href="/orders">
                                <Button variant="ghost" size="icon" title="My Orders" className={`${isActive('/orders')} transition-colors`}>
                                    <Package className="h-6 w-6" />
                                    <span className="sr-only">My Orders</span>
                                </Button>
                            </Link>
                            <Link href="/profile">
                                <Button variant="ghost" size="icon" title="My Profile" className={`${isActive('/profile')} transition-colors`}>
                                    <User className="h-6 w-6" />
                                    <span className="sr-only">My Profile</span>
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button variant="default" size="default" className="rounded-full px-6 font-semibold shadow-md hover:shadow-lg shadow-primary/20 transition-all">
                                Login
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
