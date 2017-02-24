export default {
	handles (targetMimeType) {
		targetMimeType = targetMimeType.replace('application/vnd.nextthought.', '');
		targetMimeType = targetMimeType.replace('.', '-');

		if(targetMimeType === 'note') {
			return true;
		} else {
			return false;
		}
	},

	resolveNavigateToSearchHit (obj, hit, fragment) {
		const fragIndex = fragment.fragIndex,
			id = obj.objId || obj.NTIID;
		return Promise.resolve({obj, fragIndex, id});
	}
};
