"use client"

import Link from "next/link"
import { ShoppingCart, Search, Menu, User, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"

export function Header() {
    const { totalItems } = useCart()
    const { user, signOut, profile } = useAuth()

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
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="search"
                            placeholder="What are you looking for today?"
                            className="h-12 w-full rounded-2xl border-2 border-transparent bg-secondary/50 px-12 py-2 text-sm shadow-inner transition-all 
                                     placeholder:text-muted-foreground/70
                                     focus-visible:outline-none focus-visible:border-primary/20 focus-visible:bg-background focus-visible:shadow-lg focus-visible:shadow-primary/5"
                        />
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
                                <Button variant="ghost" size="icon" title="My Orders" className="hover:bg-primary/10 hover:text-primary transition-colors">
                                    <Package className="h-6 w-6" />
                                    <span className="sr-only">My Orders</span>
                                </Button>
                            </Link>
                            <Link href="/profile">
                                <Button variant="ghost" size="icon" title="My Profile" className="hover:bg-primary/10 hover:text-primary transition-colors">
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
