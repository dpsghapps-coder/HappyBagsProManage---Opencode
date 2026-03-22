import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import Swal from 'sweetalert2';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { EmptyState } from '@/Components/EmptyState';
import { FileText, Trash2, RotateCcw, ArrowLeft, Clock, Package } from 'lucide-react';

interface Client {
    id: number;
    client_name: string;
}

interface OrderItem {
    product_id: number;
    product_name: string;
    qty: number;
    unit_price: number;
    line_total: number;
}

interface ArchivedOrder {
    id: number;
    order_id: string;
    client?: Client;
    items: OrderItem[];
    subtotal: number;
    total: number;
    status: string;
    delivery_date: string | null;
    created_at: string;
    deleted_at: string;
}

interface Props {
    archivedOrders: ArchivedOrder[];
}

const formatPrice = (value: number | string | undefined): string => {
    if (value === undefined || value === null) return '0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = date.getDate();
    const suffix = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
    return `${days[date.getDay()]}, ${day}${suffix} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const formatDateTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function Archived({ archivedOrders }: Props) {
    const handleRestore = (order: ArchivedOrder) => {
        Swal.fire({
            title: 'Restore Order?',
            text: `Restore "${order.order_id}" to active orders?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, restore it!',
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = `/orders/${order.id}/restore`;
            }
        });
    };

    const handlePermanentDelete = (order: ArchivedOrder) => {
        Swal.fire({
            title: 'Permanently Delete Order?',
            html: `
                <p class="text-left">This will <strong>permanently delete</strong> order <strong>${order.order_id}</strong>.</p>
                <p class="text-left text-red-500 mt-2">This action cannot be undone!</p>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete permanently!',
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = `/orders/${order.id}/force-delete`;
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Archived Orders" />

            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Archived Orders</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {archivedOrders.length} archived order{archivedOrders.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button 
                        variant="ghost" 
                        onClick={() => window.location.href = '/orders'}
                        className="gap-2"
                    >
                        <ArrowLeft size={18} />
                        Back to Orders
                    </Button>
                </div>

                {/* Archived Orders List */}
                {archivedOrders.length === 0 ? (
                    <EmptyState
                        variant="orders"
                        title="No archived orders"
                        description="Deleted orders will appear here. You can restore them within 30 days."
                        className="glass-card"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {archivedOrders.map((order) => (
                            <div 
                                key={order.id} 
                                className="glass-card-hover p-5 opacity-90"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-200 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-700">{order.order_id}</h3>
                                            <p className="text-xs text-gray-500">{order.client?.client_name || 'No client'}</p>
                                        </div>
                                    </div>
                                    <div className="px-2 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-medium">
                                        Archived
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Status:</span>
                                        <span className="font-medium text-gray-700">{order.status}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Items:</span>
                                        <span className="text-gray-700">{order.items?.length || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total:</span>
                                        <span className="font-bold text-gray-800">GHC {formatPrice(order.total)}</span>
                                    </div>
                                </div>

                                {/* Timestamps */}
                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                                    <Clock className="w-3 h-3" />
                                    <span>Deleted {formatDateTime(order.deleted_at)}</span>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-3 border-t border-white/20">
                                    <Button
                                        variant="success"
                                        size="sm"
                                        className="flex-1 gap-1"
                                        onClick={() => handleRestore(order)}
                                    >
                                        <RotateCcw className="w-4 h-4" />
                                        Restore
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="flex-1 gap-1"
                                        onClick={() => handlePermanentDelete(order)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info Box */}
                {archivedOrders.length > 0 && (
                    <div className="glass-card p-4 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-1">About Archived Orders</h4>
                            <p className="text-sm text-gray-600">
                                Archived orders can be restored at any time. Permanently deleted orders cannot be recovered. 
                                Only managers can permanently delete archived orders.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
