// French bouldering grade conversion
const gradeMapping: { [key: string]: number } = {
    '2': 0,
    '2+': 1,
    '3': 2,
    '3+': 3,
    '4': 4,
    '4+': 5,
    '5': 6,
    '5+': 7,
    '6a': 8,
    '6a+': 9,
    '6b': 10,
    '6b+': 11,
    '6c': 12,
    '6c+': 13,
    '7a': 14,
    '7a+': 15,
    '7b': 16,
    '7b+': 17,
    '7c': 18,
    '7c+': 19,
    '8a': 20,
    '8a+': 21,
    '8b': 22,
    '8b+': 23,
    '8c': 24,
    '8c+': 25,
    '9a': 26
}

const numericToGradeMap: { [key: number]: string } = Object.fromEntries(
    Object.entries(gradeMapping).map(([grade, numeric]) => [numeric, grade])
)

export function gradeToNumeric(grade: string): number {
    return gradeMapping[grade] || 0
}

export function numericToGrade(numeric: number): string {
    return numericToGradeMap[numeric] ?? '?'
}

export function getAvailableGrades(): string[] {
    return Object.keys(gradeMapping).sort((a, b) => gradeMapping[a] - gradeMapping[b])
}

// Get the lowest and highest grade values for reset functionality
export function getLowestGrade(): number {
    return Math.min(...Object.values(gradeMapping))
}

export function getHighestGrade(): number {
    return Math.max(...Object.values(gradeMapping))
}

export function getGradeColor(grade: string): string {
    const colors = {
        '2': 'bg-green-500', '2+': 'bg-green-500',
        '3': 'bg-green-500', '3+': 'bg-green-500',
        '4': 'bg-lime-500', '4+': 'bg-lime-500',
        '5': 'bg-lime-500', '5+': 'bg-lime-500',
        '6a': 'bg-yellow-500', '6a+': 'bg-yellow-500',
        '6b': 'bg-orange-500', '6b+': 'bg-orange-500',
        '6c': 'bg-red-500', '6c+': 'bg-red-500',
        '7a': 'bg-red-600', '7a+': 'bg-red-600',
        '7b': 'bg-red-700', '7b+': 'bg-red-700',
        '7c': 'bg-red-800', '7c+': 'bg-red-800',
        '8a': 'bg-orange-800', '8a+': 'bg-orange-800',
        '8b': 'bg-orange-900', '8b+': 'bg-orange-900',
        '8c': 'bg-purple-800', '8c+': 'bg-purple-900',
        '9a': 'bg-black',
    }
    return colors[grade as keyof typeof colors] || 'bg-rock-500'
}

export function getGradeColorHex(grade: string): string {
    const colors = {
        '2': '#22c55e', '2+': '#22c55e',
        '3': '#22c55e', '3+': '#22c55e',
        '4': '#84cc16', '4+': '#84cc16',
        '5': '#84cc16', '5+': '#84cc16',
        '6a': '#eab308', '6a+': '#eab308',
        '6b': '#f59e0b', '6b+': '#f59e0b',
        '6c': '#ef4444', '6c+': '#ef4444',
        '7a': '#dc2626', '7a+': '#dc2626',
        '7b': '#b91c1c', '7b+': '#b91c1c',
        '7c': '#991b1b', '7c+': '#991b1b',
        '8a': '#7c2d12', '8a+': '#7c2d12',
        '8b': '#7c2d12', '8b+': '#7c2d12',
        '8c': '#581c87', '8c+': '#3b0764',
        '9a': '#000000',
    }
    return colors[grade as keyof typeof colors] || '#6b7280'
}

export function getPopularityColor(popularity: number): string {
    if (popularity >= 80) return 'text-yellow-400'
    if (popularity >= 60) return 'text-orange-400'
    if (popularity >= 40) return 'text-blue-400'
    return 'text-rock-400'
} 