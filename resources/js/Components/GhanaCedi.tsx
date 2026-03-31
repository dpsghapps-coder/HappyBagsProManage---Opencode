interface GhanaCediProps {
    className?: string;
    size?: number;
}

export default function GhanaCedi({ className = "", size = 24 }: GhanaCediProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 2v20M8 6c2.5-1 5.5-1 8 0M8 10c2.5-1 5.5-1 8 0M8 14c2.5-1 5.5-1 8 0" />
            <line x1="8" y1="18" x2="16" y2="18" />
        </svg>
    );
}