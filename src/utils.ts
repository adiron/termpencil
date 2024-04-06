export function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
    return arr.reduce((acc, _, i) => {
        if (i % chunkSize === 0) {
            acc.push(arr.slice(i, i + chunkSize));
        }
        return acc;
    }, [] as T[][]);
}