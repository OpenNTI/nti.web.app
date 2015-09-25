export default Ext.define('NextThought.app.profiles.user.components.activity.parts.events.BlogReply', {
	extend: 'NextThought.app.profiles.user.components.activity.parts.events.PostReply',
	alias: 'widget.profile-activity-personalblogcomment-item',
	description: 'thought',

	onClick: function() {
		this.navigateToObject(this.record);
	}
});
