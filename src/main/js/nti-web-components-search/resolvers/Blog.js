export default {
	handles (targetMimeType) {
		targetMimeType = targetMimeType.replace('application/vnd.nextthought.', '');
		targetMimeType = targetMimeType.replace('.', '-');

		if(['forums-personalblogentrypost', 'forums-personalblogcomment'].indexOf(targetMimeType) > -1) {
			return true;
		} else {
			return false;
		}
	}
};
