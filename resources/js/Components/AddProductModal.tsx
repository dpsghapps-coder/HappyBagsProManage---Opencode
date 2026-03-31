import { useState } from 'react';
import { X, Package, Ruler, Info } from 'lucide-react';
import GhanaCedi from '@/Components/GhanaCedi';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

interface AddProductModalProps {
    show: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddProductModal({ show, onClose, onSuccess }: AddProductModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        product_name: '',
        unit_price: '',
        category: '',
        dimension: '',
        other_details: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/products', {
            onSuccess: () => {
                reset();
                Swal.fire('Success', 'Product created successfully!', 'success');
                onSuccess?.();
                onClose();
            },
            onError: (err) => {
                const errorMsg = Object.values(err).flat().join(', ') || 'Failed to create product';
                Swal.fire('Error', errorMsg, 'error');
            }
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal show={show} onClose={handleClose} title="Add New Product">
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
                        onClick={handleClose}
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
                                Creating...
                            </>
                        ) : (
                            'Create Product'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}