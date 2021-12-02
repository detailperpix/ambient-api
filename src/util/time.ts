export function now(unit = 's'): number {
    let value = Date.now();
    switch (unit) {
        case 's':
            value /= 1000;
            break;
        case 'ms':
            break;
        case 'us':
            value *= 1000;
            break;
        case 'ns':
            value *= 1000_000;
            break;
        default:
            throw Error(`Unknown precision of type ${unit}`);
    }
    return Math.floor(value);
}

export function sleep(milliseconds = 1000): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function secondsToMinutes(seconds: number, int = true): number {
    const minutes = seconds / 60;
    return int ? Math.floor(minutes) : minutes;
}