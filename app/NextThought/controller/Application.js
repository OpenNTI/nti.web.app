

Ext.define('NextThought.controller.Application', {
    extend: 'Ext.app.Controller',

	views: [
		'navigation.Breadcrumb',
		'widgets.Tracker',
		'content.Reader'
	],

    init: function() {
    	 var l = NextThought.librarySource = Ext.create('NextThought.model.LibrarySource');
    	 l.on('loaded', function(){
    	 	var b = l._library.titles[0];
			Ext.getCmp('myReader').setActive(b, b.root+'sect0001.html');
    	 });
    	 
    	 
    	 this.control({
    	 	'breadcrumbbar':{
    	 		'navigate': this.navigate
    	 	}
    	 });
    },
    
    onLaunch: function(){
    },
    
    
    
    navigate: function(book, ref){
    	//reader-panel
    	Ext.getCmp('myReader').setActive(book, ref);
    }
    
    
    
});