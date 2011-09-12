

Ext.define('NextThought.controller.ObjectExplorer', {
    extend: 'Ext.app.Controller',
    requires: ['NextThought.proxy.UserDataLoader'],

	views: [
		'Viewport',
        'widgets.main.LeftColumn',
		'widgets.ItemNavigator'
	],
	
	refs: [
        {
            ref: 'viewport',
            selector: 'master-view'
        },{
            ref: 'reader',
            selector: 'reader-mode-container reader-panel'
        }
    ],

    init: function() {
    	 this.control({
             'leftColumn button[objectExplorer]': {
                 'click': this.objectExplorerClicked
             },

             'master-view':{
                 'object-changed' : this.objectChanged
             },

             'item-navigator gridpanel': {
                 'itemdblclick': this.itemNavigatorItemActivated
             },

             'item-navigator': {
                 'annotation-destroyed': this.removeAnnotation
             }

    	 });
    },

    removeAnnotation: function(oid){
        this.getReader().removeAnnotation(oid);
    },

    objectChanged: function() {
        if (!this.objectExplorer || !this.objectExplorer.isVisible()) return;
        Ext.ComponentQuery.query('window item-navigator')[0].reload();
    },

    itemNavigatorItemActivated: function(control, record, dom, index) {
        var containerId = record.get('ContainerId'),
            bookInfo = NextThought.librarySource.findLocation(containerId),
            book = bookInfo.book,
            href = bookInfo.location.getAttribute('href');

        this.navigate(book, book.root + href);
    },

    objectExplorerClicked: function(btn, e, o) {
        if (!this.objectExplorer) {
            this.objectExplorer = 	Ext.create('Ext.Window', {
				id:'object-explorer',
				title: 'My Stuff',
				x:100,
				y:100,
				width: 500,
				height: 350,
				maximizable:true,
				minimizable:true,
				layout: 'fit',
				closeAction: 'hide',
				items: {xtype: 'item-navigator'}
			});
        }

        this.objectExplorer.show();
    },

    navigate: function(book, ref){
        this.getViewport().fireEvent('navigate', book, ref);
    }
    
});