/*global jQuery*/
const Ext = require('extjs');

const SymbolicMath = require('legacy/app/assessment/input/SymbolicMath');

module.exports = exports = Ext.define('NextThought.common.menus.SymbolicMathMenuItem', {
	extend: 'Ext.menu.Item',
	alias: 'widget.symbolicmath-menuitem',

	renderTpl: Ext.DomHelper.markup({
		tag: 'span',
		html: '{displayText}'
	}),

	initComponent: function () {
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			displayText: SymbolicMath.transformToMathquillInput(this.text)
		});
	},

	afterRender: function () {
		this.callParent(arguments);
		jQuery(this.el.down('span').dom).mathquill();
	}
});
