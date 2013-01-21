Ext.define('NextThought.view.menus.SymbolicMathMenuItem',{
	extend: 'Ext.menu.Item',
	alias: 'widget.symbolicmath-menuitem',

	requires: [
		'jQuery.fn.mathquill'
	],

	renderTpl: Ext.DomHelper.markup({
		tag: 'span',
		html: '{text}'
	}),

	afterRender: function(){
		this.callParent(arguments);

		var d = this.el.down('span').dom;

		d.innerHTML = d.innerHTML.replace(/\\:/g,'');

		jQuery(this.el.down('span').dom).mathquill();

	}
});
