


Ext.define('NextThought.view.widgets.GroupEditorWindow', {
	extend: 'Ext.window.Window',
	alias : 'widget.groupeditor',
	
	title: 'Group', 
	width: 300, 
	height: 500, 
	modal: true, 
	
	constructor: function(){
		return this.callParent(arguments);
	},
	
	initComponent: function(){
		this.callParent(arguments);
	}
    
});