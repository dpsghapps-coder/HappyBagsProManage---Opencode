import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import SearchBar from '@/Components/SearchBar';
import { EmptyState } from '@/Components/EmptyState';
import Modal from '@/Components/Modal';
import Swal from 'sweetalert2';
import { Package, Plus, Pencil, Trash2, Ruler, Info } from 'lucide-react';
import GhanaCedi from '@/Components/GhanaCedi';

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
                                        <GhanaCedi className="w-4 h-4" />
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
                <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add New Product'}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Package className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={data.product_name}
                                    onChange={(e) => setData('product_name', e.target.value)}
                                    className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="Enter product name"
                                    required
                                />
                            </div>
                            {errors.product_name && (
                                <p className="mt-1 text-sm text-red-600">{errors.product_name}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Unit Price (GHC) *
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <GhanaCedi className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.unit_price}
                                        onChange={(e) => setData('unit_price', e.target.value)}
                                        className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                {errors.unit_price && (
                                    <p className="mt-1 text-sm text-red-600">{errors.unit_price}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category *
                                </label>
                                <div className="relative">
                                    <select
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        className="block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                        required
                                    >
                                        <option value="">Select category</option>
                                        <option value="Paper Bag">Paper Bag</option>
                                        <option value="Plastic Bag">Plastic Bag</option>
                                        <option value="Non-woven Bag">Non-woven Bag</option>
                                        <option value="Jute Bag">Jute Bag</option>
                                        <option value="Canvas Bag">Canvas Bag</option>
                                        <option value="Reusable Bag">Reusable Bag</option>
                                        <option value="Custom">Custom</option>
                                    </select>
                                </div>
                                {errors.category && (
                                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dimension *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Ruler className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={data.dimension}
                                    onChange={(e) => setData('dimension', e.target.value)}
                                    className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                    placeholder="e.g., 10 x 15 inches"
                                    required
                                />
                            </div>
                            {errors.dimension && (
                                <p className="mt-1 text-sm text-red-600">{errors.dimension}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Other Details
                            </label>
                            <div className="relative">
                                <div className="absolute top-3 left-3 pointer-events-none">
                                    <Info className="h-4 w-4 text-gray-400" />
                                </div>
                                <textarea
                                    value={data.other_details}
                                    onChange={(e) => setData('other_details', e.target.value)}
                                    rows={2}
                                    className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                                    placeholder="Additional product details (optional)"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        {editingProduct ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    editingProduct ? 'Update Product' : 'Create Product'
                                )}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </AuthenticatedLayout>
    );
}
