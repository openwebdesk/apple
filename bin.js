/**
 * @param {ArrayBuffer} bin
 * @returns {string}
 */
export function binToStr(bin) {
	const view = new DataView(bin);
	console.log("binToStr", { bin, view });
	let str = "";

	for (let i = 0; i < view.byteLength; i++) {
		str += String.fromCharCode(view.getInt8(i));
	}

	return str;
}

/**
 * @param {string} str
 * @returns {ArrayBuffer}
 */
export function strToBin(str) {
	const bin = new ArrayBuffer(str.length);
	const view = new DataView(bin);
	console.log("strToBin", { bin, view });

	for (let i = 0; i < str.length; i++) {
		view.setInt8(i, str[i].charCodeAt(0));
	}

	return bin;
}
