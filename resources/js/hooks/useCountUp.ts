import { useState, useEffect, useRef, useCallback } from 'react';

interface UseCountUpOptions {
    start?: number;
    end: number;
    duration?: number;
    decimals?: number;
    easing?: boolean;
    prefix?: string;
    suffix?: string;
    onComplete?: () => void;
}

interface UseCountUpReturn {
    value: number;
    displayValue: string;
    start: () => void;
    reset: () => void;
    isComplete: boolean;
}

export function useCountUp({
    start = 0,
    end,
    duration = 2000,
    decimals = 0,
    easing = true,
    prefix = '',
    suffix = '',
    onComplete,
}: UseCountUpOptions): UseCountUpReturn {
    const [value, setValue] = useState(start);
    const [isComplete, setIsComplete] = useState(false);
    const startTimeRef = useRef<number | null>(null);
    const startValueRef = useRef(start);
    const rafRef = useRef<number | null>(null);

    const easeOutQuart = (t: number): number => {
        return 1 - Math.pow(1 - t, 4);
    };

    const formatNumber = useCallback((num: number): string => {
        const formatted = num.toFixed(decimals);
        return `${prefix}${Number(formatted).toLocaleString()}${suffix}`;
    }, [decimals, prefix, suffix]);

    const animate = useCallback((timestamp: number) => {
        if (startTimeRef.current === null) {
            startTimeRef.current = timestamp;
        }

        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing ? easeOutQuart(progress) : progress;

        const currentValue = startValueRef.current + (end - startValueRef.current) * easedProgress;
        setValue(currentValue);

        if (progress < 1) {
            rafRef.current = requestAnimationFrame(animate);
        } else {
            setValue(end);
            setIsComplete(true);
            onComplete?.();
        }
    }, [duration, easing, end, onComplete]);

    const startAnimation = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }
        
        startTimeRef.current = null;
        startValueRef.current = value;
        setIsComplete(false);
        rafRef.current = requestAnimationFrame(animate);
    }, [animate, value]);

    const reset = useCallback(() => {
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
        }
        startTimeRef.current = null;
        setValue(start);
        setIsComplete(false);
    }, [start]);

    useEffect(() => {
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

    return {
        value,
        displayValue: formatNumber(value),
        start: startAnimation,
        reset,
        isComplete,
    };
}

export function useCountUpOnMount(
    options: UseCountUpOptions
): UseCountUpReturn {
    const countUp = useCountUp(options);
    const hasStartedRef = useRef(false);

    useEffect(() => {
        if (!hasStartedRef.current && options.end > 0) {
            hasStartedRef.current = true;
            setTimeout(() => {
                countUp.start();
            }, 100);
        }
    }, [options.end]);

    return countUp;
}
