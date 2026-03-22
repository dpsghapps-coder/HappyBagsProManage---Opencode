import { Input } from '@/Components/ui/input';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }: SearchBarProps) {
    return (
        <div className={`relative ${className}`}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-11 pl-12 pr-10 rounded-xl bg-white/60 backdrop-blur-sm border border-white/40 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500/40 focus:border-accent-500/50 transition-all duration-200"
            />
            {value && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center rounded-r-xl hover:bg-white/20 transition-colors"
                >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </button>
            )}
        </div>
    );
}
