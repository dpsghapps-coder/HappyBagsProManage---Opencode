interface GlassmorphicTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
        color: string;
        dataKey: string;
        payload?: Record<string, any>;
    }>;
    label?: string;
    formatter?: (value: number, name: string) => [string, string];
}

export default function GlassmorphicTooltip({ active, payload, label, formatter }: GlassmorphicTooltipProps) {
    if (!active || !payload || payload.length === 0) {
        return null;
    }

    const formatValue = (value: number, name: string) => {
        if (formatter) {
            return formatter(value, name);
        }
        return [`GHC ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, name];
    };

    return (
        <div className="
            bg-white/80 
            backdrop-blur-xl 
            border border-white/40 
            rounded-xl 
            px-4 py-3 
            shadow-glass-lg
        ">
            {label && (
                <p className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
            )}
            <div className="space-y-1.5">
                {payload.map((entry, index) => {
                    const [formattedValue, formattedName] = formatValue(entry.value, entry.name);
                    return (
                        <div key={index} className="flex items-center gap-2">
                            <div 
                                className="w-3 h-3 rounded-full shadow-sm"
                                style={{ backgroundColor: entry.color || '#7c3aed' }}
                            />
                            <p className="text-sm text-gray-600">{formattedName}:</p>
                            <p className="text-sm font-semibold text-gray-800">{formattedValue}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
