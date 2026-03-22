import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { X, DollarSign, Plus, Trash2, User, CheckCircle } from 'lucide-react';

interface Payment {
    id: number;
    amount: number;
    payment_type: string;
    payment_timestamp: string;
    user: {
        id: number;
        name: string;
        email: string;
    } | null;
}

interface Order {
    id: number;
    order_id: string;
    total: number;
    total_paid?: number;
    client?: {
        client_name: string;
    };
}

interface PaymentModalProps {
    order: Order;
    isOpen: boolean;
    onClose: () => void;
    onPaymentAdded?: () => void;
}

const formatPrice = (value: number): string => {
    return value.toFixed(2);
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

export default function PaymentModal({ order, isOpen, onClose, onPaymentAdded }: PaymentModalProps) {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPaid, setTotalPaid] = useState(0);
    const [totalDue, setTotalDue] = useState(order.total);
    const [isFullyPaid, setIsFullyPaid] = useState(false);
    const [addingPayment, setAddingPayment] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [selectedPaymentType, setSelectedPaymentType] = useState('Hubtel');

    useEffect(() => {
        if (isOpen) {
            fetchPayments();
        }
    }, [isOpen, order.id]);

    const fetchPayments = () => {
        setLoading(true);
        fetch(`/orders/${order.id}/payments`)
            .then(res => res.json())
            .then(data => {
                setPayments(data.payments);
                setTotalPaid(data.totalPaid);
                setTotalDue(data.totalDue);
                setIsFullyPaid(data.isFullyPaid);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch payments:', err);
                setLoading(false);
            });
    };

    const getCsrfToken = () => {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') || '' : '';
    };

    const handleAddPayment = () => {
        const amount = parseFloat(paymentAmount);

        if (!amount || amount <= 0) {
            Swal.fire('Error', 'Please enter a valid amount.', 'error');
            return;
        }

        if (amount > totalDue) {
            Swal.fire('Error', `Amount exceeds the remaining balance of GHC ${formatPrice(totalDue)}.`, 'error');
            return;
        }

        setAddingPayment(true);

        fetch(`/orders/${order.id}/payments`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': getCsrfToken(),
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: amount,
                payment_type: selectedPaymentType,
            }),
        })
        .then(res => {
            if (!res.ok) throw new Error('Network response was not ok');
            return res.json();
        })
        .then(data => {
            setAddingPayment(false);

            if (data.success) {
                Swal.fire('Success', 'Payment recorded successfully!', 'success');

                setPaymentAmount('');

                if (onPaymentAdded) {
                    onPaymentAdded();
                }

                onClose();
            }
        })
        .catch(err => {
            setAddingPayment(false);
            console.error('Payment error:', err);
            Swal.fire('Error', 'Failed to record payment. Please try again.', 'error');
        });
    };

    const handleDeletePayment = (paymentId: number) => {
        Swal.fire({
            title: 'Delete Payment?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!',
        }).then((result) => {
            if (result.isConfirmed) {
                fetch(`/payments/${paymentId}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRF-TOKEN': getCsrfToken(),
                        'Accept': 'application/json',
                    },
                })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        Swal.fire('Deleted!', 'Payment has been deleted.', 'success');
                        fetchPayments();
                    } else {
                        Swal.fire('Error', data.error || 'Failed to delete payment.', 'error');
                    }
                })
                .catch(err => {
                    console.error('Delete error:', err);
                    Swal.fire('Error', 'Failed to delete payment.', 'error');
                });
            }
        });
    };

    const paymentProgress = order.total > 0 ? (totalPaid / order.total) * 100 : 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto sm:overflow-visible">
            <div className="flex min-h-full sm:min-h-0 sm:items-center items-start justify-center p-0 sm:p-4">
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}></div>

                <div className="relative w-full sm:max-w-lg sm:w-full glass-modal-content animate-scale-in my-8 sm:my-0 mx-auto max-w-[calc(100%-2rem)]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/20">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">{order.order_id}</h2>
                                <p className="text-xs sm:text-sm text-gray-500 truncate">
                                    {order.client?.client_name}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-white/20 text-gray-500 transition-colors flex-shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Summary */}
                    <div className="p-4 sm:p-6 glass-surface border-b border-white/20">
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                            <div className="p-2 sm:p-3 rounded-xl bg-white/30">
                                <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Total Due</p>
                                <p className="text-sm sm:text-lg font-bold text-gray-800">GHC {formatPrice(order.total)}</p>
                            </div>
                            <div className="p-2 sm:p-3 rounded-xl bg-emerald-100/50">
                                <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Amount Paid</p>
                                <p className="text-sm sm:text-lg font-bold text-emerald-600">GHC {formatPrice(totalPaid)}</p>
                            </div>
                            <div className="p-2 sm:p-3 rounded-xl bg-red-100/50">
                                <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Remaining</p>
                                <p className={`text-sm sm:text-lg font-bold ${totalDue > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                    GHC {formatPrice(totalDue)}
                                </p>
                            </div>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3 sm:mt-4">
                            <div className="w-full h-1.5 sm:h-2 rounded-full bg-white/40 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                        isFullyPaid ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-accent-400 to-accent-500'
                                    }`}
                                    style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                                ></div>
                            </div>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                {isFullyPaid ? (
                                    <>
                                        <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        <span className="text-xs sm:text-sm text-emerald-600 font-medium">Payment Complete</span>
                                    </>
                                ) : (
                                    <span className="text-xs sm:text-sm text-gray-500">{paymentProgress.toFixed(1)}% paid</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 max-h-[50vh] sm:max-h-[40vh] overflow-y-auto">
                        {/* Add Payment Form */}
                        {!isFullyPaid && (
                            <div className="mb-4 sm:mb-6 p-3 sm:p-4 glass-card rounded-xl">
                                <h3 className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 flex items-center gap-2">
                                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-accent-600" />
                                    Add Payment
                                </h3>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                                    <div className="flex-1">
                                        <input
                                            type="number"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            placeholder={`Max: GHC ${formatPrice(totalDue)}`}
                                            className="glass-input text-sm"
                                            min="0.01"
                                            max={totalDue}
                                            step="0.01"
                                        />
                                    </div>
                                    <button
                                        onClick={handleAddPayment}
                                        disabled={addingPayment || !paymentAmount}
                                        className="px-4 sm:px-5 py-2.5 bg-gradient-to-r from-accent-600 to-accent-700 text-white rounded-xl text-sm font-medium hover:from-accent-500 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-accent-500/25 transition-all active:scale-[0.98]"
                                    >
                                        {addingPayment ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <DollarSign className="w-4 h-4" />
                                        )}
                                        <span className="sm:hidden">Pay</span>
                                        <span className="hidden sm:inline">Pay Now</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Payments List */}
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-500 border-t-transparent"></div>
                            </div>
                        ) : payments.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                    <DollarSign className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-gray-500">No payments recorded yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {payments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className="flex items-center justify-between p-4 glass-card-hover rounded-xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                                <DollarSign className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    GHC {formatPrice(payment.amount)}
                                                    <span className="text-gray-400 ml-2 text-sm font-normal">
                                                        {payment.payment_type}
                                                    </span>
                                                </p>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <User className="w-3 h-3" />
                                                    <span>{payment.user?.name || 'System'}</span>
                                                    <span>•</span>
                                                    <span>{formatDateTime(payment.payment_timestamp)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeletePayment(payment.id)}
                                            className="p-2 rounded-xl hover:bg-red-100 text-red-600 transition-colors"
                                            title="Delete Payment"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/20 rounded-b-2xl">
                        <p className="text-xs text-gray-500 text-center">
                            {payments.length} payment{payments.length !== 1 ? 's' : ''} recorded
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
