import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

interface NavLinkProps extends PropsWithChildren {
    href: string;
    active?: boolean;
}

export default function NavLink({ href, active, children }: NavLinkProps) {
    const page = usePage();
    const isActive = active ?? page.url.startsWith(href);

    return (
        <Link
            href={href}
            className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium transition-colors ${
                isActive
                    ? 'border-[#7c3aed] text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
        >
            {children}
        </Link>
    );
}
