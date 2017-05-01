const { encodeForURI } = require('nti-lib-ntiids');
const { getAppUser, getAppUsername} = require('nti-web-client');

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

	initComponent: function () {
		this.callParent(arguments);
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

		getAppUser(sharedWith).then
			.then(function (users) {
				if (!Array.isArray(users)) { users = [users]; }

				users = users.map(function (u) { return u.getName(); });

				if (users.length === 1) {
					const title = 'Chat with ' + users[0];
					obj.titleEl.update(title);
				} else if (users.length === 2) {
					const title = 'Chat with ' + users[0] + ' and ' + users[1];
					obj.titleEl.update(title);
				} else {
					const last = users.pop();
					const title = 'Chat with ' + users.join(', ') + ' and ' + last;
					obj.titleEl.update(title);
				}
			});

		return obj.titleEl;
	},

	resolveNavigateToSearchHit (obj, hit, fragment) {
		const hitId = encodeForURI(hit.NTIID);

		obj.onLoadTranscript
			.then(function (transcript) {
				obj.pushWindow(transcript, hitId, obj.el);
			});
	}
};
