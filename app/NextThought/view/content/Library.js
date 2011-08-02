
Ext.define('NextThought.view.content.Library', {
	extend:'NextThought.view.content.Panel',
	
	cls: 'x-library-home',
    
    constructor: function(config){
    	if(!config || !config.librarySource){
    		throw "no config, or no library source";
    	}
    	
    	this.self.superclass.constructor.apply(this,arguments);
    	
    	config.librarySource.on('loaded', this._libraryLoaded, this);
    	
    	return this;
    },
    
    initComponent: function(){
   		this.callParent(arguments);
    },
    
    
    _libraryLoaded: function(library){
    	this._library = library;
    	this._render();
	},
	
    
	_render : function(){
		this.removeAll(true);
		/*
            "index": "/prealgebra/eclipse-toc.xml",
            "href": "/prealgebra/index.html",
            "version": "1.0",
            "title": "Prealgebra",
            "root": "/prealgebra/",
            "archive": "/prealgebra/archive.zip",
            "installable": true,
            "icon": "/prealgebra/icons/chapters/PreAlgebra-cov-icon.png"
        */
		var me = this;
		Ext.each(this._library.titles, function(o,i){
			// console.log(o);
			// me.add({
				// xtype: 'button',
				// scale: 'large',
				// title: o.title,
				// html: o.title,
				// icon: o.icon,
				// listeners: {
					// click: function(){
						// Ext.getCmp('myReader').setActive(o, o.href);
					// }
				// }
// 				
			// });
		});
		this.relayout();
	}
	
    
});