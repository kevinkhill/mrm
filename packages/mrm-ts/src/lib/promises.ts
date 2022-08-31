/**
 * Runs an array of promises in series
 */
export function promiseSeries<T>(items: T[], iterator: (item: T) => unknown) {
	return items.reduce((iterable, name) => {
		return iterable.then(() => iterator(name));
	}, Promise.resolve());
}

/**
 * Executes promise-returning thunks in series until one is resolved
 *
 * @method promiseFirst
 *
 * @param  {Array} thunks
 * @return {Promise}
 */
export async function promiseFirst<T extends () => unknown>(
	thunks: T[],
	errors: Error[] = []
) {
	if (thunks.length === 0) {
		throw new Error(`None of the ${errors.length} thunks resolved.

${errors.join("\n")}`);
	} else {
		const [thunk, ...rest] = thunks;
		try {
			return await thunk();
		} catch (error) {
			return promiseFirst(rest, [...errors, error]);
		}
	}
}
