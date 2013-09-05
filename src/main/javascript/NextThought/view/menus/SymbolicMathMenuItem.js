Ext.define('NextThought.view.menus.SymbolicMathMenuItem',{
	extend: 'Ext.menu.Item',
	alias: 'widget.symbolicmath-menuitem',

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
		jQuery(this.el.down('span').dom).mathquill();
	}
});
