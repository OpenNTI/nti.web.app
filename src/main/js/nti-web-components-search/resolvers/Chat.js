const { encodeForURI } = require('nti-lib-ntiids');
const { User, getAppUsername} = require('nti-web-client');

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

	resolveTitle (obj, hit) {
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
				sharedWith.map(u => User.resolve({entityId : u}))
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
	},

	resolveNavigateToSearchHit (obj, hit, fragment) {
		const hitId = encodeForURI(hit.NTIID);

		obj.onLoadTranscript
			.then(function (transcript) {
				obj.pushWindow(transcript, hitId, obj.el);
			});
	}
};
