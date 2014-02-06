Ext.define('NextThought.view.profiles.parts.events.TopicReply', {
	extend: 'NextThought.view.profiles.parts.events.PostReply',
	alias: 'widget.profile-activity-generalforumcomment-item',
	description: 'discussion',

	onClick: function() {
		var p = this.post;

		if (me.fireEvent('before-show-topic', p)) {
			me.fireEvent('show-topic', p, this.record.get('ID'));
		}
	}
});
