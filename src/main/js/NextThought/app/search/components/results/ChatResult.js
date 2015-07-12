Ext.define('NextThought.app.search.components.results.ChatResult', {
	extend: 'NextThought.app.search.components.results.Base',
	alias: 'widget.search-result-messageinfo',

	requires: ['NextThought.app.chat.Actions'],

	setCreator: function(user) {
		var creator = 'Sent By ' + user.getName();

		this.renderData.creator = creator;

		if (this.rendered) {
			this.creatorEl.update(creator);
		}
	},

	setTitle: function(record) {
		var me = this,
			sharedWith = record.get('sharedWith');

		sharedWith = sharedWith.filter(function(u) {
			return !isMe(u);
		});

		UserRepository.getUser(sharedWith)
			.then(function(users) {
				if (!Array.isArray(users)) { users = [users]; }

				var last,
					title = 'Chat with ';

				users = users.map(function(u) { return u.getName(); });

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
	}
});
