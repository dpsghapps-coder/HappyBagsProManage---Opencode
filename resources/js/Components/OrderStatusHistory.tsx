import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import { X, Clock, RotateCcw, User, History } from 'lucide-react';

interface StatusLog {
    id: number;
    previous_status: string | null;
    new_status: string;
    note: string | null;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
}

interface OrderStatusHistoryProps {
    orderId: number;
    order: {
        id: number;
        order_id: string;
        client?: {
            client_name: string;
        };
    };
    isOpen: boolean;
    onClose: () => void;
}

const STATUS_COLORS: Record<string, string> = {
    'Estimate Offered': 'bg-gray-100/70 text-gray-700',
    'Invoice Created': 'bg-blue-100/70 text-blue-700',
    'Payment Received': 'bg-green-100/70 text-green-700',
    'Production Started': 'bg-amber-100/70 text-amber-700',
    'Order Delivered': 'bg-purple-100/70 text-purple-700',
    'Order Completed': 'bg-emerald-100/70 text-emerald-700',
};

export default function OrderStatusHistory({ orderId, order, isOpen, onClose }: OrderStatusHistoryProps) {
    const [logs, setLogs] = useState<StatusLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
    const [revertingId, setRevertingId] = useState<number | null>(null);
    
    const getCsrfToken = () => {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') || '' : '';
    };

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
        }
    }, [isOpen, orderId]);

    const fetchHistory = () => {
        setLoading(true);
        fetch(`/orders/${orderId}/history`)
            .then(res => res.json())
            .then(data => {
                setLogs(data.logs);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch history:', err);
                setLoading(false);
            });
    };

    const handleRevert = (log: StatusLog) => {
        const previousStatus = log.previous_status || 'Estimate Offered';
        
        Swal.fire({
            title: 'Revert Status?',
            text: `Revert to "${previousStatus}"? This will change the current order status.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, revert it!',
        }).then((result) => {
            if (result.isConfirmed) {
                setRevertingId(log.id);
                
                fetch(`/orders/${orderId}/revert`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'Accept': 'application/json',
                    },
                })
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return res.json();
                })
                .then(data => {
                    setRevertingId(null);
                    if (data.success) {
                        Swal.fire('Reverted!', data.message, 'success').then(() => {
                            window.location.reload();
                        });
                    } else {
                        Swal.fire('Error', data.error || 'Failed to revert status.', 'error');
                    }
                })
                .catch(err => {
                    setRevertingId(null);
                    console.error('Revert error:', err);
                    Swal.fire('Error', 'Failed to revert status. Please try again.', 'error');
                });
            }
        });
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const options: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };
        return date.toLocaleDateString('en-US', options);
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>
                
                <div className="relative w-full max-w-2xl glass-modal-content animate-scale-in">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                                <History className="w-5 h-5 text-accent-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Order Status History</h2>
                                <p className="text-sm text-gray-500">
                                    {order.order_id}
                                    {order.client && ` • ${order.client.client_name}`}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-white/20 text-gray-500 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-2 px-6 py-3 glass-surface border-b border-white/20">
                        <span className="text-sm text-gray-600 font-medium">View:</span>
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                viewMode === 'timeline'
                                    ? 'bg-accent-600 text-white shadow-lg'
                                    : 'glass text-gray-600 hover:bg-white/40'
                            }`}
                        >
                            Timeline
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all ${
                                viewMode === 'table'
                                    ? 'bg-accent-600 text-white shadow-lg'
                                    : 'glass text-gray-600 hover:bg-white/40'
                            }`}
                        >
                            Table
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[60vh] overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-500 border-t-transparent"></div>
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Clock className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500">No status history available.</p>
                            </div>
                        ) : viewMode === 'timeline' ? (
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-400 to-gray-200"></div>
                                
                                <div className="space-y-6">
                                    {logs.map((log, index) => (
                                        <div key={log.id} className="relative flex gap-4">
                                            {/* Timeline dot */}
                                            <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md ${
                                                STATUS_COLORS[log.new_status] || 'bg-gray-100'
                                            }`}>
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            
                                            {/* Content */}
                                            <div className="flex-1 pb-6">
                                                <div className="flex items-start justify-between">
                                                    <div className="p-4 glass-card-hover rounded-xl flex-1">
                                                        <p className="font-semibold text-gray-800">
                                                            {log.previous_status && (
                                                                <span className="line-through text-gray-400 mr-1 font-normal">
                                                                    {log.previous_status}
                                                                </span>
                                                            )}
                                                            {log.previous_status && ' → '}
                                                            <span className={STATUS_COLORS[log.new_status]}>
                                                                {log.new_status}
                                                            </span>
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                                            <User className="w-3 h-3" />
                                                            <span>{log.user?.name || 'System'}</span>
                                                            <span>•</span>
                                                            <span>{formatDateTime(log.created_at)}</span>
                                                        </div>
                                                        {log.note && (
                                                            <p className="mt-3 text-sm text-gray-600 glass-surface rounded-lg p-3">
                                                                {log.note}
                                                            </p>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Revert button for managers (only on non-first entries) */}
                                                    {index > 0 && (
                                                        <button
                                                            onClick={() => handleRevert(log)}
                                                            disabled={revertingId === log.id}
                                                            className="ml-3 p-2 rounded-xl glass-card text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                                                            title="Revert to this status"
                                                        >
                                                            {revertingId === log.id ? (
                                                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                <RotateCcw className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="glass-card overflow-hidden rounded-xl">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/30">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">From</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">To</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">By</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Note</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {logs.map((log, index) => (
                                            <tr key={log.id} className="hover:bg-white/10 transition-colors">
                                                <td className="px-4 py-3 text-gray-600">{formatTime(log.created_at)}</td>
                                                <td className="px-4 py-3">
                                                    {log.previous_status ? (
                                                        <span className={`px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-md ${STATUS_COLORS[log.previous_status]}`}>
                                                            {log.previous_status}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-md ${STATUS_COLORS[log.new_status]}`}>
                                                        {log.new_status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">{log.user?.name || 'System'}</td>
                                                <td className="px-4 py-3 text-gray-500">{log.note || '-'}</td>
                                                <td className="px-4 py-3">
                                                    {index > 0 && (
                                                        <button
                                                            onClick={() => handleRevert(log)}
                                                            disabled={revertingId === log.id}
                                                            className="p-2 rounded-xl hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
                                                            title="Revert to this status"
                                                        >
                                                            {revertingId === log.id ? (
                                                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                            ) : (
                                                                <RotateCcw className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/20 rounded-b-2xl">
                        <p className="text-xs text-gray-500 text-center">
                            {logs.length} status change{logs.length !== 1 ? 's' : ''} recorded
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
