
Ext.define('NextThought.view.widgets.main.Header', {
	extend: 'Ext.panel.Panel',
    alias: 'widget.master-header',
    requires: [
        'NextThought.view.widgets.main.TopControls'
    ],
	
	cls: 'x-header-bar',
    items: [],
    border: false,
    frame: false,
    
    initComponent: function(){
   		this.callParent(arguments);
    	this.add({xtype: 'top-controls', id: 'top-controls'});
    }
    
});