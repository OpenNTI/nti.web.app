Ext.define('NextThought.view.profiles.parts.events.BlogReply', {
	extend: 'NextThought.view.profiles.parts.events.PostReply',
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
