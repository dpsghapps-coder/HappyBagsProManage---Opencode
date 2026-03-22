import { InputHTMLAttributes } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {}

export default function Checkbox({ className, ...props }: CheckboxProps) {
    return (
        <input
            type="checkbox"
            className={`rounded border-gray-300 text-[#7c3aed] shadow-sm focus:ring-[#7c3aed] ${className}`}
            {...props}
        />
    );
}
