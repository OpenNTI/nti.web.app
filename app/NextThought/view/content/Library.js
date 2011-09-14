
Ext.define('NextThought.view.content.Library', {
	extend:'NextThought.view.content.Panel',
	
	cls: 'x-library-home',
    
    initComponent: function(){
   		this.callParent(arguments);
//    	NextThought.librarySource.on('loaded', this._libraryLoaded, this);
    }
});