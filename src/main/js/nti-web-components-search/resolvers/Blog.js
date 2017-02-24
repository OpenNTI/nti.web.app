export default {
	handles (targetMimeType) {
		targetMimeType = targetMimeType.replace('application/vnd.nextthought.', '');
		targetMimeType = targetMimeType.replace('.', '-');

		if(targetMimeType === ('forums-personalblogentrypost' || 'forums-personalblogcomment')) {
			return true;
		} else {
			return false;
		}
	}
};
