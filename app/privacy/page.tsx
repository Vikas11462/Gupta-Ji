import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function PrivacyPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-12 md:py-20">
                <div className="container px-4 md:px-6 max-w-4xl">
                    <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>

                    <div className="prose prose-gray max-w-none dark:prose-invert space-y-6 text-muted-foreground">
                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
                            <p>
                                We collect information you provide directly to us, such as when you create an account, update your profile, place an order, or communicate with us.
                                This may include your name, email address, phone number, and shipping address.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
                            <p>
                                We use the information we collect to provide, maintain, and improve our services, including processing transactions,
                                sending you order confirmations, and responding to your comments and questions.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold text-foreground">3. Sharing of Information</h2>
                            <p>
                                We do not share your personal information with third parties except as described in this policy, such as with vendors
                                who need access to such information to carry out work on our behalf (e.g., shipping providers).
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-xl font-semibold text-foreground">4. Data Security</h2>
                            <p>
                                We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                            </p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
