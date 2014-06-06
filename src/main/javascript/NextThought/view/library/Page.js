Ext.define('NextThought.view.library.Page', {
	extend: 'Ext.container.Container',
	alias: ['widget.library-view-page', 'widget.library-view-tab'],
	requires: [
		'NextThought.view.library.Branding',
		'NextThought.view.library.Collection'
	],

	defaultType: 'library-collection',
	showPage: false,
	cls: 'page scrollable',

	items: [
		{
			cls: 'branding',
			xtype: 'library-branding-box'
		}
	],

	constructor: function(config) {
		if (config.items) {
			config.items = this.items.concat(config.items);
		}
		this.hideOrShow = Ext.Function.createBuffered(this.hideOrShow, 1, null, null);
		this.callParent([config]);
		this.enableBubble(['update-tab']);
		this.cssRule = CSSUtils.getRule('main-view-container-styles', '#' + this.id);
		CSSUtils.set(this.cssRule, {width: 'auto'}, true);
	},


	onAdd: function(child) {
		var monitor;
		if (child.is('dataview')) {
			monitor = this.mon(child, {
				destroyable: true,
				'count-changed': 'hideOrShow',
				destroy: function() {Ext.destroy(monitor);}
			});
		}

		this.hideOrShow();
	},


	hideOrShow: function() {
		function has(agg, o) {
			return agg + o.getStore().getCount();
		}

		var v = this.query('dataview');
		this.showPage = v.reduce(has, 0) > 0;
		this.fireEvent('update-tab');
	},

	updateSidePadding: function(sides) {
		function toPx(i) { return (i && i + 'px') || i; }

		CSSUtils.set(this.cssRule, {
			paddingLeft: toPx(sides.left),
			paddingRight: toPx(sides.right)
		});
	}
});
