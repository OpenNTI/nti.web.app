const Ext = require('extjs');
const { encodeForURI } = require('@nti/lib-ntiids');

const UserRepository = require('legacy/cache/UserRepository');
const NTIFormat = require('legacy/util/Format');
const ChatActions = require('legacy/app/chat/Actions');
const {isMe} = require('legacy/util/Globals');

require('./Base');


module.exports = exports = Ext.define('NextThought.app.search.components.results.ChatResult', {
	extend: 'NextThought.app.search.components.results.Base',
	alias: 'widget.search-result-messageinfo',

	initComponent: function () {
		this.callParent(arguments);

		this.ChatActions = ChatActions.create();
	},

	setCreator: function (user) {
		if (!this.rendered) {
			this.on('afterrender', this.setCreator.bind(this, user));
			return;
		}

		var creator = 'Sent By ' + user.getName(),
			avatarEl = this.el.down('.avatar-container');

		this.renderData.creator = creator;

		if (this.rendered) {
			this.creatorEl.update(creator);
		}

		if (!isMe(user) && avatarEl) {
			avatarEl.removeCls('hidden');
			avatarEl.dom.innerHTML = NTIFormat.avatar(user);
		}
	},

	addTitle (obj) {
		this.setTitle(obj);
	},

	setTitle: function (record) {
		var me = this,
			sharedWith = record.get('sharedWith');

		sharedWith = sharedWith.filter(function (u) {
			return !isMe(u);
		});

		UserRepository.getUser(sharedWith)
			.then(function (users) {
				if (!Array.isArray(users)) { users = [users]; }

				var last,
					title = 'Chat with ';

				users = users.map(function (u) { return u.getName(); });

				if (users.length === 1) {
					title += users[0];
				} else if (users.length === 2) {
					title += users[0] + ' and ' + users[1];
				} else {
					last = users.pop();
					title += users.join(', ') + ' and ' + last;
				}

				me.titleEl.update(title);
			});

		//Kick this off so its faster on click
		me.onLoadTranscript = me.ChatActions.loadTranscript(record.get('ContainerId'));
	},

	clicked: function (e) {
		var me = this,
			hitId = this.hit.get('NTIID');

		hitId = encodeForURI(hitId);

		me.onLoadTranscript
			.then(function (transcript) {
				me.pushWindow(transcript, hitId, me.el);
			});
	}
});
