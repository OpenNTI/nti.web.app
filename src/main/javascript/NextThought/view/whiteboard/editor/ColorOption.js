Ext.define('NextThought.view.whiteboard.editor.ColorOption',{
	alias: 'widget.wb-color-option',
	extend: 'Ext.button.Button',

	scale: 'large',
	enableToggle: true,
	allowDepress: false,
	toggleGroup: 'whitebard-color-option',

	ui: 'button',
	baseCls: 'whiteboard-color',

	initComponent: function(){
		this.addCls(this.color);
		this.iconCls = this.color;
		this.tooltip = Ext.String.capitalize(this.color);
		this.callParent(arguments);
	}
});
