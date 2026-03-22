import { useEffect, useCallback, useRef } from 'react';

interface Shortcut {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    action: () => void;
    description?: string;
    preventDefault?: boolean;
}

interface UseKeyboardShortcutsOptions {
    enabled?: boolean;
    ignoreInputs?: boolean;
}

const defaultIgnoreTags = ['INPUT', 'TEXTAREA', 'SELECT'];

export function useKeyboardShortcuts(
    shortcuts: Shortcut[],
    options: UseKeyboardShortcutsOptions = {}
) {
    const { enabled = true, ignoreInputs = true } = options;
    const shortcutsRef = useRef(shortcuts);

    useEffect(() => {
        shortcutsRef.current = shortcuts;
    }, [shortcuts]);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!enabled) return;

        if (ignoreInputs && defaultIgnoreTags.includes((event.target as HTMLElement).tagName)) {
            return;
        }

        for (const shortcut of shortcutsRef.current) {
            const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase() ||
                              event.code.toLowerCase() === shortcut.key.toLowerCase();
            
            const ctrlMatches = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
            const shiftMatches = shortcut.shift ? event.shiftKey : !event.shiftKey;
            const altMatches = shortcut.alt ? event.altKey : !event.altKey;

            if (keyMatches && ctrlMatches && shiftMatches && altMatches) {
                if (shortcut.preventDefault !== false) {
                    event.preventDefault();
                }
                shortcut.action();
                break;
            }
        }
    }, [enabled, ignoreInputs]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return shortcuts;
}

export function useSearchShortcut(
    onSearch: () => void,
    options?: { enabled?: boolean }
) {
    return useKeyboardShortcuts([
        { key: '/', action: onSearch, preventDefault: false },
    ], options);
}

export function useEscapeShortcut(
    onEscape: () => void,
    options?: { enabled?: boolean }
) {
    return useKeyboardShortcuts([
        { key: 'Escape', action: onEscape },
    ], options);
}

export function useNewItemShortcut(
    onNew: () => void,
    options?: { enabled?: boolean }
) {
    return useKeyboardShortcuts([
        { key: 'n', action: onNew, preventDefault: true },
    ], options);
}
