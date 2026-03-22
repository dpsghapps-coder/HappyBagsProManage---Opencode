import { InputHTMLAttributes, forwardRef } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
    isFocused?: boolean;
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({ className = '', isFocused, ...props }, ref) => {
    return (
        <input
            {...props}
            ref={ref}
            className={`flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c3aed]/20 focus-visible:border-[#7c3aed] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            autoFocus={isFocused}
        />
    );
});

TextInput.displayName = 'TextInput';

export default TextInput;
