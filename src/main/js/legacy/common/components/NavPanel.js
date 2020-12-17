const Ext = require('@nti/extjs');

const NavStore = require('legacy/app/navigation/StateStore');


module.exports = exports = Ext.define('NextThought.common.components.NavPanel', {
	extend: 'Ext.container.Container',
	//alias: Extend, do not use this directly

	layout: 'none',

	cls: 'navigation-panel',

	navigation: { xtype: 'box', autoEl: {html: 'navigation'}},
	body: {xtype: 'box', autoEl: {html: 'body'}},


	onClassExtended: function (cls, data) {
		if (data.cls) {
			data.cls = [cls.superclass.cls, data.cls].join(' ');
		}
	},


	initComponent: function () {
		this.callParent(arguments);

		this.NavStore = NavStore.getInstance();

		this.alignNavigation = this.alignNavigation.bind(this);

		this.add([
			this.navigation,
			this.body
		]);

		this.navigation = this.items.first();
		this.body = this.items.last();

		this.navigation.addCls('navigation-view floating');
		this.body.addCls('body-view');

		this.mon(this.NavStore, 'message-bar-open', this.alignNavigation);
		this.mon(this.NavStore, 'message-bar-close', this.alignNavigation);
	},


	afterRender: function () {
		this.callParent(arguments);

		var me = this;

		me.alignNavigation();

		Ext.EventManager.onWindowResize(me.alignNavigation, me, false);

		if (this.contentOnly) {
			this.addCls('content-only');
		}

		this.on('destroy', function () {
			Ext.EventManager.removeResizeListener(me.alignNavigation, me);
		});
	},


	alignNavigation: function () {
	},


	getActiveItem: function () {
		return this.body.getLayout().getActiveItem();
	},


	setActiveItem: function (item) {
		this.body.getLayout().setActiveItem(item);
	}
});
