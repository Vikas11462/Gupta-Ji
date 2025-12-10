'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Pencil, Trash2, Plus, X, Upload, FileJson } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { products as initialProducts } from '@/lib/data';

type Product = {
    id: string;
    name: string;
    description: string;
    price: number;
    price_2?: number;
    price_3?: number;
    stock: number;
    category: string;
    image: string;
    popular: boolean;
};

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state for new product
    const [newProduct, setNewProduct] = useState<Partial<Product>>({
        name: '',
        description: '',
        price: 0,
        price_2: 0,
        price_3: 0,
        stock: 0,
        category: '',
        image: '/placeholder.svg',
        popular: false
    });

    const [isBulkAdding, setIsBulkAdding] = useState(false);
    const [bulkJson, setBulkJson] = useState('');
    const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
    const [uploadingImage, setUploadingImage] = useState(false);

    // Categories state
    const [categories, setCategories] = useState<string[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('name')
                .order('name');

            if (error) {
                // If table doesn't exist or other error, we'll stick to defaults but log it
                console.warn('Could not fetch categories (table might be missing?):', error.message);
                return;
            }

            if (data && data.length > 0) {
                setCategories(data.map(c => c.name));
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;

        try {
            const categoryName = newCategory.trim();
            // Optimistic update
            if (!categories.includes(categoryName)) {
                setCategories(prev => [...prev, categoryName].sort());
            }

            // Try to save to DB
            const { error } = await supabase
                .from('categories')
                .insert([{ name: categoryName }]);

            if (error) {
                console.error('Error saving category to DB:', error.message);
                // If specific error (e.g. duplicate), handle it? For now just alert if fails bad
                if (error.code !== '23505') { // 23505 is unique violation, which is fine as we handled it
                    alert('Failed to save category to database. It is added locally for now.');
                }
            }

            // Select the new category
            if (isAddingProduct) {
                setNewProduct(prev => ({ ...prev, category: categoryName }));
            } else if (editingProduct) {
                setEditingProduct(prev => ({ ...editingProduct, category: categoryName }));
            }

            setIsAddingCategory(false);
            setNewCategory('');
        } catch (err: any) {
            alert('Error adding category: ' + err.message);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        setUploadingImage(true);
        try {
            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            if (isAddingProduct) {
                setNewProduct(prev => ({ ...prev, image: data.publicUrl }));
            } else if (editingProduct) {
                setEditingProduct(prev => prev ? ({ ...prev, image: data.publicUrl }) : null);
            }
        } catch (error: any) {
            alert('Error uploading image: ' + error.message);
        } finally {
            setUploadingImage(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name');

            if (error) throw error;
            setProducts(data || []);
        } catch (err: any) {
            console.error('Error fetching products:', err);
            setError(err.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleSeedProducts = async () => {
        if (!confirm('This will upload all default products to the database. Continue?')) return;

        setLoading(true);
        try {
            // Transform local products to match DB schema
            const dbProducts = initialProducts.map(p => ({
                name: p.name,
                description: p.description,
                price: p.price,
                category: p.category,
                image: p.image,
                popular: p.popular,
                stock: 100 // Default stock
            }));

            const { error } = await supabase
                .from('products')
                .insert(dbProducts);

            if (error) throw error;

            alert('Products uploaded successfully!');
            fetchProducts();
        } catch (err: any) {
            alert('Error uploading products: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const parsedData = JSON.parse(bulkJson);
            if (!Array.isArray(parsedData)) throw new Error('Input must be a JSON array');

            const { error } = await supabase
                .from('products')
                .insert(parsedData);

            if (error) throw error;

            alert('Bulk products added successfully!');
            setIsBulkAdding(false);
            setBulkJson('');
            fetchProducts();
        } catch (err: any) {
            alert('Error adding bulk products: ' + err.message);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase
            .from('products')
            .insert([newProduct]);

        if (error) {
            alert('Error adding product: ' + error.message);
        } else {
            setIsAddingProduct(false);
            setNewProduct({
                name: '',
                description: '',
                price: 0,
                price_2: 0,
                price_3: 0,
                stock: 0,
                category: '',
                image: '/placeholder.svg',
                popular: false
            });
            fetchProducts();
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        const { error } = await supabase
            .from('products')
            .update({
                name: editingProduct.name,
                description: editingProduct.description,
                price: editingProduct.price,
                price_2: editingProduct.price_2,
                price_3: editingProduct.price_3,
                stock: editingProduct.stock,
                category: editingProduct.category,
                popular: editingProduct.popular
            })
            .eq('id', editingProduct.id);

        if (error) {
            alert('Error updating product');
        } else {
            setEditingProduct(null);
            fetchProducts();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting product');
        } else {
            fetchProducts();
        }
    };

    if (loading) return <div className="p-8">Loading products...</div>;

    if (error) {
        return (
            <div className="p-8 text-center text-red-600">
                <p className="font-bold">Error loading products:</p>
                <p>{error}</p>
                <div className="p-8 text-center text-red-600">
                    <p className="font-bold">Error loading products:</p>
                    <p>{error}</p>
                    <Button
                        onClick={fetchProducts}
                        className="mt-4 bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Products Management</h1>
                <div className="flex gap-2">
                    {products.length === 0 && (
                        <Button
                            onClick={handleSeedProducts}
                            variant="outline"
                            className="flex items-center gap-2 text-primary"
                        >
                            <Upload className="h-4 w-4" /> Upload Default Data
                        </Button>
                    )}
                    <Button
                        onClick={() => setIsAddingProduct(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" /> Add Product
                    </Button>
                </div>
            </div>

            <div className="rounded-lg border bg-white shadow-sm overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500">
                        <tr>
                            <th className="px-6 py-3 font-medium">Name</th>
                            <th className="px-6 py-3 font-medium">Price 1</th>
                            <th className="px-6 py-3 font-medium">Price 2</th>
                            <th className="px-6 py-3 font-medium">Price 3</th>
                            <th className="px-6 py-3 font-medium">Stock</th>
                            <th className="px-6 py-3 font-medium">Category</th>
                            <th className="px-6 py-3 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                                <td className="px-6 py-3 font-medium">{product.name}</td>
                                <td className="px-6 py-3">₹{product.price}</td>
                                <td className="px-6 py-3">{product.price_2 ? `₹${product.price_2}` : '-'}</td>
                                <td className="px-6 py-3">{product.price_3 ? `₹${product.price_3}` : '-'}</td>
                                <td className="px-6 py-3">{product.stock}</td>
                                <td className="px-6 py-3">{product.category}</td>
                                <td className="flex gap-2 px-6 py-3">
                                    <Button
                                        onClick={() => setEditingProduct(product)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-600 hover:bg-blue-50"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(product.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-gray-500">
                        <p className="mb-4">No products found.</p>
                        <Button
                            onClick={() => setIsAddingProduct(true)}
                            className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" /> Add Product
                        </Button>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {(isAddingProduct || editingProduct) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="flex h-full max-h-[90vh] w-full max-w-2xl flex-col rounded-lg bg-white shadow-lg">
                        <div className="flex items-center justify-between border-b px-6 py-4">
                            <h2 className="text-xl font-bold">
                                {isAddingProduct ? 'Add New Product' : 'Edit Product'}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsAddingProduct(false);
                                    setEditingProduct(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={isAddingProduct ? handleAddProduct : handleUpdate} className="flex flex-1 flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="grid gap-4 md:grid-cols-2">
                                <div className="col-span-2">
                                    <label className="mb-1 block text-sm font-medium">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={isAddingProduct ? newProduct.name : editingProduct?.name}
                                        onChange={(e) => isAddingProduct
                                            ? setNewProduct({ ...newProduct, name: e.target.value })
                                            : setEditingProduct({ ...editingProduct!, name: e.target.value })
                                        }
                                        className="w-full rounded-md border p-2"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="mb-1 block text-sm font-medium">Description</label>
                                    <textarea
                                        value={isAddingProduct ? newProduct.description : editingProduct?.description}
                                        onChange={(e) => isAddingProduct
                                            ? setNewProduct({ ...newProduct, description: e.target.value })
                                            : setEditingProduct({ ...editingProduct!, description: e.target.value })
                                        }
                                        className="w-full rounded-md border p-2"
                                        rows={3}
                                    />
                                </div>

                                {/* Image Selection */}
                                <div className="col-span-2 space-y-2">
                                    <label className="block text-sm font-medium">Product Image</label>
                                    <div className="flex gap-4 border-b pb-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setImageMode('url')}
                                            className={`text-sm font-medium ${imageMode === 'url' ? 'text-primary border-b-2 border-primary rounded-none' : 'text-gray-500 rounded-none'}`}
                                        >
                                            Image Link
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setImageMode('upload')}
                                            className={`text-sm font-medium ${imageMode === 'upload' ? 'text-primary border-b-2 border-primary rounded-none' : 'text-gray-500 rounded-none'}`}
                                        >
                                            Upload File
                                        </Button>
                                    </div>

                                    {imageMode === 'url' ? (
                                        <input
                                            type="text"
                                            placeholder="https://example.com/image.jpg"
                                            value={(isAddingProduct ? newProduct.image : editingProduct?.image) || ''}
                                            onChange={(e) => isAddingProduct
                                                ? setNewProduct({ ...newProduct, image: e.target.value })
                                                : setEditingProduct({ ...editingProduct!, image: e.target.value })
                                            }
                                            className="w-full rounded-md border p-2"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="w-full rounded-md border p-2 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
                                            />
                                            {uploadingImage && <span className="text-sm text-gray-500">Uploading...</span>}
                                        </div>
                                    )}

                                    {/* Image Preview */}
                                    {(isAddingProduct ? newProduct.image : editingProduct?.image) && (
                                        <div className="mt-2 h-32 w-32 overflow-hidden rounded-md border">
                                            <img
                                                src={isAddingProduct ? newProduct.image : editingProduct?.image}
                                                alt="Preview"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Price 1 (Primary)</label>
                                    <input
                                        type="number"
                                        required
                                        value={(isAddingProduct ? newProduct.price : editingProduct?.price) || ''}
                                        onChange={(e) => isAddingProduct
                                            ? setNewProduct({ ...newProduct, price: Number(e.target.value) })
                                            : setEditingProduct({ ...editingProduct!, price: Number(e.target.value) })
                                        }
                                        className="w-full rounded-md border p-2"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Stock</label>
                                    <input
                                        type="number"
                                        value={(isAddingProduct ? newProduct.stock : editingProduct?.stock) || ''}
                                        onChange={(e) => isAddingProduct
                                            ? setNewProduct({ ...newProduct, stock: Number(e.target.value) })
                                            : setEditingProduct({ ...editingProduct!, stock: Number(e.target.value) })
                                        }
                                        className="w-full rounded-md border p-2"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Price 2 (Optional)</label>
                                    <input
                                        type="number"
                                        value={(isAddingProduct ? newProduct.price_2 : editingProduct?.price_2) || ''}
                                        onChange={(e) => isAddingProduct
                                            ? setNewProduct({ ...newProduct, price_2: Number(e.target.value) })
                                            : setEditingProduct({ ...editingProduct!, price_2: Number(e.target.value) })
                                        }
                                        className="w-full rounded-md border p-2"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Price 3 (Optional)</label>
                                    <input
                                        type="number"
                                        value={(isAddingProduct ? newProduct.price_3 : editingProduct?.price_3) || ''}
                                        onChange={(e) => isAddingProduct
                                            ? setNewProduct({ ...newProduct, price_3: Number(e.target.value) })
                                            : setEditingProduct({ ...editingProduct!, price_3: Number(e.target.value) })
                                        }
                                        className="w-full rounded-md border p-2"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">Category</label>
                                    <div className="flex gap-2">
                                        {isAddingCategory ? (
                                            <div className="flex flex-1 gap-2">
                                                <input
                                                    type="text"
                                                    value={newCategory}
                                                    onChange={(e) => setNewCategory(e.target.value)}
                                                    placeholder="New Category Name"
                                                    className="w-full rounded-md border p-2"
                                                    autoFocus
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={handleAddCategory}
                                                    className="bg-green-600 text-white hover:bg-green-700"
                                                >
                                                    Save
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setIsAddingCategory(false)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-1 gap-2">
                                                <select
                                                    value={isAddingProduct ? newProduct.category : editingProduct?.category}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (val === 'NEW') {
                                                            setIsAddingCategory(true);
                                                        } else {
                                                            isAddingProduct
                                                                ? setNewProduct({ ...newProduct, category: val })
                                                                : setEditingProduct({ ...editingProduct!, category: val });
                                                        }
                                                    }}
                                                    className="w-full rounded-md border p-2"
                                                >
                                                    <option value="">Select Category</option>
                                                    {categories.map((cat) => (
                                                        <option key={cat} value={cat}>{cat}</option>
                                                    ))}
                                                    <option value="NEW" className="font-semibold text-blue-600">+ Add New Category</option>
                                                </select>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => setIsAddingCategory(true)}
                                                    className="shrink-0"
                                                    title="Add New Category"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="popular"
                                        checked={isAddingProduct ? newProduct.popular : editingProduct?.popular}
                                        onChange={(e) => isAddingProduct
                                            ? setNewProduct({ ...newProduct, popular: e.target.checked })
                                            : setEditingProduct({ ...editingProduct!, popular: e.target.checked })
                                        }
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="popular" className="text-sm font-medium">Mark as Popular</label>
                                </div>
                                </div>
                            </div>
                            <div className="border-t bg-gray-50 px-6 py-4">
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsAddingProduct(false);
                                            setEditingProduct(null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={uploadingImage}
                                        className="bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        {isAddingProduct ? 'Add Product' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
