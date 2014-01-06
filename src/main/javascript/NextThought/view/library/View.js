Ext.define('NextThought.view.library.View', {
	extend: 'NextThought.view.Base',
	alias: 'widget.library-view-container',

	requires: [
		'NextThought.view.library.Page',
		'NextThought.view.courseware.Collection'
	],

	extraTabBarCls: 'library',
	cls: 'library-view',
	defaultType: 'library-view-page',
	defaultTab: 'my-courses',
	activeItem: 0,
	layout: {
		type: 'card',
		deferredRender: true
	},

	items: [
		{
			itemId: 'my-courses',
			items: [
				{
					name: getString('My Administered Courses'),
					xtype: 'course-collection',
					store: 'courseware.AdministeredCourses',
					kind: 'admin'
				},
				{
					name: getString('My Courses'),
					xtype: 'course-collection',
					kind: 'enrolled'
				}
			]
		},
		{ itemId: 'content-catalog' },
		{
			itemId: 'my-books',
			items: [
				{ name: getString('My Books') }
			]
		}
	],

	tabSpecs: [
		{label: getString('Courses'), viewId: 'my-courses'},
		{label: getString('Books'), viewId: 'my-books'},
		{label: getString('Catalog'), viewId: 'content-catalog'}
	],


	initComponent: function() {
		this.callParent(arguments);
		this.removeCls('make-white');
		this.on('update-tab', 'updateTabs');
	},


	getTabs: function() {
		var me = this,
			tabs = me.tabSpecs,
			active = me.layout.getActiveItem(),
			activeId = active && active.itemId;

		function canShow(o) {
			return me.getComponent(o.viewId).showPage;
		}

		function markSelected(t) {
			t.selected = (t.viewId === activeId);
		}

		tabs = tabs.filter(canShow);

		tabs.forEach(markSelected);

		if (active && !active.showPage) {
			this.setActiveTab((tabs[0] || {}).viewId);
		}

		return tabs;
	},


	restore: function(state) {
		var promise = new Promise();
		promise.fulfill();
		return promise;
	},


	getCatalogView: function() {
		if (!this.catalog) {
			this.catalog = this.getComponent('content-catalog');
		}
		return this.catalog;
	}
});
