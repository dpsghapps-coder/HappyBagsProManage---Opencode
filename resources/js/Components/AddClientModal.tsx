import { useState } from 'react';
import { X, User, Mail, Phone, MapPin } from 'lucide-react';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import Swal from 'sweetalert2';

interface AddClientModalProps {
    show: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddClientModal({ show, onClose, onSuccess }: AddClientModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        client_name: '',
        email: '',
        mobile_no1: '',
        mobile_no2: '',
        delivery_address: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        post('/clients', {
            onSuccess: () => {
                reset();
                Swal.fire('Success', 'Client created successfully!', 'success');
                onSuccess?.();
                onClose();
            },
            onError: (err) => {
                const errorMsg = Object.values(err).flat().join(', ') || 'Failed to create client';
                Swal.fire('Error', errorMsg, 'error');
            }
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Modal show={show} onClose={handleClose} title="Add New Client">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Name *
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={data.client_name}
                            onChange={(e) => setData('client_name', e.target.value)}
                            className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="Enter client name"
                            required
                        />
                    </div>
                    {errors.client_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.client_name}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            placeholder="client@example.com"
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number *
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="tel"
                                value={data.mobile_no1}
                                onChange={(e) => setData('mobile_no1', e.target.value)}
                                className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="+233 XX XXX XXXX"
                                required
                            />
                        </div>
                        {errors.mobile_no1 && (
                            <p className="mt-1 text-sm text-red-600">{errors.mobile_no1}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Alt. Phone
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="tel"
                                value={data.mobile_no2}
                                onChange={(e) => setData('mobile_no2', e.target.value)}
                                className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                placeholder="+233 XX XXX XXXX"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Address *
                    </label>
                    <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                            <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                        <textarea
                            value={data.delivery_address}
                            onChange={(e) => setData('delivery_address', e.target.value)}
                            rows={3}
                            className="pl-10 block w-full rounded-lg border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                            placeholder="Enter delivery address"
                            required
                        />
                    </div>
                    {errors.delivery_address && (
                        <p className="mt-1 text-sm text-red-600">{errors.delivery_address}</p>
                    )}
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
                            'Create Client'
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}