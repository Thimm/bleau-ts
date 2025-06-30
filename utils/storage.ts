/**
 * Utility functions for localStorage operations with JSON serialization
 */

export function saveJSON(key: string, value: any): void {
    try {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(value))
        }
    } catch (error) {
        console.error(`Error saving to localStorage (${key}):`, error)
    }
}

export function loadJSON<T>(key: string, defaultValue: T): T {
    try {
        if (typeof window !== 'undefined') {
            const item = window.localStorage.getItem(key)
            if (item !== null) {
                return JSON.parse(item)
            }
        }
    } catch (error) {
        console.error(`Error loading from localStorage (${key}):`, error)
    }
    return defaultValue
} 