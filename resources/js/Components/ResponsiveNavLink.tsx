import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

interface ResponsiveNavLinkProps extends PropsWithChildren {
    href: string;
    active?: boolean;
    method?: string;
    as?: string;
}

export default function ResponsiveNavLink({ href, active, children, method = 'get', as = 'a' }: ResponsiveNavLinkProps) {
    const page = usePage();
    const isActive = active ?? page.url.startsWith(href);

    return (
        <Link
            href={href}
            method={method as 'get' | 'post' | 'put' | 'patch' | 'delete'}
            as={as as 'a' | 'button'}
            className={`flex w-full items-center border-l-4 pl-3 pr-4 text-left text-base font-medium transition-colors ${
                isActive
                    ? 'border-[#7c3aed] bg-[#7c3aed]/10 text-[#7c3aed]'
                    : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800'
            }`}
        >
            {children}
        </Link>
    );
}
