Ext.define('NextThought.view.menus.SymbolicMathMenuItem',{
	extend: 'Ext.menu.Item',
	alias: 'widget.symbolicmath-menuitem',

	requires: [
		'jQuery.fn.mathquill'
	],

	renderTpl: Ext.DomHelper.markup({
		tag: 'span',
		html: '{displayText}'
	}),

	initComponent: function(){
		this.callParent(arguments);
		this.renderData = Ext.apply(this.renderData || {}, {
			displayText: NextThought.view.assessment.input.SymbolicMath.transformToMathquillInput(this.text)
		});
	},

	afterRender: function(){
		this.callParent(arguments);
		var d = this.el.down('span').dom;
		jQuery(this.el.down('span').dom).mathquill();
	}
});
