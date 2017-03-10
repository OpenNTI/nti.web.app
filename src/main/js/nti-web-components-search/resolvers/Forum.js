const UserRepository = require('../../legacy/cache/UserRepository');


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

	resolveTitle (obj, hit) {
		let {TargetMimeType:targetMimeType} = hit;
		targetMimeType = targetMimeType.replace('application/vnd.nextthought.', '');
		targetMimeType = targetMimeType.replace('.', '-');

		if (targetMimeType === 'forums-communityheadlinepost') {
			return this.callParent(arguments);
		}
	},

	resolvePath (obj, hit, getBreadCrumb) {
		let {TargetMimeType:targetMimeType} = hit;
		targetMimeType = targetMimeType.replace('application/vnd.nextthought.', '');
		targetMimeType = targetMimeType.replace('.', '-');

		this.callParent(arguments);

		if (targetMimeType === 'forums-communityheadlinepost') {
			return;
		}

		getBreadCrumb(obj).then(function (breadCrumb) {
			this.setTitleForReply(hit, breadCrumb);
		});
	},

	setTitleForReply: function (record, path) {
		let me = this,
			leaf = path.last(),
			leafTitle = leaf && leaf.get('title');

		UserRepository.getUser(record.get('Creator'))
			.then(function (user) {
				let title = user.getName() + ' Commented';

				if (leafTitle) {
					title += ' on ' + leafTitle;
				}

				me.titleEl.update(title);
			});
	}
};
