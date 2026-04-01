import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import Swal from 'sweetalert2';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { generateInvoice, generateProforma, generateReceipt } from '@/lib/pdfGenerator';
import SearchBar from '@/Components/SearchBar';
import OrderStatusHistory from '@/Components/OrderStatusHistory';
import PaymentModal from '@/Components/PaymentModal';
import { EmptyState, LoadingState } from '@/Components/EmptyState';
import { Skeleton } from '@/Components/ui/skeleton';
import { FileText, Receipt, Pencil, Trash2, ChevronDown, ChevronRight, Clock, Package, Users, Plus } from 'lucide-react';
import GhanaCedi from '@/Components/GhanaCedi';

interface Client {
    id: number;
    client_name: string;
    mobile_no1?: string;
    delivery_address?: string;
}

interface Product {
    id: number;
    product_name: string;
    unit_price: number;
}

interface OrderItem {
    product_id: number;
    product_name: string;
    qty: number;
    unit_price: number;
    line_total: number;
}

interface Order {
    id: number;
    order_id: string;
    client_id: number;
    client?: Client;
    items: OrderItem[];
    subtotal: number;
    total: number;
    total_paid?: number;
    status: string;
    is_vat: boolean;
    delivery_date: string | null;
    created_at: string;
}

interface Pagination {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Props {
    orders: Order[];
    pagination?: Pagination;
}

const SkeletonTableRow = () => (
    <tr className="animate-pulse">
        <td className="px-4 py-3"><Skeleton className="h-4 w-4" /></td>
        <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
        <td className="px-4 py-3"><Skeleton className="h-6 w-28" /></td>
        <td className="px-4 py-3"><Skeleton className="h-5 w-20" /></td>
        <td className="px-4 py-3"><Skeleton className="h-4 w-8 ml-auto" /></td>
        <td className="px-4 py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
        <td className="px-4 py-3"><Skeleton className="h-4 w-12 ml-auto" /></td>
        <td className="px-4 py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
        <td className="px-4 py-3"><Skeleton className="h-4 w-28" /></td>
        <td className="px-4 py-3"><Skeleton className="h-8 w-28" /></td>
        <td className="px-4 py-3"><Skeleton className="h-4 w-16 ml-auto" /></td>
        <td className="px-4 py-3">
            <div className="flex items-center justify-end gap-1">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
            </div>
        </td>
    </tr>
);

const SkeletonCard = () => (
    <div className="glass-card-hover p-4 space-y-4 animate-pulse">
        <div className="flex items-center justify-between">
            <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex gap-2 pt-2 border-t border-white/20">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
        </div>
    </div>
);

const STATUSES = ['Estimate Offered', 'Invoice Created', 'Payment Received', 'Production Started', 'Order Delivered', 'Order Completed'];

const STATUS_COLORS: Record<string, string> = {
    'Estimate Offered': 'bg-gray-100 text-gray-800',
    'Invoice Created': 'bg-blue-100 text-blue-800',
    'Payment Received': 'bg-green-100 text-green-800',
    'Production Started': 'bg-yellow-100 text-yellow-800',
    'Order Delivered': 'bg-purple-100 text-purple-800',
    'Order Completed': 'bg-emerald-100 text-emerald-800',
};

const STATUS_BORDER_COLORS: Record<string, string> = {
    'Estimate Offered': 'border-l-gray-400',
    'Invoice Created': 'border-l-blue-500',
    'Payment Received': 'border-l-green-500',
    'Production Started': 'border-l-yellow-500',
    'Order Delivered': 'border-l-purple-500',
    'Order Completed': 'border-l-emerald-500',
};

const STATUS_ACTIONS: Record<string, { label: string; documents: string[] }> = {
    'Estimate Offered': { label: 'Create Invoice', documents: ['Estimate'] },
    'Invoice Created': { label: 'Add Payment', documents: ['Estimate', 'Invoice'] },
    'Payment Received': { label: 'Initiate Production', documents: ['Estimate', 'Invoice', 'Receipt'] },
    'Production Started': { label: 'Send Out For Delivery', documents: [] },
    'Order Delivered': { label: 'Complete Order', documents: [] },
    'Order Completed': { label: '', documents: [] },
};

const ACTIVE_STATUSES = ['Estimate Offered', 'Invoice Created', 'Payment Received', 'Production Started', 'Order Delivered'];
const ALL_STATUSES_FILTER = ['All', 'Estimate Offered', 'Invoice Created', 'Payment Received', 'Production Started', 'Order Delivered', 'Order Completed'];

const formatPrice = (value: number | string | undefined): string => {
    if (value === undefined || value === null) return '0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.00' : num.toFixed(2);
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

export default function Index({ orders, pagination }: Props) {
    const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
    const [mobileExpandedItems, setMobileExpandedItems] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'active' | 'all' | 'completed'>('active');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(pagination?.current_page || 1);
    const [historyModalOpen, setHistoryModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);

    // Computed counts
    const activeCount = orders.filter(o => o.status !== 'Order Completed').length;
    const completedCount = orders.filter(o => o.status === 'Order Completed').length;

    // Toggle mobile items expansion
    const toggleMobileItems = (orderId: number) => {
        setMobileExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    // URL persistence
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        const status = urlParams.get('status');
        const search = urlParams.get('search');
        const page = urlParams.get('page');
        if (tab && ['active', 'all', 'completed'].includes(tab)) {
            setActiveTab(tab as 'active' | 'all' | 'completed');
        }
        if (status) {
            setStatusFilter(status);
        }
        if (search) {
            setSearchQuery(search);
        }
        if (page) {
            setCurrentPage(parseInt(page) || 1);
        }
    }, []);

    useEffect(() => {
        const url = new URL(window.location.href);
        url.searchParams.set('tab', activeTab);
        url.searchParams.set('page', currentPage.toString());
        if (statusFilter) {
            url.searchParams.set('status', statusFilter);
        } else {
            url.searchParams.delete('status');
        }
        if (searchQuery) {
            url.searchParams.set('search', searchQuery);
        } else {
            url.searchParams.delete('search');
        }
        window.history.pushState({}, '', url.toString());
    }, [activeTab, statusFilter, searchQuery, currentPage]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= (pagination?.last_page || 1)) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Status filter options based on tab
    const statusFilterOptions = activeTab === 'all' ? ALL_STATUSES_FILTER : ['All', ...ACTIVE_STATUSES];

    const sortedOrders = [...orders].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
    });

    const filteredOrders = sortedOrders.filter(order => {
        // Tab filter
        if (activeTab === 'active') {
            if (order.status === 'Order Completed') return false;
        } else if (activeTab === 'completed') {
            if (order.status !== 'Order Completed') return false;
        }
        
        // Status filter
        if (statusFilter && order.status !== statusFilter) return false;
        
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                order.order_id.toLowerCase().includes(query) ||
                order.client?.client_name?.toLowerCase().includes(query) ||
                order.status.toLowerCase().includes(query)
            );
        }
        
        return true;
    });

    const toggleOrder = (orderId: number) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    const updateStatus = (orderId: number, newStatus: string) => {
        Swal.fire({
            title: 'Confirm Status Change',
            text: `Change status to "${newStatus}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#7c3aed',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, change it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('orders.update', orderId), {
                    status: newStatus,
                }, {
                    onSuccess: () => window.location.reload(),
                });
            }
        });
    };

    const advanceStatus = (orderId: number, currentStatus: string) => {
        const currentIndex = STATUSES.indexOf(currentStatus);
        if (currentIndex === -1 || currentIndex === STATUSES.length - 1) return;
        const nextStatus = STATUSES[currentIndex + 1];
        updateStatus(orderId, nextStatus);
    };

    const deleteOrder = (id: number) => {
        Swal.fire({
            title: 'Archive Order?',
            text: 'This order will be moved to the archive. You can restore it later if needed.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, archive it!',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('orders.destroy', id));
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Orders" />

            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your orders and track their progress</p>
                    </div>
                    <Button onClick={() => window.location.href = route('orders.create')} className="gap-2">
                        <Plus size={18} />
                        New Order
                    </Button>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass-card p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent-100 flex items-center justify-center">
                            <Package className="w-6 h-6 text-accent-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{activeCount}</p>
                            <p className="text-sm text-gray-500">Active Orders</p>
                        </div>
                    </div>
                    <div className="glass-card p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{completedCount}</p>
                            <p className="text-sm text-gray-500">Completed</p>
                        </div>
                    </div>
                    <div className="glass-card p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
                            <p className="text-sm text-gray-500">Total Orders</p>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="glass-card p-4 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <SearchBar
                                value={searchQuery}
                                onChange={setSearchQuery}
                                placeholder="Search orders by ID, client, or status..."
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                    activeTab === 'active' 
                                        ? 'bg-accent-600 text-white shadow-lg' 
                                        : 'glass text-gray-600 hover:bg-white/40'
                                }`}
                            >
                                Active
                            </button>
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                    activeTab === 'all' 
                                        ? 'bg-accent-600 text-white shadow-lg' 
                                        : 'glass text-gray-600 hover:bg-white/40'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                    activeTab === 'completed' 
                                        ? 'bg-accent-600 text-white shadow-lg' 
                                        : 'glass text-gray-600 hover:bg-white/40'
                                }`}
                            >
                                Completed
                            </button>
                        </div>
                    </div>

                    {/* Status Filter Chips */}
                    {activeTab !== 'completed' && (
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-xs text-gray-500 font-medium">Status:</span>
                            {statusFilterOptions.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status === 'All' ? '' : status)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all backdrop-blur-md ${
                                        (status === 'All' && !statusFilter) || statusFilter === status
                                            ? `${STATUS_COLORS[status] || 'bg-gray-200 text-gray-800'}`
                                            : 'bg-white/40 text-gray-600 hover:bg-white/60 border border-white/40'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden lg:block glass-card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-white/30">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-10"></th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Items</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Subtotal</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">VAT</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Delivery</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Advance</th>
                                {(activeTab === 'active' || activeTab === 'all') && (
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Paid</th>
                                )}
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/20">
                            {filteredOrders.map((order) => {
                                const isExpanded = expandedOrders.has(order.id);
                                const vatAmount = order.is_vat ? (parseFloat(String(order.total)) || 0) - (parseFloat(String(order.subtotal)) || 0) : 0;
                                return (
                                    <React.Fragment key={order.id}>
                                        <tr 
                                            className="hover:bg-white/20 cursor-pointer transition-colors"
                                            onClick={() => toggleOrder(order.id)}
                                        >
                                            <td className="px-4 py-3">
                                                {isExpanded ? <ChevronDown className="w-4 h-4 text-accent-600" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-accent-600">{order.order_id}</td>
                                            <td className="px-4 py-3 text-gray-700">{order.client?.client_name}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium backdrop-blur-md ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-600">{order.items?.length || 0}</td>
                                            <td className="px-4 py-3 text-right text-gray-600">GHC {formatPrice(order.subtotal)}</td>
                                            <td className="px-4 py-3 text-right text-gray-500">{order.is_vat ? `GHC ${formatPrice(vatAmount)}` : '-'}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-800">GHC {formatPrice(order.total)}</td>
                                            <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.delivery_date)}</td>
                                            <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                {order.status !== 'Order Completed' ? (
                                                    <button 
                                                        onClick={() => advanceStatus(order.id, order.status)}
                                                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-100 text-accent-700 hover:bg-accent-200 transition-colors whitespace-nowrap"
                                                    >
                                                        {STATUS_ACTIONS[order.status]?.label}
                                                    </button>
                                                ) : (
                                                    <span className="text-sm text-emerald-600 font-medium flex items-center gap-1">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                        Done
                                                    </span>
                                                )}
                                            </td>
                                            {(activeTab === 'active' || activeTab === 'all') && (
                                                <td className="px-4 py-3 text-right font-medium text-emerald-600">
                                                    GHC {formatPrice(order.total_paid || 0)}
                                                </td>
                                            )}
                                            <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-end gap-1">
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedOrderForPayment(order);
                                                            setPaymentModalOpen(true);
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors"
                                                        title="View/Add Payments"
                                                    >
                                                        <GhanaCedi className="w-4 h-4" />
                                                    </button>
                                                    {STATUSES.indexOf(order.status) >= 0 && (
                                                        <button 
                                                            onClick={() => generateProforma(order as any)}
                                                            className="p-2 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors"
                                                            title="Generate Proforma"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {STATUSES.indexOf(order.status) >= 1 && (
                                                        <button 
                                                            onClick={() => generateInvoice(order as any)}
                                                            className="p-2 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                                                            title="Generate Invoice"
                                                        >
                                                            <FileText className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {STATUSES.indexOf(order.status) >= 2 && (
                                                        <button 
                                                            onClick={() => generateReceipt(order as any, order.total)}
                                                            className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors"
                                                            title="Generate Receipt"
                                                        >
                                                            <Receipt className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setHistoryModalOpen(true);
                                                        }}
                                                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                                                        title="View Status History"
                                                    >
                                                        <Clock className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => window.location.href = route('orders.edit', order.id)}
                                                        className="p-2 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors"
                                                        title="Edit Order"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteOrder(order.id)}
                                                        className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                                                        title="Delete Order"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr key={`${order.id}-items`}>
                                                <td colSpan={12} className="px-4 py-4 bg-white/10">
                                                    <div className="border border-white/20 rounded-xl overflow-hidden">
                                                        <table className="w-full text-sm">
                                                            <thead className="bg-white/20">
                                                                <tr>
                                                                    <th className="px-4 py-2 text-left font-medium text-gray-600">Product</th>
                                                                    <th className="px-4 py-2 text-right font-medium text-gray-600">Qty</th>
                                                                    <th className="px-4 py-2 text-right font-medium text-gray-600">Unit Price</th>
                                                                    <th className="px-4 py-2 text-right font-medium text-gray-600">Total</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-white/10">
                                                                {order.items?.map((item: any, idx: number) => (
                                                                    <tr key={idx}>
                                                                        <td className="px-4 py-2 text-gray-700">{item.product_name}</td>
                                                                        <td className="px-4 py-2 text-right text-gray-600">{item.qty}</td>
                                                                        <td className="px-4 py-2 text-right text-gray-600">GHC {formatPrice(item.unit_price)}</td>
                                                                        <td className="px-4 py-2 text-right font-medium text-gray-800">GHC {formatPrice(item.line_total)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className={`glass-card-hover p-4 space-y-4 border-l-4 ${STATUS_BORDER_COLORS[order.status] || 'border-l-gray-300'}`}>
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-accent-600">{order.order_id}</h3>
                                    <p className="text-sm text-gray-500">{order.client?.client_name}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Order Items - Collapsible */}
                            <div className="border border-white/20 rounded-xl overflow-hidden">
                                <button 
                                    className="w-full flex items-center justify-between px-4 py-3 bg-white/20 hover:bg-white/30 transition-colors"
                                    onClick={() => toggleMobileItems(order.id)}
                                >
                                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        Items ({order.items?.length || 0})
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${mobileExpandedItems.has(order.id) ? 'rotate-180' : ''}`} />
                                </button>
                                {mobileExpandedItems.has(order.id) && (
                                    <table className="w-full text-sm">
                                        <thead className="bg-white/10">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qty</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/10">
                                            {order.items?.map((item: any, idx: number) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-2 text-gray-700">{item.product_name}</td>
                                                    <td className="px-4 py-2 text-right text-gray-600">{item.qty}</td>
                                                    <td className="px-4 py-2 text-right font-medium text-gray-800">GHC {formatPrice(item.line_total)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Totals */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Subtotal:</span>
                                    <span className="text-gray-700">GHC {formatPrice(order.subtotal)}</span>
                                </div>
                                {order.is_vat && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">VAT (20%):</span>
                                        <span className="text-gray-700">GHC {formatPrice((parseFloat(String(order.total)) || 0) - (parseFloat(String(order.subtotal)) || 0))}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg border-t border-white/20 pt-2">
                                    <span className="text-gray-800">Total:</span>
                                    <span className="text-accent-600">GHC {formatPrice(order.total)}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="border-emerald-300/50 text-emerald-600 hover:bg-emerald-50"
                                    onClick={() => {
                                        setSelectedOrderForPayment(order);
                                        setPaymentModalOpen(true);
                                    }}
                                >
                                    <GhanaCedi className="w-4 h-4 mr-1" />
                                    Payment
                                </Button>
                                {STATUSES.indexOf(order.status) >= 0 && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="border-amber-300/50 text-amber-600 hover:bg-amber-50"
                                        onClick={() => generateProforma(order as any)}
                                    >
                                        <FileText className="w-4 h-4 mr-1" />
                                        Proforma
                                    </Button>
                                )}
                                {STATUSES.indexOf(order.status) >= 1 && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="border-blue-300/50 text-blue-600 hover:bg-blue-50"
                                        onClick={() => generateInvoice(order as any)}
                                    >
                                        <FileText className="w-4 h-4 mr-1" />
                                        Invoice
                                    </Button>
                                )}
                                {STATUSES.indexOf(order.status) >= 2 && (
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="border-emerald-300/50 text-emerald-600 hover:bg-emerald-50"
                                        onClick={() => generateReceipt(order as any, order.total_paid || order.total)}
                                    >
                                        <Receipt className="w-4 h-4 mr-1" />
                                        Receipt
                                    </Button>
                                )}
                                {order.status !== 'Order Completed' && (
                                    <Button 
                                        size="sm"
                                        onClick={() => advanceStatus(order.id, order.status)}
                                    >
                                        {STATUS_ACTIONS[order.status]?.label}
                                    </Button>
                                )}
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => {
                                        setSelectedOrder(order);
                                        setHistoryModalOpen(true);
                                    }}
                                >
                                    History
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => window.location.href = route('orders.edit', order.id)}
                                >
                                    Edit
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => deleteOrder(order.id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination Controls */}
                {pagination && pagination.last_page > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 glass-card">
                        <div className="text-sm text-gray-600">
                            Showing {((pagination.current_page - 1) * pagination.per_page) + 1} to {Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} orders
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="h-9"
                            >
                                <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
                                Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.last_page <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= pagination.last_page - 2) {
                                        pageNum = pagination.last_page - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                                                currentPage === pageNum
                                                    ? 'bg-accent-600 text-white'
                                                    : 'hover:bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === pagination.last_page}
                                className="h-9"
                            >
                                Next
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {filteredOrders.length === 0 && (
                    <EmptyState
                        variant="orders"
                        className="glass-card"
                        onAction={() => window.location.href = route('orders.create')}
                        description={
                            activeTab === 'active' && !statusFilter && !searchQuery
                                ? "You haven't created any active orders yet. Start by creating your first order to track sales and payments."
                                : searchQuery
                                ? "No orders match your search criteria. Try adjusting your search terms."
                                : "No orders found in this category."
                        }
                    />
                )}

                {/* Status History Modal */}
                {historyModalOpen && selectedOrder && (
                    <OrderStatusHistory
                        orderId={selectedOrder.id}
                        order={selectedOrder}
                        isOpen={historyModalOpen}
                        onClose={() => {
                            setHistoryModalOpen(false);
                            setSelectedOrder(null);
                        }}
                    />
                )}

                {/* Payment Modal */}
                {paymentModalOpen && selectedOrderForPayment && (
                    <PaymentModal
                        order={selectedOrderForPayment}
                        isOpen={paymentModalOpen}
                        onClose={() => {
                            setPaymentModalOpen(false);
                            setSelectedOrderForPayment(null);
                        }}
                        onPaymentAdded={() => {
                            router.reload({ only: ['orders'] });
                        }}
                    />
                )}
            </div>
        </AuthenticatedLayout>
    );
}
