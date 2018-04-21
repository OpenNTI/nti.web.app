const Ext = require('@nti/extjs');


module.exports = exports = Ext.define('NextThought.common.ux.FilterMenuItem', {
	extend: 'Ext.menu.CheckItem',
	alias: 'widget.filter-menu-item',

	childEls: ['countEl'],

	cls: 'filter-menu-item-with-count',

	renderTpl: Ext.DomHelper.markup([
		{ cls: 'count', id: '{id}-countEl', html: '{count}' },
		'{text}'
	]),

	config: {
		count: 0
	},

	initComponent: function () {
		this.callParent(arguments);
		this.enableBubble('checkchange');
	},


	beforeRender: function () {
		this.callParent(arguments);
		this.renderData.count = this.getCount() || '';
	},

	updateCount: function (c) {
		if (this.rendered) {
			this.countEl.update(c || '');
		}
	}
});
