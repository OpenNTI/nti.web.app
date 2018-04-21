import { User } from '@nti/web-client';

export default {
	handles (targetMimeType) {
		targetMimeType = targetMimeType.replace('application/vnd.nextthought.', '');
		targetMimeType = targetMimeType.replace('.', '-');

		if(['forums-communityheadlinepost', 'forums-generalforumcomment'].indexOf(targetMimeType) > -1) {
			return true;
		} else {
			return false;
		}
	},
	resolveTitle (obj, hit, getBreadCrumb) {
		if(hit.TargetMimeType === 'application/vnd.nextthought.forums.generalforumcomment') {
			let title = Promise.all([
				getBreadCrumb(obj)
					.then(breadCrumb => breadCrumb),
				User.resolve({entityId: hit.Creator})
					.then(user => user.alias + ' Commented')
					//Implement the fallback logic in User.resolve() so that this catch isn't posible to hit
					.catch(() => 'Unknown Commented')
			]).then((results) => {
				const path = results[0];
				title = results[1];
				let leaf, leafTitle;

				leaf = path[path.length - 1];
				leafTitle = leaf && leaf.label;

				if (leafTitle) {
					return title += ' on ' + leafTitle;
				} else {
					return title;
				}
			});

			return title;
		} else {
			return obj.title || obj.label || obj.Title || '';
		}
	},
};
