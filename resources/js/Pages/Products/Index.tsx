import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import SearchBar from '@/Components/SearchBar';
import { EmptyState } from '@/Components/EmptyState';
import Swal from 'sweetalert2';
import { Package, Plus, Pencil, Trash2, Ruler, DollarSign, Info } from 'lucide-react';

interface Product {
    id: number;
    product_name: string;
    unit_price: number;
    category: string;
    dimension: string;
    other_details: string | null;
    created_at: string;
}

interface Props {
    products: Product[];
}

const formatPrice = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.00' : num.toFixed(2);
};

const SkeletonProductCard = () => (
    <div className="glass-card-hover p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-gray-200" />
            <div className="h-6 w-20 bg-gray-100 rounded-full" />
        </div>
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="space-y-2 mb-4">
            <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-100 rounded" />
                <div className="h-4 w-20 bg-gray-100 rounded" />
            </div>
            <div className="flex justify-between">
                <div className="h-4 w-16 bg-gray-100 rounded" />
                <div className="h-4 w-24 bg-gray-100 rounded" />
            </div>
        </div>
        <div className="flex gap-2 pt-3 border-t border-white/20">
            <div className="h-9 w-full bg-gray-100 rounded-lg" />
            <div className="h-9 w-full bg-gray-100 rounded-lg" />
        </div>
    </div>
);

export default function Index({ products }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = products.filter(product => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            product.product_name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            product.dimension?.toLowerCase().includes(query)
        );
    });

    const { data, setData, post, put, processing, errors, reset } = useForm({
        product_name: '',
        unit_price: '',
        category: '',
        dimension: '',
        other_details: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingProduct) {
            put(route('products.update', editingProduct.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                    reset();
                },
            });
        } else {
            post(route('products.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setData({
            product_name: product.product_name,
            unit_price: product.unit_price.toString(),
            category: product.category,
            dimension: product.dimension,
            other_details: product.other_details || '',
        });
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingProduct(null);
        reset();
        setIsModalOpen(true);
    };

    const deleteProduct = (id: number) => {
        Swal.fire({
            title: 'Delete Product?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = route('products.destroy', id);
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Products" />

            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your product catalog</p>
                    </div>
                    <Button onClick={openCreateModal} className="gap-2">
                        <Plus size={18} />
                        Add Product
                    </Button>
                </div>

                {/* Stats */}
                <div className="glass-card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">{products.length}</p>
                        <p className="text-sm text-gray-500">Total Products</p>
                    </div>
                </div>

                {/* Search */}
                <div className="w-full">
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search products by name, category, or dimension..."
                        className="w-full"
                    />
                </div>

                {/* Product Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProducts.map((product) => (
                        <div 
                            key={product.id} 
                            className="glass-card-hover p-5 group"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                                <span className="px-3 py-1 glass-badge glass-badge-purple">
                                    {product.category}
                                </span>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-800 mb-3">{product.product_name}</h3>
                            
                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Price
                                    </span>
                                    <span className="font-bold text-lg text-accent-600">GHC {formatPrice(product.unit_price)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 flex items-center gap-2">
                                        <Ruler className="w-4 h-4" />
                                        Dimension
                                    </span>
                                    <span className="text-gray-700">{product.dimension}</span>
                                </div>
                                {product.other_details && (
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-500 flex items-center gap-2">
                                            <Info className="w-4 h-4" />
                                            Details
                                        </span>
                                        <span className="text-gray-700 text-right max-w-[60%]">{product.other_details}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-2 pt-3 border-t border-white/20">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="flex-1 hover:bg-amber-50 hover:text-amber-600"
                                    onClick={() => openEditModal(product)}
                                >
                                    <Pencil className="w-4 h-4 mr-1" />
                                    Edit
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="flex-1 hover:bg-red-50 hover:text-red-600 text-red-500"
                                    onClick={() => deleteProduct(product.id)}
                                >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <EmptyState
                        variant="products"
                        className="glass-card"
                        onAction={openCreateModal}
                        description={searchQuery ? "No products match your search criteria. Try adjusting your search terms." : undefined}
                    />
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="glass-modal-content w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingProduct ? 'Edit Product' : 'Add Product'}
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="product_name">Product Name</Label>
                                <Input
                                    id="product_name"
                                    value={data.product_name}
                                    onChange={(e) => setData('product_name', e.target.value)}
                                    className="glass-input"
                                    required
                                />
                                {errors.product_name && <p className="text-red-500 text-sm mt-1">{errors.product_name}</p>}
                            </div>
                            <div>
                                <Label htmlFor="unit_price">Unit Price (GHC)</Label>
                                <Input
                                    id="unit_price"
                                    type="number"
                                    step="0.01"
                                    value={data.unit_price}
                                    onChange={(e) => setData('unit_price', e.target.value)}
                                    className="glass-input"
                                    required
                                />
                                {errors.unit_price && <p className="text-red-500 text-sm mt-1">{errors.unit_price}</p>}
                            </div>
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                    placeholder="Tote, Box, Paper Bag"
                                    className="glass-input"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="dimension">Dimension</Label>
                                <Input
                                    id="dimension"
                                    value={data.dimension}
                                    onChange={(e) => setData('dimension', e.target.value)}
                                    placeholder="L x B x H"
                                    className="glass-input"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="other_details">Other Details</Label>
                                <Input
                                    id="other_details"
                                    value={data.other_details}
                                    onChange={(e) => setData('other_details', e.target.value)}
                                    placeholder="Handle type, material, etc."
                                    className="glass-input"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} className="flex-1">
                                    {editingProduct ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
