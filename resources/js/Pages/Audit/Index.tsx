import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import SearchBar from '@/Components/SearchBar';
import { EmptyState } from '@/Components/EmptyState';
import { Skeleton } from '@/Components/ui/skeleton';
import { 
    Shield, 
    User, 
    Package, 
    Users, 
    FileText, 
    ShoppingCart,
    LogIn,
    LogOut,
    Eye,
    ChevronDown,
    ChevronRight,
    Calendar,
    Monitor,
    Smartphone,
    Filter
} from 'lucide-react';

interface UserType {
    id: number;
    name: string;
    email: string;
}

interface AuditLog {
    id: number;
    user_id: number;
    action: string;
    entity_type: string;
    entity_id: number | null;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    user: UserType | null;
}

interface Props {
    logs: {
        data: AuditLog[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    entityTypes: string[];
    actions: string[];
    filters: {
        entity_type: string | null;
        action: string | null;
        user_id: string | null;
        from_date: string | null;
        to_date: string | null;
    };
}

const ACTION_COLORS: Record<string, string> = {
    create: 'bg-green-100 text-green-800',
    update: 'bg-blue-100 text-blue-800',
    delete: 'bg-red-100 text-red-800',
    restore: 'bg-yellow-100 text-yellow-800',
    force_delete: 'bg-red-200 text-red-900',
    login: 'bg-purple-100 text-purple-800',
    logout: 'bg-gray-100 text-gray-800',
    password_change: 'bg-orange-100 text-orange-800',
    profile_update: 'bg-cyan-100 text-cyan-800',
};

const ACTION_ICONS: Record<string, any> = {
    create: Package,
    update: Eye,
    delete: FileText,
    restore: ShoppingCart,
    force_delete: FileText,
    login: LogIn,
    logout: LogOut,
    password_change: Shield,
    profile_update: User,
};

const ENTITY_LABELS: Record<string, string> = {
    Product: 'Product',
    Client: 'Client',
    User: 'User',
    Order: 'Order',
    Profile: 'Profile',
    auth: 'Authentication',
};

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
};

const formatAction = (action: string) => {
    return action.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
};

export default function AuditIndex({ logs, entityTypes, actions, filters }: Props) {
    const [expandedLogs, setExpandedLogs] = useState<Set<number>>(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [localFilters, setLocalFilters] = useState(filters);

    const toggleExpand = (id: number) => {
        setExpandedLogs(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const applyFilters = () => {
        router.get(route('audit.index'), {
            ...localFilters,
            entity_type: localFilters.entity_type || undefined,
            action: localFilters.action || undefined,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        const emptyFilters = {
            entity_type: '',
            action: '',
            user_id: '',
            from_date: '',
            to_date: '',
        };
        setLocalFilters(emptyFilters);
        router.get(route('audit.index'), {}, {
            preserveState: true,
            replace: true,
        });
    };

    const filteredLogs = logs.data.filter(log => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            log.action.toLowerCase().includes(query) ||
            log.entity_type.toLowerCase().includes(query) ||
            log.user?.name?.toLowerCase().includes(query) ||
            log.ip_address?.toLowerCase().includes(query)
        );
    });

    const getDeviceIcon = (userAgent: string | null) => {
        if (!userAgent) return Monitor;
        if (userAgent.includes('Mobile')) return Smartphone;
        return Monitor;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Audit Logs" />

            <div className="p-4 md:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Shield className="w-7 h-7 text-purple-600" />
                            Audit Logs
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Track all system activities and changes</p>
                    </div>
                    <Button 
                        variant="outline" 
                        onClick={() => setShowFilters(!showFilters)}
                        className="gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </Button>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="glass-card p-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <Label>Entity Type</Label>
                                <select
                                    value={localFilters.entity_type || ''}
                                    onChange={(e) => setLocalFilters({...localFilters, entity_type: e.target.value})}
                                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                                >
                                    <option value="">All Types</option>
                                    {entityTypes.map(type => (
                                        <option key={type} value={type}>
                                            {ENTITY_LABELS[type] || type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label>Action</Label>
                                <select
                                    value={localFilters.action || ''}
                                    onChange={(e) => setLocalFilters({...localFilters, action: e.target.value})}
                                    className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                                >
                                    <option value="">All Actions</option>
                                    {actions.map(action => (
                                        <option key={action} value={action}>
                                            {formatAction(action)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <Label>From Date</Label>
                                <Input
                                    type="date"
                                    value={localFilters.from_date || ''}
                                    onChange={(e) => setLocalFilters({...localFilters, from_date: e.target.value})}
                                    className="mt-1"
                                />
                            </div>
                            <div>
                                <Label>To Date</Label>
                                <Input
                                    type="date"
                                    value={localFilters.to_date || ''}
                                    onChange={(e) => setLocalFilters({...localFilters, to_date: e.target.value})}
                                    className="mt-1"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="outline" onClick={clearFilters}>
                                Clear
                            </Button>
                            <Button onClick={applyFilters}>
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="max-w-md">
                    <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search logs..."
                    />
                </div>

                {/* Logs List */}
                <div className="space-y-3">
                    {filteredLogs.length === 0 ? (
                        <EmptyState
                            variant="orders"
                            className="glass-card"
                            description="No audit logs found."
                        />
                    ) : (
                        filteredLogs.map((log) => {
                            const isExpanded = expandedLogs.has(log.id);
                            const ActionIcon = ACTION_ICONS[log.action] || FileText;
                            const DeviceIcon = getDeviceIcon(log.user_agent);
                            
                            return (
                                <div key={log.id} className="glass-card-hover overflow-hidden">
                                    <div 
                                        className="p-4 cursor-pointer hover:bg-white/10 transition-colors"
                                        onClick={() => toggleExpand(log.id)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                    log.action === 'create' ? 'bg-green-100' :
                                                    log.action === 'delete' || log.action === 'force_delete' ? 'bg-red-100' :
                                                    log.action === 'login' ? 'bg-purple-100' :
                                                    'bg-blue-100'
                                                }`}>
                                                    <ActionIcon className={`w-5 h-5 ${
                                                        log.action === 'create' ? 'text-green-600' :
                                                        log.action === 'delete' || log.action === 'force_delete' ? 'text-red-600' :
                                                        log.action === 'login' ? 'text-purple-600' :
                                                        'text-blue-600'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100'}`}>
                                                            {formatAction(log.action)}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-800">
                                                            {ENTITY_LABELS[log.entity_type] || log.entity_type}
                                                        </span>
                                                        {log.entity_id && (
                                                            <span className="text-xs text-gray-500">
                                                                #{log.entity_id}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3 h-3" />
                                                            {log.user?.name || 'System'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {formatDate(log.created_at)}
                                                        </span>
                                                        {log.ip_address && (
                                                            <span className="hidden sm:flex items-center gap-1">
                                                                <DeviceIcon className="w-3 h-3" />
                                                                {log.ip_address}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {log.old_values || log.new_values ? (
                                                <div className="text-gray-400">
                                                    {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {isExpanded && (log.old_values || log.new_values) && (
                                        <div className="px-4 pb-4 pt-0 border-t border-white/10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                {log.old_values && Object.keys(log.old_values).length > 0 && (
                                                    <div className="bg-red-50/50 rounded-lg p-3">
                                                        <h4 className="text-xs font-semibold text-red-800 uppercase mb-2">Previous Values</h4>
                                                        <div className="space-y-1 text-sm">
                                                            {Object.entries(log.old_values).map(([key, value]) => (
                                                                <div key={key} className="flex justify-between">
                                                                    <span className="text-red-700">{key}:</span>
                                                                    <span className="text-red-900 font-mono">{String(value)}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {log.new_values && Object.keys(log.new_values).length > 0 && (
                                                    <div className="bg-green-50/50 rounded-lg p-3">
                                                        <h4 className="text-xs font-semibold text-green-800 uppercase mb-2">New Values</h4>
                                                        <div className="space-y-1 text-sm">
                                                            {Object.entries(log.new_values).map(([key, value]) => {
                                                                const isChange = log.old_values && log.old_values[key] !== value;
                                                                return (
                                                                    <div key={key} className="flex justify-between">
                                                                        <span className={`${isChange ? 'text-green-700 font-medium' : 'text-green-600'}`}>
                                                                            {key}:
                                                                        </span>
                                                                        <span className={`font-mono ${isChange ? 'text-green-900' : 'text-green-800'}`}>
                                                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Pagination */}
                {logs.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={logs.current_page === 1}
                            onClick={() => router.get(route('audit.index', { page: logs.current_page - 1 }))}
                        >
                            Previous
                        </Button>
                        <span className="text-sm text-gray-600">
                            Page {logs.current_page} of {logs.last_page}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={logs.current_page === logs.last_page}
                            onClick={() => router.get(route('audit.index', { page: logs.current_page + 1 }))}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
