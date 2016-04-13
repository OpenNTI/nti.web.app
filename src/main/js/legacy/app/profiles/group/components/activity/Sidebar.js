const Ext = require('extjs');

require('../../../user/components/activity/Sidebar');
require('./parts/Users');
require('../../../components/SuggestedContacts');
require('../../../../stream/components/Filter');


module.exports = exports = Ext.define('NextThought.app.profiles.group.components.activity.Sidebar', {
	extend: 'NextThought.app.profiles.user.components.activity.Sidebar',
	alias: 'widget.profile-group-activity-sidebar',
	layout: 'none',
	cls: 'activity-sidebar',


	getFilters () {
		return [];
	},


	initComponent () {
		this.callParent(arguments);

		this.add([
			{xtype: 'profile-group-membership-condensed'},
			{xtype: 'profile-suggested-contacts'}
		]);

		this.membershipCmp = this.down('profile-group-membership-condensed');
		this.suggestedCmp = this.down('profile-suggested-contacts');
	},


	userChanged (entity) {
		var me = this;

		this.activeEntity = entity;

		return Promise.all([
			me.membershipCmp.setUser(entity),
			me.suggestedCmp.setEntity(entity)
		]).then(() => {
			this.restoreState();
		});
	}
});
