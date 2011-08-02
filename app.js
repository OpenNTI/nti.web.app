var CENTER_WIDTH = 768,
	MIN_SIDE_WIDTH = 216,
	MIN_WIDTH = 1024;
	
Ext.application({
    name: 'NextThought',
    appFolder: 'app/NextThought',
    
    controllers: [
    	'Config'
    ],
    
    launch: function() {
		NextThought.modeSwitcher = Ext.create('NextThought.view.navigation.Switcher',{});
		NextThought.oe = Ext.create('Ext.Window', { id:'object-explorer', title: 'Nav', x:100,y:100,width: 400, height: 250, maximizable:true, minimizable:true, layout: 'fit', closeAction: 'hide', items: Ext.create('NextThought.view.views.ItemNavigator', {})});

		var l = NextThought.librarySource = Ext.create('NextThought.model.LibrarySource'),
			vp = Ext.create('NextThought.view.Viewport').getEl();
        
        l.on('loaded', function(){
        	Ext.Ajax.on('beforerequest', function(connection,options){vp.mask('Loading...');});
			Ext.Ajax.on('requestcomplete', function(connection,options){vp.unmask();});
			Ext.Ajax.on('requestexception', function(connection,options){vp.unmask();});
			      
	        setTimeout(function(){
	        	Ext.get('loading').remove();
	        	Ext.get('loading-mask').fadeOut({remove:true});
	        	resizeBlocker(Ext.Element.getViewWidth());
	        }, 100);
        	
        });
        
        l.load();
        Ext.EventManager.onWindowResize(resizeBlocker);
    }
});




function resizeBlocker(w, h, e){
	var i = !!(w<MIN_WIDTH),
		b = Ext.getBody(),
		m = b.isMasked();
	
	if(i && !m){
		b.mask("Your browser window is too narrow","viewport-too-small");
	} 
	else if(!i && m){
		b.unmask();
	}
}




window.onpopstate = function(e) {
    var s = e?e.state:null;
    if(!s){
    	//console.log(e);
    	return;
    }
    
    console.log(e.state);
    
    if(s.path){
    	Ext.getCmp('myReader')._restore(s);
    }
};
