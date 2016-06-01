const Ext = require('extjs');
require('legacy/app/blog/StateStore');
require('./PostReply');


module.exports = exports = Ext.define('NextThought.app.profiles.user.components.activity.parts.events.BlogReply', {
	extend: 'NextThought.app.profiles.user.components.activity.parts.events.PostReply',
	alias: 'widget.profile-activity-personalblogcomment-item',
	description: 'thought',

	initComponent: function () {
		this.callParent(arguments);

		let me = this;
		me.BlogStateStore = NextThought.app.blog.StateStore.getInstance();
		me.mon(me.BlogStateStore, {
			'blog-deleted': function (id) {
				if (me.record.getId() === id || me.record.get('ContainerId') === id) {
					me.destroy();
				}
			}
		});
	},

	onClick: function () {
		this.navigateToObject(this.record);
	}
});
