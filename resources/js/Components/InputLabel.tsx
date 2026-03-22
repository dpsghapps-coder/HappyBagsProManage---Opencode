import { InputHTMLAttributes, LabelHTMLAttributes } from 'react';

interface InputLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    value?: string;
}

export default function InputLabel({ value, className, children, ...props }: InputLabelProps) {
    return (
        <label {...props} className={`text-sm font-medium text-gray-700 ${className}`}>
            {value || children}
        </label>
    );
}
