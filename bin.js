/**
 * @param {ArrayBuffer} bin
 * @returns string
 */
export function binToStr(bin) {
	const view = new DataView(bin);
	let str = "";

	for (let i = 0; i < view.byteLength; i++) {
		str += String.fromCharCode(view.getInt8(i));
	}

	return str;
}
