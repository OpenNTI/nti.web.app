Ext.define('NextThought.view.whiteboard.editor.Tool',{
	alias: 'widget.wb-tool',
	extend: 'Ext.button.Button',

	scale: 'large',
	enableToggle: true,
	allowDepress: false,
	toggleGroup: 'whitebard-primary-tools',

	ui: 'button',
	baseCls: 'whiteboard-tool',

	initComponent: function(){
		this.addCls(this.tool);
		this.iconCls = this.tool;
		this.tooltip = Ext.String.capitalize(this.tool);
		this.callParent(arguments);
	}
});
