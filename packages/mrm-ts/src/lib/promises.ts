/**
 * Process an array of strings, feeding into a function, that resolves promises, in series.
 *
 * @link https://stackoverflow.com/a/29906506
 */
export async function promiseSeries<T>(
	array: string[],
	fn: (arrItem: string) => Promise<T>
) {
	const results = {} as Record<string, T>;
	for (let i = 0; i < array.length; i++) {
		const currItem = array[i];
		const r = await fn(currItem);
		results[currItem] = r;
	}
	return results; // will be resolved value of promise
}

/**
 * Executes promise-returning thunks in series until one is resolved
 */
export async function promiseFirst<T>(
	thunks: Array<(() => Promise<T>) | (() => T)>,
	errors: Error[] = []
): Promise<T> {
	if (thunks.length === 0) {
		throw new Error(`None of the ${errors.length} thunks resolved.

${errors.join("\n")}`);
	} else {
		const [thunk, ...rest] = thunks;
		try {
			return await thunk();
		} catch (error) {
			return promiseFirst(rest, [...errors, error as Error]);
		}
	}
}
