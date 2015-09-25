export default Ext.define('NextThought.app.profiles.group.components.activity.parts.Stream', {
	extend: 'NextThought.app.profiles.user.components.activity.parts.Stream',
	alias: 'widget.profile-group-activity-stream',

	requires: ['NextThought.app.profiles.group.components.activity.parts.events.Created'],

	initialWidgetConfig: function() {
	   return { xtype: 'created-event', entity: this.user };
	},

	hasInitialWidget: function() {
	   return !!this.down('created-event');
	}
});
