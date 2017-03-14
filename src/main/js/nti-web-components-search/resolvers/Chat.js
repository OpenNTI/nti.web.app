const {isMe} = require('legacy/util/Globals');
const UserRepository = require('../../legacy/cache/UserRepository.js');
const { encodeForURI } = require('nti-lib-ntiids');
const ChatActions = require('../../legacy/app/chat/Actions');

export default {
	handles (targetMimeType) {
		targetMimeType = targetMimeType.replace('application/vnd.nextthought.', '');
		targetMimeType = targetMimeType.replace('.', '-');

		if(targetMimeType === ('messageinfo')) {
			console.log('chat');
			return true;
		} else {
			return false;
		}
	},

	initComponent: function () {
		this.callParent(arguments);

		this.ChatActions = ChatActions.create();
	},

	resolveTitle (obj, hit) {
		const sharedWith = obj.sharedWith.filter(function (u) {
			return !isMe(u);
		});

		UserRepository.getUser(sharedWith)
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

		//Kick this off so its faster on click
		obj.onLoadTranscript = obj.ChatActions.loadTranscript(obj.ContainerId);

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
