import { User, getAppUsername} from '@nti/web-client';

export default {
	handles (targetMimeType) {
		targetMimeType = targetMimeType.replace('application/vnd.nextthought.', '');
		targetMimeType = targetMimeType.replace('.', '-');

		if(targetMimeType === ('messageinfo')) {
			return true;
		} else {
			return false;
		}
	},

	resolveTitle (obj/*, hit*/) {
		const sharedWith = obj.sharedWith.filter(function (u) {
			let id = u;

			if (typeof u !== 'string' && u && u.getId) {
				id = u.getId();
			}

			if(getAppUsername() === id) {
				return false;
			} else {
				return true;
			}
		});

		let title = Promise.all(
			sharedWith.map(u =>
				User.resolve({entityId : u})
					.catch(() => {
						//Implement the fallback logic in User.resolve() so that this catch isn't posible to hit
						return {alias: 'Unknown' };
					})
			)
		).then(function (users) {
			if (!Array.isArray(users)) { users = [users]; }

			users = users.map(function (u) { return u.alias; });

			if (users.length === 1) {
				return 'Chat with ' + users[0];
			} else if (users.length === 2) {
				return 'Chat with ' + users[0] + ' and ' + users[1];
			} else {
				const last = users.pop();
				return 'Chat with ' + users.join(', ') + ' and ' + last;
			}
		});


		return title;
	},

	resolvePath (obj, hit, getBreadCrumb) {
		return null;
	}
};
