"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
// import { categories } from "@/lib/data" // Deprecated
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AddProductPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [categories, setCategories] = useState<string[]>([])
    const [newCategory, setNewCategory] = useState('')
    const [isAddingCategory, setIsAddingCategory] = useState(false)

    useEffect(() => {
        const fetchCategories = async () => {
            const { data } = await supabase.from('categories').select('name').order('name')
            if (data) {
                setCategories(data.map(c => c.name))
            } else {
                // Fallback
                console.warn('No categories found')
                setCategories([])
            }
        }
        fetchCategories()
    }, [])

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return

        try {
            const name = newCategory.trim()
            const { error } = await supabase.from('categories').insert([{ name }])

            if (error && error.code !== '23505') throw error

            setCategories(prev => [...prev.filter(c => c !== name), name].sort())
            setIsAddingCategory(false)
            setNewCategory('')

            // Auto-select this category
            const select = document.getElementById('category') as HTMLSelectElement
            if (select) select.value = name
        } catch (err: any) {
            alert('Error adding category: ' + err.message)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        const price = parseFloat(formData.get('price') as string)
        const category = formData.get('category') as string
        const description = formData.get('description') as string

        // Default values for now
        const newProduct = {
            name,
            price,
            category,
            description,
            stock: 100,
            image: '/placeholder.svg',
            popular: false
        }

        try {
            const { error } = await supabase
                .from('products')
                .insert([newProduct])

            if (error) throw error

            alert("Product added successfully!")
            router.push("/admin")
        } catch (error: any) {
            console.error('Error adding product:', error)
            alert('Error adding product: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 py-8">
                <div className="container px-4 md:px-6 max-w-2xl">
                    <div className="mb-8">
                        <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                            <Link href="/admin">
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                            </Link>
                        </Button>
                        <h1 className="text-3xl font-bold">Add New Product</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border p-6 shadow-sm">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium">Product Name</label>
                            <input
                                id="name"
                                name="name"
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="e.g. Basmati Rice"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="price" className="text-sm font-medium">Price (₹)</label>
                                <input
                                    id="price"
                                    name="price"
                                    type="number"
                                    required
                                    min="0"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="category" className="text-sm font-medium">Category</label>
                                {isAddingCategory ? (
                                    <div className="flex gap-2">
                                        <input
                                            value={newCategory}
                                            onChange={e => setNewCategory(e.target.value)}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            placeholder="New Category"
                                            autoFocus
                                        />
                                        <Button type="button" onClick={handleAddCategory} size="sm" className="bg-green-600 hover:bg-green-700">Save</Button>
                                        <Button type="button" variant="outline" onClick={() => setIsAddingCategory(false)} size="sm">Cancel</Button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <select
                                            id="category"
                                            name="category"
                                            required
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            onChange={(e) => {
                                                if (e.target.value === 'NEW') {
                                                    setIsAddingCategory(true)
                                                    e.target.value = ''
                                                }
                                            }}
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                            <option value="NEW" className="font-semibold text-blue-600">+ Add New Category</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Product description..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product Image</label>
                            <div className="flex items-center justify-center rounded-md border border-dashed p-8 text-muted-foreground">
                                <p>Image Upload Coming Soon</p>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Adding..." : "Add Product"}
                        </Button>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    )
}
