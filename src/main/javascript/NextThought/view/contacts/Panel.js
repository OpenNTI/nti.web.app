Ext.define('NextThought.view.contacts.Panel', {
	extend: 'Ext.container.Container',
	alias: 'widget.contacts-tabs-panel',
	requires: ['NextThought.view.contacts.Card'],
	defaultType: 'contacts-tabs-card',
	autoScroll: true,

	layout: 'auto',

	reactToModelChanges: false,

	mixins: {
		userContainer: 'NextThought.mixins.UserContainer'
	},


	initComponent: function () {
		this.callParent(arguments);
		this.mixins.userContainer.constructor.apply(this, arguments);
	},


	createUserComponent: function (i) {
		return {record: i};
	},


	getModelObject: function () {
		return this.associatedGroup;
	},


	getUserListFieldName: function () {
		return 'friends';
	}

});
