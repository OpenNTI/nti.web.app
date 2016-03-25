var Ext = require('extjs');
var EventsPostReply = require('./PostReply');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.activity.parts.events.BlogReply', {
	extend: 'NextThought.app.profiles.user.components.activity.parts.events.PostReply',
	alias: 'widget.profile-activity-personalblogcomment-item',
	description: 'thought',

	onClick: function () {
		this.navigateToObject(this.record);
	}
});
