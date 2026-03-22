import { ButtonHTMLAttributes } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export default function PrimaryButton({ className = '', children, ...props }: PrimaryButtonProps) {
    return (
        <button
            {...props}
            className={`inline-flex items-center rounded-lg bg-[#7c3aed] px-4 py-2 text-sm font-semibold text-white shadow-sm ring-offset-white transition-colors hover:bg-[#8b5cf6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${className}`}
        >
            {children}
        </button>
    );
}
