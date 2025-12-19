import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function TermsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-12 md:py-20">
                <div className="container px-4 md:px-6 max-w-4xl">
                    <h1 className="text-4xl font-bold tracking-tight mb-8">Terms and Conditions</h1>

                    <div className="prose prose-gray max-w-none dark:prose-invert space-y-6 text-muted-foreground">
                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold text-foreground">1. Introduction</h2>
                            <p>
                                Welcome to Gupta Ji Store. By accessing our website and placing an order, you agree to be bound by these terms and conditions.
                                Please read them carefully before making a purchase.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold text-foreground">2. Products and Pricing</h2>
                            <p>
                                All products listed on the store are subject to availability. We reserve the right to discontinue any product at any time.
                                Prices are subject to change without notice. We strive to display accurate colors and images, but cannot guarantee that your monitor's display will be exact.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold text-foreground">3. Orders and Payments</h2>
                            <p>
                                When you place an order, you agree to provide current, complete, and accurate purchase and account information.
                                We reserve the right to refuse any order you place with us.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold text-foreground">4. Shipping and Returns</h2>
                            <p>
                                Shipping times are estimates and not guarantees. We are not responsible for delays caused by shipping carriers.
                                Please review our Return Policy separately for information on returns and exchanges.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold text-foreground">5. Contact Information</h2>
                            <p>
                                Questions about the Terms of Service should be sent to us at support@guptaji.com.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
