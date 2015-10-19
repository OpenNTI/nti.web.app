Ext.define('NextThought.common.components.NavPanel', {
	extend: 'Ext.container.Container',
	//alias: Extend, do not use this directly

	layout: 'none',

	cls: 'navigation-panel',

	navigation: { xtype: 'box', autoEl: {html: 'navigation'}},
	body: {xtype: 'box', autoEl: {html: 'body'}},


	onClassExtended: function(cls, data) {
		if (data.cls) {
			data.cls = [cls.superclass.cls, data.cls].join(' ');
		}
	},


	initComponent: function() {
		this.callParent(arguments);

		this.alignNavigation = this.alignNavigation.bind(this);

		this.add([
			this.navigation,
			{xtype: 'box', cls: 'navigation-placeholder navigation-view'},
			this.body
		]);

		this.navigation = this.items.first();
		this.body = this.items.last();

		this.navigation.addCls('navigation-view floating');
		this.body.addCls('body-view');
	},


	afterRender: function() {
		this.callParent(arguments);

		var me = this;

		me.alignNavigation();

		Ext.EventManager.onWindowResize(me.alignNavigation, me, false);

		this.on('destroy', function() {
			Ext.EventManager.removeResizeListener(me.alignNavigation, me);
		});
	},


	alignNavigation: function() {
		if (!this.rendered) { return; }

		var placeholder = this.el.down('.navigation-placeholder'),
			rect = placeholder && placeholder.dom && placeholder.dom.getBoundingClientRect();

		this.navigation.el.setStyle({
			width: rect.width + 'px',
			left: rect.left + 'px'
		});
	},


	getActiveItem: function() {
		return this.body.getLayout().getActiveItem();
	},


	setActiveItem: function(item) {
		this.body.getLayout().setActiveItem(item);
	}
});
