export async function promiseSeries(array, fn) {
	const results = {};
	for (let i = 0; i < array.length; i++) {
		const currItem = array[i];
		const r = await fn(currItem);
		results[currItem] = r;
	}
	return results;
}
export async function promiseFirst(thunks, errors = []) {
	if (thunks.length === 0) {
		throw new Error(`None of the ${errors.length} thunks resolved.

${errors.join('\n')}`);
	}
	const [thunk, ...rest] = thunks;
	try {
		return await thunk();
	} catch (error) {
		return promiseFirst(rest, [...errors, error]);
	}
}
//# sourceMappingURL=promises.js.map
