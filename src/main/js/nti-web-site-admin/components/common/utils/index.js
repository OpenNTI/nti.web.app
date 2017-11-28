const COLORS = [
	'#efefef',
	'#dfdfef',
	'#9ecae1',
	'#9ecae1',
	'#6baed6',
	'#6baed6',
	'#3182bd',
	'#3182bd',
	'#08306b',
	'#08306b'
];

export function determineBlockColor (value, minValue = 0, maxValue, customColors) {
	const colorsToUse = customColors || COLORS;

	if ( value === 0 || maxValue === 0 ) {
		return colorsToUse[0];
	}
	const normalized = (value - minValue) / (maxValue - minValue);
	const bucket = (parseFloat(normalized.toFixed(1)) * 10);

	let index = Math.min(bucket, colorsToUse.length - 1);

	return colorsToUse[index];
}
