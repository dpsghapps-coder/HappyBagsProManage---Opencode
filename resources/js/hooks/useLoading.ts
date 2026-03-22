import { useState, useCallback, useRef } from 'react';

interface UseLoadingOptions {
    timeout?: number;
}

interface UseLoadingReturn {
    isLoading: boolean;
    error: Error | null;
    startLoading: () => void;
    stopLoading: () => void;
    setError: (error: Error | null) => void;
    withLoading: <T>(promise: Promise<T>) => Promise<T>;
    withTimeout: <T>(promise: Promise<T>, timeout?: number) => Promise<T>;
}

export function useLoading(options?: UseLoadingOptions): UseLoadingReturn {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const startLoading = useCallback(() => {
        setIsLoading(true);
        setError(null);
        
        if (options?.timeout) {
            timeoutRef.current = setTimeout(() => {
                setIsLoading(false);
                setError(new Error('Request timed out'));
            }, options.timeout);
        }
    }, [options?.timeout]);

    const stopLoading = useCallback(() => {
        setIsLoading(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const withLoading = useCallback(async <T,>(promise: Promise<T>): Promise<T> => {
        startLoading();
        try {
            const result = await promise;
            stopLoading();
            return result;
        } catch (err) {
            stopLoading();
            setError(err instanceof Error ? err : new Error('An error occurred'));
            throw err;
        }
    }, [startLoading, stopLoading]);

    const withTimeout = useCallback(async <T,>(
        promise: Promise<T>,
        timeout?: number
    ): Promise<T> => {
        const timeoutMs = timeout ?? options?.timeout ?? 30000;
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
        });
        
        startLoading();
        try {
            const result = await Promise.race([promise, timeoutPromise]);
            stopLoading();
            return result;
        } catch (err) {
            stopLoading();
            setError(err instanceof Error ? err : new Error('An error occurred'));
            throw err;
        }
    }, [options?.timeout, startLoading, stopLoading]);

    return {
        isLoading,
        error,
        startLoading,
        stopLoading,
        setError,
        withLoading,
        withTimeout,
    };
}

export function useSkeleton<T>(
    fetchFn: () => Promise<T>,
    options?: {
        initialData?: T;
        timeout?: number;
    }
) {
    const [data, setData] = useState<T | undefined>(options?.initialData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetch = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(() => reject(new Error('Request timed out')), options?.timeout ?? 30000);
            });

            const result = await Promise.race([fetchFn(), timeoutPromise]);
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An error occurred'));
        } finally {
            setIsLoading(false);
        }
    }, [fetchFn, options?.timeout]);

    return {
        data,
        setData,
        isLoading,
        error,
        refetch: fetch,
    };
}
