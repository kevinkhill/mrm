export function toNaturalList(list, separator = ',', finalWord = 'and') {
	if (!Array.isArray(list)) {
		throw new TypeError('requires an array');
	}
	if (finalWord.length > 0) {
		finalWord += ' ';
	}
	const trimmed = list.filter((item) => item.trim());
	let str;
	if (trimmed.length === 2 && finalWord.length > 0) {
		str = trimmed.join(' ' + finalWord);
	} else if (trimmed.length < 3) {
		str = trimmed.join(separator);
	} else {
		const head = trimmed.slice(0, -1);
		const tail = finalWord + trimmed[trimmed.length - 1];
		str = [head, tail].join(separator);
	}
	return str;
}
//# sourceMappingURL=toNaturalList.js.map
