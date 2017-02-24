export default {
	handles (targetMimeType) {
		targetMimeType = targetMimeType.replace('application/vnd.nextthought.', '');
		targetMimeType = targetMimeType.replace('.', '-');

		if(targetMimeType === 'ntitimeline') {
			return true;
		} else {
			return false;
		}
	}
};
