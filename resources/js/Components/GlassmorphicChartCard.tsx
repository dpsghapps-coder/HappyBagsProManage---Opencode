interface GlassmorphicChartCardProps {
    title: string;
    children: React.ReactNode;
}

export default function GlassmorphicChartCard({ title, children }: GlassmorphicChartCardProps) {
    return (
        <div className="
            bg-white/10 
            backdrop-blur-lg 
            border border-white/20 
            rounded-2xl 
            shadow-xl
            p-6
        ">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            {children}
        </div>
    );
}
