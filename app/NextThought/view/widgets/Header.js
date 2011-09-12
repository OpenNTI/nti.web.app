
Ext.define('NextThought.view.widgets.Header', {
	extend: 'Ext.panel.Panel',
    alias: 'widget.master-header',
    requires: [
        'NextThought.view.widgets.TopControls'
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