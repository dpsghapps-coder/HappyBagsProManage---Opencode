import React, { useState, useRef, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import GlassmorphicChartCard from '@/Components/GlassmorphicChartCard';
import GlassmorphicTooltip from '@/Components/GlassmorphicTooltip';
import { EmptyState } from '@/Components/EmptyState';
import { CHART_COLORS } from '@/config/chartColors';
import { FileText, DollarSign, Clock, Users, Package, TrendingUp, ArrowRight, Plus, ShoppingCart, UserPlus, Box, Calendar } from 'lucide-react';
import { Link } from '@inertiajs/react';

function useWindowSize() {
    const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setSize({ width: window.innerWidth, height: window.innerHeight });
            }, 100);
        };
        
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, []);
    
    return size;
}

function ChartContainer({ children, height = 280 }: { children: React.ReactNode; height?: number }) {
    const { width } = useWindowSize();
    const [containerKey, setContainerKey] = useState(0);
    
    useEffect(() => {
        setContainerKey(prev => prev + 1);
    }, [width]);
    
    return (
        <div key={containerKey} className="w-full" style={{ height }}>
            {children}
        </div>
    );
}

function useCountUpAnimation(target: number, duration = 1500) {
    const ref = useRef<HTMLSpanElement>(null);
    const hasStarted = useRef(false);

    useEffect(() => {
        if (hasStarted.current || !ref.current || target === 0) return;
        hasStarted.current = true;

        const element = ref.current;
        const startTime = performance.now();
        const startValue = 0;

        const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuart(progress);
            const currentValue = startValue + (target - startValue) * easedProgress;
            
            if (target >= 1000) {
                element.textContent = Math.round(currentValue).toLocaleString();
            } else {
                element.textContent = Math.round(currentValue).toString();
            }

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [target, duration]);

    return ref;
}

function AnimatedStat({ value, prefix = '', suffix = '', className = '' }: { value: number; prefix?: string; suffix?: string; className?: string }) {
    const ref = useCountUpAnimation(value);
    return (
        <span ref={ref} className={className}>
            {prefix}{value.toLocaleString()}{suffix}
        </span>
    );
}

interface Stat {
    totalOrders: number;
    totalClients: number;
    totalProducts: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
}

interface OrderItem {
    product_name: string;
    qty: number;
    line_total: number;
}

interface Client {
    id: number;
    client_name: string;
}

interface RecentOrder {
    id: number;
    order_id: string;
    client?: Client;
    items: OrderItem[];
    subtotal: number;
    total: number;
    status: string;
    created_at: string;
}

interface StatusData {
    status: string;
    count: number;
}

interface MonthlyData {
    month: string;
    total: number;
}

interface CategoryData {
    name: string;
    revenue: number;
    color: string;
}

interface Props {
    stats: Stat;
    recentOrders: RecentOrder[];
    ordersByStatus: StatusData[];
    monthlySales: MonthlyData[];
    categoryRevenue: CategoryData[];
    selectedPeriod: string;
}

const STATUS_COLORS: Record<string, string> = {
    'Estimate Offered': '#6b7280',
    'Invoice Created': '#3b82f6',
    'Payment Received': '#22c55e',
    'Production Started': '#eab308',
    'Order Delivered': '#a855f7',
    'Order Completed': '#10b981',
};

const formatPrice = (value: number | string | undefined): string => {
    if (value === undefined || value === null) return '0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const QuickAction = ({ 
    icon: Icon, 
    label, 
    href, 
    color = 'accent' 
}: { 
    icon: React.ElementType; 
    label: string; 
    href: string; 
    color?: 'accent' | 'emerald' | 'blue' | 'amber';
}) => {
    const colors = {
        accent: 'from-accent-500 to-accent-600 shadow-accent-500/25 hover:shadow-accent-500/40',
        emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/25 hover:shadow-emerald-500/40',
        blue: 'from-blue-500 to-blue-600 shadow-blue-500/25 hover:shadow-blue-500/40',
        amber: 'from-amber-500 to-amber-600 shadow-amber-500/25 hover:shadow-amber-500/40',
    };

    return (
        <Link
            href={href}
            className={`
                flex flex-col items-center justify-center gap-2 p-4 rounded-xl
                bg-gradient-to-br ${colors[color]}
                text-white shadow-lg ${colors[color].split(' ').slice(-1)[0]}
                transition-all duration-300 hover:scale-105 hover:-translate-y-1
                active:scale-95
            `}
        >
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Icon className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium text-center">{label}</span>
        </Link>
    );
};

