"use client"

import Link from "next/link"
import { ShoppingCart, Search, Menu, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"

export function Header() {
    const { totalItems } = useCart()
    const { user, signOut, profile } = useAuth()

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle menu</span>
                    </Button>
                    <Link href={profile?.role === 'admin' ? "/admin" : "/"} className="flex items-center gap-2 group">
                        <span className="text-xl font-bold tracking-tight text-primary group-hover:text-primary/80 transition-colors">Gupta Jii</span>
                    </Link>
                </div>

                <div className="hidden flex-1 items-center justify-center px-6 md:flex">
                    <div className="relative w-full max-w-md group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="search"
                            placeholder="Search products..."
                            className="h-10 w-full rounded-full border border-input bg-secondary/50 px-10 py-2 text-sm shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:bg-background disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Search className="h-5 w-5" />
                        <span className="sr-only">Search</span>
                    </Button>
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary">
                            <ShoppingCart className="h-5 w-5" />
                            {totalItems > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground animate-in zoom-in">
                                    {totalItems}
                                </span>
                            )}
                            <span className="sr-only">Cart</span>
                        </Button>
                    </Link>
                    {user ? (
                        <Link href="/profile">
                            <Button variant="ghost" size="icon" title="My Profile" className="hover:bg-primary/10 hover:text-primary">
                                <User className="h-5 w-5" />
                                <span className="sr-only">My Profile</span>
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <Button variant="default" size="sm" className="rounded-full px-6">
                                Login
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    )
}
