Ext.define('NextThought.app.contentviewer.components.SimplePopoverWidget', {
	extend: 'Ext.container.Container',

	alias: 'widget.simple-popover-widget',
	cls: 'simple-popover-widget',

	renderTo: Ext.getBody(),
	width: 400,
	maxHeight: 400,

	layout: 'fit',

	initComponent: function() {
		this.callParent(arguments);
		this.add(
				{
					xtype: 'box',
					autoScroll: true,
					autoEl: {
						cls: 'bubble',
						cn: [
							{cls: 'text', html: this.text}
						]
					}
				});
	},


	afterRender: function() {
		var me = this;
		this.callParent(arguments);
		this.mon(this.el, {
			mouseenter: function() { clearTimeout(me.closeTimer); },
			mouseleave: 'startCloseTimer',
			click: 'onClick',
			scope: me
		});
	},


	onClick: function(e) {
		var target = e.getTarget('a[href]'),
			id = target && (target.href || '').split('#')[0];
		if (!target || !ParseUtils.isNTIID(id)) {return;}
		e.stopEvent();

		NextThought.app.navigation.Actions.navigateToHref(target.href)
		this.destroy();
	},


	startCloseTimer: function() {
		var me = this;
		me.closeTimer = setTimeout(function() {
			me.destroy();
		}, 1000);
	}
});
