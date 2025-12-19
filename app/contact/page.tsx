"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Mail, MapPin, Phone } from "lucide-react"
import { motion } from "framer-motion"

export default function ContactPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-12 md:py-20 bg-gradient-to-b from-background to-secondary/20">
                <div className="container px-4 md:px-6 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16 space-y-4"
                    >
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Get in Touch</h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            We'd love to hear from you. Our friendly team is always here to chat.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        {/* Contact Info Cards */}
                        <div className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex items-start gap-4 p-6 rounded-2xl bg-white/50 border border-border/50 shadow-sm backdrop-blur-sm"
                            >
                                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                    <Mail className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Email Us</h3>
                                    <p className="text-muted-foreground text-sm mb-2">Our friendly team is here to help.</p>
                                    <a href="mailto:support@guptaji.com" className="text-primary font-medium hover:underline">support@guptaji.com</a>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-start gap-4 p-6 rounded-2xl bg-white/50 border border-border/50 shadow-sm backdrop-blur-sm"
                            >
                                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Visit Us</h3>
                                    <p className="text-muted-foreground text-sm mb-2">Come say hello at our HQ.</p>
                                    <span className="text-foreground font-medium">100 Smith Street<br />Collingwood VIC 3066 AU</span>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-start gap-4 p-6 rounded-2xl bg-white/50 border border-border/50 shadow-sm backdrop-blur-sm"
                            >
                                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                    <Phone className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-1">Call Us</h3>
                                    <p className="text-muted-foreground text-sm mb-2">Mon-Fri from 8am to 5pm.</p>
                                    <a href="tel:+1555000000" className="text-primary font-medium hover:underline">+1 (555) 000-0000</a>
                                </div>
                            </motion.div>
                        </div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-3xl p-8 border border-border shadow-xl shadow-primary/5"
                        >
                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label htmlFor="first-name" className="text-sm font-medium">First name</label>
                                        <input id="first-name" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="First name" required />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="last-name" className="text-sm font-medium">Last name</label>
                                        <input id="last-name" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Last name" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                                    <input id="email" type="email" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="you@example.com" required />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                                    <textarea id="message" className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" placeholder="Leave us a message..." required />
                                </div>
                                <Button className="w-full h-11 text-base rounded-xl" size="lg">Send Message</Button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
