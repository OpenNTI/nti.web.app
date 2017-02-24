export default {
	handles (targetMimeType) {
		targetMimeType = targetMimeType.replace('application/vnd.nextthought.', '');
		targetMimeType = targetMimeType.replace('.', '-');

		if(targetMimeType === ('forums-communityheadlinepost' || 'forums-generalforumcomment')) {
			return true;
		} else {
			return false;
		}
	},

	// resolveTitle (obj, hit) {
	// 	if (obj instanceof NextThought.model.forums.CommunityHeadlinePost) {
	// 		return this.callParent(arguments);
	// 	}
	// },
	//
	// resolvePath (obj, hit, getBreadCrumb) {
	// 	return getBreadCrumb(obj).then(function (breadCrumb) {
	// 		return breadCrumb;
	// 	});
	// },
};
