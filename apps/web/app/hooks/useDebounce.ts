import { useState, useEffect } from 'react';

/**
 * Returns a debounced value that updates only after `delay` ms have passed
 * since the last change to `value`. Used to throttle API calls from search/filter inputs.
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
