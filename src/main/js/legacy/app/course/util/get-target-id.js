module.exports = exports = function getTargetId (record) {
	const keyMap = Object.keys(record.data).map(k => {
		return {
			normalized: k.toLowerCase(),
			actual: k
		};
	}).reduce((ac, v) => {
		ac[v.normalized] = v.actual;
		return ac;
	},
	{});

	const isRelatedWorkRef = /relatedwork/.test(record.get('MimeType'));

	let id;

	if(isRelatedWorkRef) {
		id = record.isContent && record.isContent() ? record.get(keyMap['target-ntiid']) || record.get('Target-NTIID') : record.get(keyMap['ntiid']);
	}
	else {
		id = record.get(keyMap['target-ntiid']) || record.get('Target-NTIID') || record.get(keyMap['ntiid']);
	}

	return id;
};
