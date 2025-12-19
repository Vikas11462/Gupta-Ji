import Link from "next/link"

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-muted/20 backdrop-blur-sm">
            <div className="container flex flex-col gap-6 py-10 px-4 md:px-6 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2">
                    <span className="text-xl font-bold text-primary tracking-tight">Gupta Ji Store</span>
                    <p className="text-sm text-muted-foreground max-w-xs">
                        Premium quality products, delivered directly to your doorstep with care.
                    </p>
                </div>
                <div className="flex gap-6 text-sm font-medium text-muted-foreground">
                    <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
                    <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                    <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
                    <Link href="/admin" className="hover:text-primary transition-colors">Admin</Link>
                </div>
                <div className="text-sm text-muted-foreground">
                    &copy; {new Date().getFullYear()} Gupta Ji Store. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