const PERIOD_OPTIONS = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'quarterly', label: 'This Quarter' },
];

export default function Dashboard({ stats, recentOrders, ordersByStatus, monthlySales, categoryRevenue, selectedPeriod }: Props) {
    const [period, setPeriod] = useState(selectedPeriod);

    const handlePeriodChange = (newPeriod: string) => {
        setPeriod(newPeriod);
        router.get('/dashboard', { period: newPeriod }, { preserveState: true });
    };

    const pieData = ordersByStatus.map(item => ({
        name: item.status,
        value: item.count,
        color: STATUS_COLORS[item.status] || '#6b7280',
    }));

    const lineData = monthlySales.slice().reverse().map(item => ({
        name: item.month,
        sales: item.total,
    }));

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening with your business.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Period Selector */}
                        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-xl p-1 border border-white/40">
                            <Calendar className="w-4 h-4 text-gray-500 ml-2" />
                            <select
                                value={period}
                                onChange={(e) => handlePeriodChange(e.target.value)}
                                className="h-9 px-3 pr-8 bg-transparent border-none text-sm font-medium text-gray-700 focus:outline-none cursor-pointer appearance-none"
                            >
                                {PERIOD_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">Last updated:</span>
                            <span className="text-gray-600 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        </div>
                    </div>
                </div>
                
                {/* Quick Actions */}
                <div className="glass-card p-4">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <QuickAction icon={Plus} label="New Order" href="/orders/create" color="accent" />
                        <QuickAction icon={UserPlus} label="Add Client" href="/clients" color="emerald" />
                        <QuickAction icon={Box} label="Add Product" href="/products" color="blue" />
                        <QuickAction icon={FileText} label="View Reports" href="/reports" color="amber" />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-card p-6 group hover:shadow-glass-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '0ms' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400/20 to-blue-600/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
                        <div className="flex items-end gap-2">
                            <AnimatedStat value={stats.totalOrders} className="text-3xl font-bold text-gray-800" />
                            <p className="text-sm text-emerald-500 font-medium pb-1">
                                +<AnimatedStat value={stats.completedOrders} /> done
                            </p>
                        </div>
                    </div>
                    <div className="glass-card p-6 group hover:shadow-glass-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '100ms' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400/20 to-purple-600/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Clients</p>
                        <div className="flex items-end gap-2">
                            <AnimatedStat value={stats.totalClients} className="text-3xl font-bold text-gray-800" />
                        </div>
                    </div>
                    <div className="glass-card p-6 group hover:shadow-glass-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                <DollarSign className="w-6 h-6 text-emerald-600" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                        <p className="text-3xl font-bold text-emerald-600">GHC {formatPrice(stats.totalRevenue)}</p>
                    </div>
                    <div className="glass-card p-6 group hover:shadow-glass-lg transition-all duration-300 animate-fade-in" style={{ animationDelay: '300ms' }}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Clock className="w-6 h-6 text-amber-600" />
                            </div>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100/50 text-amber-700">
                                Active
                            </span>
                        </div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Pending Orders</p>
                        <div className="flex items-end gap-2">
                            <AnimatedStat value={stats.pendingOrders} className="text-3xl font-bold text-amber-600" />
                        </div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Sales Area Chart */}
                    <GlassmorphicChartCard title="Monthly Sales Trend (GHC)">
                        {lineData.length > 0 ? (
                            <ChartContainer height={280}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={lineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        tick={{ fontSize: 12, fill: '#6b7280' }} 
                                        axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
                                        tickLine={false}
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 12, fill: '#6b7280' }} 
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                    />
                                    <Tooltip content={<GlassmorphicTooltip />} cursor={{ stroke: CHART_COLORS.primary, strokeWidth: 2, strokeDasharray: '5 5' }} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="sales" 
                                        name="Sales"
                                        stroke={CHART_COLORS.primary} 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorSales)"
                                        animationDuration={1500}
                                        animationEasing="ease-out"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                            </ChartContainer>
                        ) : (
                            <div className="h-[280px] flex flex-col items-center justify-center text-gray-500">
                                <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                    <TrendingUp className="w-8 h-8 text-gray-300" />
                                </div>
                                <p>No sales data yet</p>
                            </div>
                        )}
                    </GlassmorphicChartCard>

                    {/* Orders by Status Pie Chart */}
                    <GlassmorphicChartCard title="Orders by Status">
                        {pieData.length > 0 ? (
                            <ChartContainer height={280}>
                            <div className="relative w-full h-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="45%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            paddingAngle={3}
                                            dataKey="value"
                                            animationDuration={1200}
                                            animationEasing="ease-out"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={entry.color}
                                                    stroke="rgba(255,255,255,0.5)"
                                                    strokeWidth={2}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<GlassmorphicTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center label */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginTop: '40px' }}>
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-gray-800">{pieData.reduce((acc, curr) => acc + curr.value, 0)}</p>
                                        <p className="text-xs text-gray-500">Total</p>
                                    </div>
                                </div>
                                {/* Legend */}
                                <div className="flex flex-wrap justify-center gap-3 mt-2">
                                    {pieData.map((entry) => (
                                        <div key={entry.name} className="flex items-center gap-1.5">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                            <span className="text-xs text-gray-600">{entry.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            </ChartContainer>
                        ) : (
                            <div className="h-[280px] flex flex-col items-center justify-center text-gray-500">
                                <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                    <ShoppingCart className="w-8 h-8 text-gray-300" />
                                </div>
                                <p>No orders yet</p>
                            </div>
                        )}
                    </GlassmorphicChartCard>
                </div>

                {/* Revenue by Category */}
                <GlassmorphicChartCard title="Revenue by Category (GHC)">
                    {categoryRevenue.length > 0 ? (
                    <ChartContainer height={280}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                            data={categoryRevenue}
                            margin={{ top: 50, right: 10, left: 10, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={1}/>
                                    <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0.6}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.3)" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                axisLine={false}
                                tickLine={false}
                                width={80}
                            />
                            <YAxis 
                                tick={{ fontSize: 12, fill: '#6b7280' }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                tickMargin={5}
                                width={45}
                            />
                            <Tooltip content={<GlassmorphicTooltip />} cursor={{ fill: 'rgba(124, 58, 237, 0.1)' }} />
                            <Bar 
                                dataKey="revenue" 
                                name="Revenue"
                                fill="url(#barGradient)"
                                radius={[8, 8, 0, 0]}
                                animationDuration={1500}
                                animationEasing="ease-out"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                    </ChartContainer>
                    ) : (
                        <div className="h-[280px] flex flex-col items-center justify-center text-gray-500">
                            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                <TrendingUp className="w-8 h-8 text-gray-300" />
                            </div>
                            <p>No revenue data for this period</p>
                        </div>
                    )}
                </GlassmorphicChartCard>

                {/* Recent Orders */}
                <GlassmorphicChartCard title="Recent Orders">
                    {recentOrders.length > 0 ? (
                        <div className="space-y-3">
                            {recentOrders.slice(0, 5).map((order, index) => (
                                <div 
                                    key={order.id} 
                                    className="flex items-center justify-between p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-200 cursor-pointer group"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-400/20 to-accent-600/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <FileText className="w-5 h-5 text-accent-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{order.order_id}</p>
                                            <p className="text-sm text-gray-500">{order.client?.client_name || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        <div>
                                            <p className="font-bold text-gray-800">GHC {formatPrice(order.total)}</p>
                                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-md ${
                                                order.status === 'Order Completed' ? 'bg-emerald-100/70 text-emerald-700' :
                                                order.status === 'Order Delivered' ? 'bg-purple-100/70 text-purple-700' :
                                                order.status === 'Payment Received' ? 'bg-green-100/70 text-green-700' :
                                                order.status === 'Production Started' ? 'bg-amber-100/70 text-amber-700' :
                                                'bg-gray-100/70 text-gray-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-accent-500 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            ))}
                            <Link 
                                href="/orders" 
                                className="flex items-center justify-center gap-2 pt-4 text-sm text-accent-600 hover:text-accent-700 font-semibold transition-colors"
                            >
                                View all orders <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders yet</h3>
                            <p className="text-gray-500 mb-4">Get started by creating your first order.</p>
                            <Link
                                href="/orders/create"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-xl font-medium shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Create Order
                            </Link>
                        </div>
                    )}
                </GlassmorphicChartCard>
            </div>
        </AuthenticatedLayout>
    );
}
