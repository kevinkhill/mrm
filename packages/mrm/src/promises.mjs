// @ts-check

/**
 * Runs an array of promises in series
 *
 * @method promiseSeries
 *
 * @param  {Array} items
 * @param  {Function} iterator
 * @return {Promise}
 */
export function promiseSeries(items, iterator) {
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
export async function promiseFirst(thunks, errors = []) {
	if (thunks.length === 0) {
		throw new Error(`None of the ${errors.length} thunks resolved.

${errors.join('\n')}`);
	} else {
		const [thunk, ...rest] = thunks;
		try {
			return await thunk();
		} catch (error) {
			return promiseFirst(rest, [...errors, error]);
		}
	}
}
