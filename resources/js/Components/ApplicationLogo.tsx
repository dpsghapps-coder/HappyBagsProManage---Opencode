import * as React from 'react';

export default function ApplicationLogo({ className }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <img 
                src="/images/HAPPY BAGS 4X4IN.jpeg" 
                alt="Happy Bags Logo" 
                className="w-10 h-10 object-contain rounded-lg"
            />
            <span className="text-[#7c3aed] font-bold text-xl">Happy Bags</span>
        </div>
    );
}
