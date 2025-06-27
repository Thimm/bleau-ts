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
    if (!grade) return 0
    const cleanGrade = grade.trim().toLowerCase()
    return gradeMapping[cleanGrade] ?? 0
}

export function numericToGrade(numeric: number): string {
    return numericToGradeMap[numeric] ?? '?'
}

export function getAvailableGrades(): string[] {
    return Object.keys(gradeMapping).sort((a, b) => gradeMapping[a] - gradeMapping[b])
} 