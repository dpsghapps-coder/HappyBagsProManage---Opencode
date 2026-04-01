import { Link, usePage, router } from '@inertiajs/react';
import { PropsWithChildren, useState, useRef, useEffect, useCallback } from 'react';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Users,
    FileText,
    FileBarChart,
    CreditCard,
    Settings,
    UserCircle,
    User,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    Plus,
    Search,
    Bell,
    Keyboard,
    Archive,
    Shield,
    Database,
} from 'lucide-react';
import AddClientModal from '@/Components/AddClientModal';
import AddProductModal from '@/Components/AddProductModal';
import FlashNotifications from '@/Components/FlashNotifications';

interface NavItem {
    name: string;
    href: string;
    icon: React.ReactNode;
    active: boolean;
    section?: 'operations' | 'finance' | 'settings';
}

function RippleButton({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) {
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
    const buttonRef = useRef<HTMLDivElement>(null);

    const handleClick = (e: React.MouseEvent) => {
        const rect = buttonRef.current?.getBoundingClientRect();
        if (rect) {
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const newRipple = { x, y, id: Date.now() };
            setRipples([...ripples, newRipple]);
            setTimeout(() => {
                setRipples(prev => prev.filter(r => r.id !== newRipple.id));
            }, 600);
        }
        onClick?.();
    };

    return (
        <div ref={buttonRef} onClick={handleClick} className={`relative overflow-hidden ${className}`}>
            {ripples.map(ripple => (
                <span
                    key={ripple.id}
                    className="absolute rounded-full bg-white/30 animate-ripple"
                    style={{
                        left: ripple.x - 10,
                        top: ripple.y - 10,
                        width: 20,
                        height: 20,
                    }}
                />
            ))}
            {children}
        </div>
    );
}

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: React.ReactNode }>) {
    const user = usePage().props.auth?.user ?? null;
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [fabOpen, setFabOpen] = useState(false);
    const [globalSearch, setGlobalSearch] = useState('');
    const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
    const [showAddClientModal, setShowAddClientModal] = useState(false);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                setWindowWidth(window.innerWidth);
            }, 150);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            clearTimeout(timeoutId);
        };
    }, []);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        const target = event.target as HTMLElement;
        const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

        if (event.key === 'Escape') {
            setFabOpen(false);
            setMobileMenuOpen(false);
            setNotificationOpen(false);
            setShowShortcutsHelp(false);
            setShowAddClientModal(false);
            setShowAddProductModal(false);
            return;
        }

        if (isInput) return;

        switch (event.key.toLowerCase()) {
            case '/':
                event.preventDefault();
                searchInputRef.current?.focus();
                break;
            case 'n':
                event.preventDefault();
                window.location.href = '/orders/create';
                break;
            case '?':
                event.preventDefault();
                setShowShortcutsHelp(prev => !prev);
                break;
            case 'c':
                event.preventDefault();
                setShowAddClientModal(true);
                break;
            case 'p':
                event.preventDefault();
                setShowAddProductModal(true);
                break;
            case 'd':
                event.preventDefault();
                window.location.href = '/dashboard';
                break;
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setNotificationOpen(false);
            }
        };
        
        if (notificationOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [notificationOpen]);

    const isActive = (pattern: string) => {
        const currentPath = window.location.pathname;
        if (pattern === '/dashboard') {
            return currentPath === '/dashboard';
        }
        const basePath = pattern.replace('*', '');
        return currentPath === basePath || currentPath.startsWith(basePath + '/');
    };

    const userRole = user?.role ?? 'sales_rep';
    
    const navSections = {
        operations: [
            {
                name: 'Dashboard',
                href: '/dashboard',
                icon: <LayoutDashboard size={20} />,
                active: isActive('dashboard'),
            },
            {
                name: 'Orders',
                href: '/orders',
                icon: <ShoppingCart size={20} />,
                active: isActive('orders'),
            },
            ...(userRole === 'manager' || userRole === 'sales_rep' ? [{
                name: 'Archived',
                href: '/orders/archived',
                icon: <Archive size={20} />,
                active: window.location.pathname === '/orders/archived',
            }] : []),
            ...(userRole === 'manager' ? [
                {
                    name: 'Products',
                    href: '/products',
                    icon: <Package size={20} />,
                    active: isActive('products'),
                },
                {
                    name: 'Clients',
                    href: '/clients',
                    icon: <Users size={20} />,
                    active: isActive('clients'),
                },
            ] : []),
        ],
        finance: [
            ...(userRole === 'manager' ? [{
                name: 'Reports',
                href: '/reports',
                icon: <FileBarChart size={20} />,
                active: isActive('reports'),
            }] : []),
        ],
        settings: [
            ...(userRole === 'manager' ? [
                {
                    name: 'Audit Logs',
                    href: '/audit',
                    icon: <Shield size={20} />,
                    active: isActive('audit'),
                },
                {
                    name: 'Users',
                    href: '/users',
                    icon: <UserCircle size={20} />,
                    active: isActive('users'),
                },
                {
                    name: 'Backup',
                    href: '/backup',
                    icon: <Database size={20} />,
                    active: isActive('backup'),
                },
            ] : []),
            {
                name: 'Profile',
                href: '/profile',
                icon: <User size={20} />,
                active: isActive('profile'),
            },
        ],
    };

    const currentUrl = window.location.pathname;

    const renderNavItem = (item: { name: string; href: string; icon: React.ReactNode; active: boolean }) => {
        return (
            <Link
                key={item.name}
                href={item.href}
                className={`sidebar-item ${sidebarCollapsed ? 'sidebar-item-collapsed justify-center' : ''} ${item.active ? 'active' : ''}`}
                title={sidebarCollapsed ? item.name : undefined}
            >
                <div className="sidebar-icon-bg">
                    {item.icon}
                </div>
                {!sidebarCollapsed && <span>{item.name}</span>}
            </Link>
        );
    };

    const bottomNavItems = [
        { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={24} />, active: isActive('dashboard') },
        { name: 'Orders', href: '/orders', icon: <ShoppingCart size={24} />, active: isActive('orders') },
        ...(userRole === 'manager' ? [
            { name: 'Products', href: '/products', icon: <Package size={24} />, active: isActive('products') },
            { name: 'Clients', href: '/clients', icon: <Users size={24} />, active: isActive('clients') },
        ] : []),
        { name: 'More', href: '#', icon: <Menu size={24} />, active: false, isMore: true },
    ];

    const fabActions = [
        ...(userRole === 'manager' || userRole === 'sales_rep' ? [
            { name: 'New Order', href: '/orders/create', icon: <FileText size={20} />, onClick: () => window.location.href = '/orders/create' },
        ] : []),
        ...(userRole === 'manager' ? [
            { name: 'Add Client', href: '/clients/create', icon: <Users size={20} />, onClick: () => { setFabOpen(false); setShowAddClientModal(true); } },
            { name: 'New Product', href: '/products/create', icon: <Package size={20} />, onClick: () => { setFabOpen(false); setShowAddProductModal(true); } },
        ] : []),
    ];

    const handleGlobalSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (globalSearch.trim()) {
            router.get('/orders', { search: globalSearch }, { preserveState: true });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
            {/* Desktop Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-screen sidebar-glass z-40 transition-all duration-300 hidden md:flex flex-col ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <img
                            src="/images/HAPPY BAGS 4X4IN.jpeg"
                            alt="Happy Bags Logo"
                            className={`${sidebarCollapsed ? 'w-14 h-14' : 'w-12 h-12'} object-contain rounded-lg transition-all duration-300`}
                        />
                        {!sidebarCollapsed && (
                            <div className="flex flex-col">
                                <span className="text-white font-bold text-lg leading-tight">Happy Bags</span>
                                <span className="text-white/50 text-xs">Pro Manager</span>
                            </div>
                        )}
                    </Link>
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="sidebar-collapse-btn"
                    >
                        {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto hide-scrollbar">
                    {/* Operations Section */}
                    <div className="sidebar-section">
                        {!sidebarCollapsed && <div className="sidebar-section-title">Operations</div>}
                        {navSections.operations.map(item => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`sidebar-item ${sidebarCollapsed ? 'sidebar-item-collapsed justify-center' : ''} ${item.active ? 'active' : ''}`}
                                title={sidebarCollapsed ? item.name : undefined}
                            >
                                <div className="sidebar-icon-bg">
                                    {item.icon}
                                </div>
                                {!sidebarCollapsed && <span>{item.name}</span>}
                            </Link>
                        ))}
                    </div>

                    {/* Finance Section */}
                    <div className="sidebar-section">
                        {!sidebarCollapsed && <div className="sidebar-section-title">Finance</div>}
                        {navSections.finance.map(item => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`sidebar-item ${sidebarCollapsed ? 'sidebar-item-collapsed justify-center' : ''} ${item.active ? 'active' : ''}`}
                                title={sidebarCollapsed ? item.name : undefined}
                            >
                                <div className="sidebar-icon-bg">
                                    {item.icon}
                                </div>
                                {!sidebarCollapsed && <span>{item.name}</span>}
                            </Link>
                        ))}
                    </div>

                    {/* Settings Section */}
                    <div className="sidebar-section">
                        {!sidebarCollapsed && <div className="sidebar-section-title">Settings</div>}
                        {navSections.settings.map(item => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`sidebar-item ${sidebarCollapsed ? 'sidebar-item-collapsed justify-center' : ''} ${item.active ? 'active' : ''}`}
                                title={sidebarCollapsed ? item.name : undefined}
                            >
                                <div className="sidebar-icon-bg">
                                    {item.icon}
                                </div>
                                {!sidebarCollapsed && <span>{item.name}</span>}
                            </Link>
                        ))}
                    </div>
                </nav>

                {/* User Section */}
                <div className="p-3 border-t border-white/10 space-y-2">
                    <button
                        onClick={() => setNotificationOpen(!notificationOpen)}
                        className={`sidebar-item w-full ${sidebarCollapsed ? 'sidebar-item-collapsed justify-center' : ''}`}
                        title={sidebarCollapsed ? 'Notifications' : undefined}
                    >
                        <div className="sidebar-icon-bg relative">
                            <Bell size={20} />
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
                        </div>
                        {!sidebarCollapsed && <span>Notifications</span>}
                    </button>
                    
                    {notificationOpen && !sidebarCollapsed && (
                        <div className="ml-2 mr-2 p-3 bg-white/10 rounded-xl border border-white/10">
                            <p className="text-white text-xs text-center">No new notifications</p>
                        </div>
                    )}
                    
                    <Link
                        href={route('profile.edit')}
                        className={`sidebar-user-card ${sidebarCollapsed ? 'sidebar-item-collapsed justify-center' : ''}`}
                        title={sidebarCollapsed ? 'Profile' : undefined}
                    >
                        <div className="sidebar-icon-bg">
                            <User size={20} />
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                                <p className="text-white/50 text-xs truncate">{user.role}</p>
                            </div>
                        )}
                    </Link>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className={`sidebar-item w-full ${sidebarCollapsed ? 'sidebar-item-collapsed justify-center' : ''}`}
                        title={sidebarCollapsed ? 'Logout' : undefined}
                    >
                        <div className="sidebar-icon-bg">
                            <LogOut size={20} />
                        </div>
                        {!sidebarCollapsed && <span>Logout</span>}
                    </Link>
                </div>
            </aside>

            {/* Mobile Header with Global Search */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass-nav">
                <div className="flex items-center justify-between h-14 px-4">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <img
                            src="/images/HAPPY BAGS 4X4IN.jpeg"
                            alt="Happy Bags Logo"
                            className="w-10 h-10 object-contain rounded-lg"
                        />
                        <span className="text-gray-800 font-bold">Happy Bags</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div ref={notificationRef} className="relative">
                            <button 
                                onClick={() => setNotificationOpen(!notificationOpen)}
                                className="p-2 rounded-xl hover:bg-white/20 transition-colors relative active:bg-white/30"
                            >
                                <Bell size={20} className="text-gray-600" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                            </button>
                            
                            {notificationOpen && (
                                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-[60] animate-scale-in">
                                    <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                                        <p className="font-semibold">Notifications</p>
                                        <p className="text-xs text-white/80">No new notifications</p>
                                    </div>
                                    <div className="p-4 text-center text-gray-500">
                                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                                        <p className="text-sm">You're all caught up!</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-xl hover:bg-white/20 transition-colors active:bg-white/30"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
                {/* Global Search */}
                <form onSubmit={handleGlobalSearch} className="px-4 pb-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            placeholder="Search orders, clients... (Press /)"
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/80 backdrop-blur-sm border border-white/40 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500/50 transition-all"
                        />
                    </div>
                </form>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <>
                    <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />
                    <div className="mobile-menu-panel">
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <img
                                    src="/images/HAPPY BAGS 4X4IN.jpeg"
                                    alt="Happy Bags Logo"
                                    className="w-12 h-12 object-contain rounded-lg"
                                />
                                <div>
                                    <p className="text-white font-bold">{user.name}</p>
                                    <p className="text-white/50 text-sm">{user.role}</p>
                                </div>
                            </div>
                            <button onClick={() => setMobileMenuOpen(false)} className="mobile-menu-close">
                                <X size={24} />
                            </button>
                        </div>

                        <nav className="p-4 space-y-1">
                            <div className="text-xs font-semibold text-white/40 uppercase tracking-wider px-4 py-2">Finance</div>
                            {navSections.finance.map(item => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`mobile-menu-item mobile-menu-item-stagger ${item.active ? 'active' : ''}`}
                                >
                                    <div className="sidebar-icon-bg">{item.icon}</div>
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                            <div className="text-xs font-semibold text-white/40 uppercase tracking-wider px-4 py-2 mt-4">Settings</div>
                            {navSections.settings.map(item => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`mobile-menu-item mobile-menu-item-stagger ${item.active ? 'active' : ''}`}
                                >
                                    <div className="sidebar-icon-bg">{item.icon}</div>
                                    <span>{item.name}</span>
                                </Link>
                            ))}
                        </nav>

                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                            <div className="mobile-menu-divider" />
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="mobile-menu-item mobile-menu-item-stagger w-full"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <div className="sidebar-icon-bg"><LogOut size={20} /></div>
                                <span>Logout</span>
                            </Link>
                        </div>
                    </div>
                </>
            )}

            {/* Main Content */}
            <main
                key={`main-${windowWidth}`}
                className={`transition-all duration-300 ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} pt-28 md:pt-0 pb-24 md:pb-0`}
            >
                {header && (
                    <header className="glass-surface mb-6 mx-4 md:mx-6">
                        <div className="max-w-7xl mx-auto px-4 py-4">
                            {header}
                        </div>
                    </header>
                )}
                <div className="p-4 md:p-6">{children}</div>
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bottom-nav-glass z-50">
                <div className="flex justify-around items-center h-16 px-2">
                    {bottomNavItems.map((item) => (
                        item.isMore ? (
                            <RippleButton
                                key={item.name}
                                onClick={() => setMobileMenuOpen(true)}
                                className="bottom-nav-item"
                            >
                                <div className="bottom-nav-icon-wrapper">
                                    <div className="bottom-nav-pill" />
                                    {item.icon}
                                </div>
                                <span className="bottom-nav-label">{item.name}</span>
                            </RippleButton>
                        ) : (
                            <RippleButton
                                key={item.name}
                                onClick={() => window.location.href = item.href}
                                className={`bottom-nav-item ${item.active ? 'active' : ''}`}
                            >
                                <div className="bottom-nav-icon-wrapper">
                                    <div className="bottom-nav-pill" />
                                    {item.icon}
                                </div>
                                <span className="bottom-nav-label">{item.name}</span>
                            </RippleButton>
                        )
                    ))}
                </div>
            </nav>

            {/* Floating Action Button */}
            <div className="md:hidden fixed bottom-20 right-4 z-50">
                {/* FAB Menu */}
                <div className={`absolute bottom-16 right-0 flex flex-col gap-2 items-end transition-all duration-300 ${fabOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                    {fabActions.map((action, index) => (
                        action.onClick ? (
                            <button
                                key={action.name}
                                onClick={action.onClick}
                                className="flex items-center gap-3 glass-card px-4 py-2.5 rounded-xl animate-slide-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <span className="text-sm font-medium text-gray-700">{action.name}</span>
                                <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center text-accent-600">
                                    {action.icon}
                                </div>
                            </button>
                        ) : (
                            <Link
                                key={action.name}
                                href={action.href}
                                onClick={() => setFabOpen(false)}
                                className="flex items-center gap-3 glass-card px-4 py-2.5 rounded-xl animate-slide-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <span className="text-sm font-medium text-gray-700">{action.name}</span>
                                <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center text-accent-600">
                                    {action.icon}
                                </div>
                            </Link>
                        )
                    ))}
                </div>
                
                {/* FAB Button */}
                <button
                    onClick={() => setFabOpen(!fabOpen)}
                    className={`fab-button transition-all duration-300 ${fabOpen ? 'rotate-45' : ''}`}
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* FAB Backdrop */}
            {fabOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setFabOpen(false)}
                />
            )}

            {/* Keyboard Shortcuts Help Modal */}
            {showShortcutsHelp && (
                <>
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] animate-fade-in"
                        onClick={() => setShowShortcutsHelp(false)}
                    />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass-modal-content z-[70] animate-scale-in p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-accent-100 flex items-center justify-center">
                                    <Keyboard className="w-5 h-5 text-accent-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Keyboard Shortcuts</h2>
                            </div>
                            <button
                                onClick={() => setShowShortcutsHelp(false)}
                                className="p-2 rounded-xl hover:bg-white/20 text-gray-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between py-2 border-b border-white/10">
                                <span className="text-gray-600">Quick Actions</span>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">N</kbd>
                                    <span className="text-sm text-gray-500">New Order</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-white/10">
                                <span className="text-gray-600">Search</span>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">/</kbd>
                                    <span className="text-sm text-gray-500">Focus search</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-white/10">
                                <span className="text-gray-600">Add Client</span>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">C</kbd>
                                    <span className="text-sm text-gray-500">New Client</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-white/10">
                                <span className="text-gray-600">Add Product</span>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">P</kbd>
                                    <span className="text-sm text-gray-500">New Product</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-white/10">
                                <span className="text-gray-600">Dashboard</span>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">D</kbd>
                                    <span className="text-sm text-gray-500">Go to Dashboard</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-600">Help</span>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">?</kbd>
                                    <span className="text-sm text-gray-500">Show shortcuts</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-gray-600">Close</span>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Esc</kbd>
                                    <span className="text-sm text-gray-500">Close modals</span>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-6">
                            Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">?</kbd> anytime to toggle this help
                        </p>
                    </div>
                </>
            )}

            {/* Keyboard Shortcuts Hint (Desktop) */}
            <button
                onClick={() => setShowShortcutsHelp(true)}
                className="hidden lg:flex fixed bottom-20 right-4 z-40 items-center gap-2 px-3 py-2 rounded-xl glass text-gray-500 hover:text-gray-700 transition-colors text-sm"
                title="Keyboard Shortcuts (?)"
            >
                <Keyboard className="w-4 h-4" />
                <span>Shortcuts</span>
            </button>

            <style>{`
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
                .animate-ripple {
                    animation: ripple 0.6s ease-out forwards;
                }
            `}</style>

            <AddClientModal
                show={showAddClientModal}
                onClose={() => setShowAddClientModal(false)}
                onSuccess={() => {}}
            />

            <AddProductModal
                show={showAddProductModal}
                onClose={() => setShowAddProductModal(false)}
                onSuccess={() => {}}
            />

            <FlashNotifications />
        </div>
    );
}
