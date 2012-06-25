Ext.define('NextThought.view.whiteboard.editor.ToolOption',{
	alias: 'widget.wb-tool-option',
	extend: 'Ext.button.Button',

	scale: 'large',
	enableToggle: true,
	allowDepress: false,
	toggleGroup: 'whitebard-tool-option',

	ui: 'button',
	baseCls: 'whiteboard-tool-option',

	initComponent: function(){
		this.addCls(this.option);
		this.iconCls = this.option;
		this.tooltip = Ext.String.capitalize(this.option);
		this.callParent(arguments);
	}
});
