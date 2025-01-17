export function isNil(value: unknown): value is undefined | null {
    return value === undefined || value === null;
}

export function isStringEmpty(value: string | undefined | null): boolean {
    return isNil(value) || value!.trim().length === 0;
}

// Сравнивает ссылки на объект
export function areArraysEqual<T>(first: T[], second: T[]): boolean {
    if (first.length !== second.length) {
        // Кейс: массивы имеют разный размер
        return false;
    } // Кейс: массивы имеют одинаковый размер
    first.sort();
    second.sort();

    for (let i = 0; i < first.length; i++) {
        if (first[i] !== second[i]) {
            return false;
        }
    }

    return true;
}

// функция-заглушка
export function noop(): void {}

export function isMobileBrowser(): boolean {
    return /Mobile/i.test(window.navigator.userAgent);
}

export function normalizeSpaces(inputText: string): string {
    return inputText.trim().replace(/([^\S\n ]|[^\P{C}\n ]|[^\P{Z}\n ])/gmu, ' ');
}
