/**
 * Turn a list of items into a natural, readable list
 *
 * Code adapted from `lisitify`
 * @link https://github.com/ljharb/listify
 */
export function toNaturalList(
	list: string[],
	separator = ",",
	finalWord = "and"
): string {
	if (!Array.isArray(list)) {
		throw new TypeError("requires an array");
	}

	// space for last value
	if (finalWord.length > 0) {
		finalWord += " ";
	}

	const trimmed = list.filter(item => item.trim());

	let str;

	if (trimmed.length === 2 && finalWord.length > 0) {
		str = trimmed.join(" " + finalWord);
	} else if (trimmed.length < 3) {
		str = trimmed.join(separator);
	} else {
		const head = trimmed.slice(0, -1);
		const tail = finalWord + trimmed[trimmed.length - 1];

		str = [head, tail].join(separator);
	}

	return str;
}
