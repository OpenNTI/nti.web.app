Ext.define('NextThought.app.profiles.user.components.activity.parts.events.BlogReply', {
	extend: 'NextThought.app.profiles.user.components.activity.parts.events.PostReply',
	alias: 'widget.profile-activity-personalblogcomment-item',
	description: 'thought',

	onClick: function() {
		var u = this.targetUser,
			b = this.post,
			href = this.record.get('href'),
			args = ['Thoughts', b.get('ID'), 'comments', this.record.get('ID')];

		this.fireEvent('show-profile', u, args);
	}
});
