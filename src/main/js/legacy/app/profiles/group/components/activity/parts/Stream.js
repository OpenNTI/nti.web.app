const Ext = require('extjs');

require('../../../../user/components/activity/parts/Stream');
require('./events/Created');


module.exports = exports = Ext.define('NextThought.app.profiles.group.components.activity.parts.Stream', {
	extend: 'NextThought.app.profiles.user.components.activity.parts.Stream',
	alias: 'widget.profile-group-activity-stream',

	userChanged: function (user) {
		var created;

		this.user = user;
		if (this.hasInitialWidget() && this.rendered) {
			created = this.down('created-event');
			if (created && created.setEntity) {
				created.setEntity(this.user);
			}
		}
	},

	initialWidgetConfig: function () {
		return { xtype: 'created-event', entity: this.user };
	},

	hasInitialWidget: function () {
		return !!this.down('created-event');
	}
});
