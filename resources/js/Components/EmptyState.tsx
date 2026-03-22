import { FileText, Users, Package, ShoppingCart, Receipt, Search, Plus } from 'lucide-react';
import { Button } from '@/Components/ui/button';

type EmptyStateVariant = 'orders' | 'clients' | 'products' | 'payments' | 'search' | 'general';

interface EmptyStateProps {
    variant?: EmptyStateVariant;
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
    className?: string;
}

const illustrations: Record<EmptyStateVariant, React.ReactNode> = {
    orders: (
        <svg className="w-full h-full" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="40" width="140" height="100" rx="12" fill="#F3F4F6" />
            <rect x="40" y="55" width="80" height="8" rx="4" fill="#DDD6FE" />
            <rect x="40" y="70" width="60" height="6" rx="3" fill="#E5E7EB" />
            <rect x="40" y="85" width="100" height="6" rx="3" fill="#E5E7EB" />
            <rect x="40" y="100" width="70" height="6" rx="3" fill="#E5E7EB" />
            <rect x="40" y="115" width="50" height="6" rx="3" fill="#E5E7EB" />
            <circle cx="160" cy="50" r="25" fill="#7C3AED" fillOpacity="0.1" />
            <path d="M150 50H170M160 40V60" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" />
            <rect x="145" y="45" width="30" height="10" rx="5" fill="#7C3AED" fillOpacity="0.2" />
        </svg>
    ),
    clients: (
        <svg className="w-full h-full" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="50" r="35" fill="#F3F4F6" />
            <circle cx="100" cy="45" r="15" fill="#DDD6FE" />
            <path d="M75 75C75 60 87 50 100 50C113 50 125 60 125 75" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="155" cy="90" r="20" fill="#7C3AED" fillOpacity="0.1" />
            <path d="M155 82V98M147 90H163" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
            <circle cx="45" cy="90" r="20" fill="#7C3AED" fillOpacity="0.1" />
            <path d="M45 82V98M37 90H53" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    products: (
        <svg className="w-full h-full" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="35" y="50" width="60" height="70" rx="8" fill="#F3F4F6" />
            <rect x="45" y="60" width="40" height="30" rx="4" fill="#DDD6FE" />
            <rect x="55" y="100" width="20" height="8" rx="4" fill="#7C3AED" fillOpacity="0.3" />
            <rect x="105" y="40" width="60" height="70" rx="8" fill="#F3F4F6" />
            <rect x="115" y="50" width="40" height="30" rx="4" fill="#DDD6FE" />
            <rect x="125" y="90" width="20" height="8" rx="4" fill="#7C3AED" fillOpacity="0.3" />
            <circle cx="160" cy="130" r="20" fill="#7C3AED" fillOpacity="0.1" />
            <path d="M160 122V138M152 130H168" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    payments: (
        <svg className="w-full h-full" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="30" width="120" height="80" rx="12" fill="#F3F4F6" />
            <rect x="55" y="45" width="60" height="10" rx="5" fill="#DDD6FE" />
            <rect x="55" y="65" width="40" height="6" rx="3" fill="#E5E7EB" />
            <rect x="55" y="80" width="90" height="6" rx="3" fill="#E5E7EB" />
            <circle cx="140" cy="95" r="15" fill="#10B981" fillOpacity="0.2" />
            <path d="M134 95L138 99L146 91" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="170" cy="130" r="20" fill="#7C3AED" fillOpacity="0.1" />
            <path d="M170 122V138M162 130H178" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    search: (
        <svg className="w-full h-full" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="85" cy="70" r="40" fill="#F3F4F6" />
            <circle cx="85" cy="70" r="25" fill="#DDD6FE" />
            <circle cx="85" cy="70" r="15" fill="#7C3AED" fillOpacity="0.3" />
            <path d="M108 93L130 115" stroke="#7C3AED" strokeWidth="6" strokeLinecap="round" />
            <path d="M60 55L55 45M75 50L85 35M95 55L110 45" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
        </svg>
    ),
    general: (
        <svg className="w-full h-full" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="30" width="140" height="100" rx="12" fill="#F3F4F6" />
            <circle cx="100" cy="80" r="30" fill="#DDD6FE" />
            <path d="M90 80L98 88L112 72" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
};

const defaultContent: Record<EmptyStateVariant, { title: string; description: string; actionLabel: string }> = {
    orders: {
        title: 'No orders yet',
        description: 'Get started by creating your first order to track sales and payments.',
        actionLabel: 'Create Order',
    },
    clients: {
        title: 'No clients yet',
        description: 'Add your first client to start building your customer directory.',
        actionLabel: 'Add Client',
    },
    products: {
        title: 'No products yet',
        description: 'Add products to your catalog to start selling.',
        actionLabel: 'Add Product',
    },
    payments: {
        title: 'No payments yet',
        description: 'Payments will appear here once orders are paid.',
        actionLabel: '',
    },
    search: {
        title: 'No results found',
        description: 'Try adjusting your search criteria or filters.',
        actionLabel: '',
    },
    general: {
        title: 'Nothing here yet',
        description: 'Start by adding some content.',
        actionLabel: 'Get Started',
    },
};

export function EmptyState({
    variant = 'general',
    title,
    description,
    actionLabel,
    onAction,
    secondaryActionLabel,
    onSecondaryAction,
    className = '',
}: EmptyStateProps) {
    const defaults = defaultContent[variant];
    const displayTitle = title ?? defaults.title;
    const displayDescription = description ?? defaults.description;
    const displayActionLabel = actionLabel ?? defaults.actionLabel;

    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
            <div className="w-48 h-40 mb-6">
                {illustrations[variant]}
            </div>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {displayTitle}
            </h3>
            
            <p className="text-gray-500 max-w-sm mb-6">
                {displayDescription}
            </p>
            
            {(displayActionLabel || secondaryActionLabel) && (
                <div className="flex flex-col sm:flex-row gap-3">
                    {displayActionLabel && onAction && (
                        <Button onClick={onAction} className="gap-2">
                            <Plus className="w-4 h-4" />
                            {displayActionLabel}
                        </Button>
                    )}
                    {secondaryActionLabel && onSecondaryAction && (
                        <Button variant="ghost" onClick={onSecondaryAction}>
                            {secondaryActionLabel}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

export function LoadingState({ className = '' }: { className?: string }) {
    return (
        <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
            <div className="w-12 h-12 rounded-full border-4 border-accent-200 border-t-accent-600 animate-spin mb-4" />
            <p className="text-gray-500">Loading...</p>
        </div>
    );
}

export function ErrorState({
    message = 'Something went wrong',
    onRetry,
    className = '',
}: {
    message?: string;
    onRetry?: () => void;
    className?: string;
}) {
    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error</h3>
            <p className="text-gray-500 mb-4">{message}</p>
            {onRetry && (
                <Button variant="outline" onClick={onRetry}>
                    Try Again
                </Button>
            )}
        </div>
    );
}
