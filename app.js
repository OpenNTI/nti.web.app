//Ext.Loader.setConfig({enabled: true});
// Ext.Loader.setPath('NextThought', 'app/NextThought/');

var NextThought = NextThought || {};
NextThought.Common = NextThought.Common || {};


var CENTER_WIDTH = 768,
	MIN_SIDE_WIDTH = 216,
	MIN_WIDTH = 1024,
	EVENTS;
	
	

Ext.application({
    name: 'NextThought',
    appFolder: 'app/NextThought',
    
    launch: function() {

		EVENTS = Ext.create('NextThought.events.EventBus',{});
    	
    	Ext.Ajax.request({
			url: 'config.json',
			async: false,
			success: function(r,o) { _AppConfig = Ext.decode(r.responseText); },
			failure: function(r,o) { console.log('failed to load config'); }
		});
		
		var library = Ext.create('NextThought.model.LibrarySource',{}),
			switcher = Ext.create('NextThought.view.navigation.Switcher',{}),
			
    		win = Ext.create('Ext.Window', { id:'object-explorer', title: 'Nav', x:100,y:100,width: 400, height: 250, maximizable:true, minimizable:true, layout: 'fit', closeAction: 'hide', items: Ext.create('NextThought.view.views.ItemNavigator', {})}),
		
			header	= Ext.create('NextThought.view.Header', { region: 'north', modeSwitch: switcher, librarySource: library}),
			modes = Ext.create('NextThought.view.ModeContainer', { region: 'center', id: 'mode-ctr', modeSwitch: switcher, librarySource: library});
		
    	
    	Ext.create('Ext.container.Viewport', {
				border: false, 
				frame: false,
				defaults:{ border: false, frame: false },
				layout: 'border',
	            items: [ header, modes ]
       		}
        );
        
        Ext.EventManager.onWindowResize(resizeBlocker);
        library.on('loaded', function(){
        	Ext.Ajax.on('beforerequest', function(connection,options){Ext.getBody().mask('Loading...');});
			Ext.Ajax.on('requestcomplete', function(connection,options){Ext.getBody().unmask();});
			Ext.Ajax.on('requestexception', function(connection,options){Ext.getBody().unmask();});
			      
	        setTimeout(function(){
	        	Ext.get('loading').remove();
	        	Ext.get('loading-mask').fadeOut({remove:true});
	        	resizeBlocker(Ext.Element.getViewWidth());
	        }, 100);
        	
        });
        library.load();
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





NextThought.Common.startIntegrationPoints = function(){
	
	// if(MathJax) {
		// MathJax.Hub.Startup.onload();
	// }
	
	
	// $(".problem > input[type]").each(function(i,elm){
		// var t = document.createElement("textarea");
		// var p = elm.parentNode;
		// t.id = elm.id;
		// t.className = elm.className + " mathdoxformula";
		// p.removeChild(elm);
		// p.insertBefore(t,p.firstChild);
	// });
// 	
	// if(org && org.mathdox) {
		// try {
		// org.mathdox.formulaeditor.FormulaEditor.updateByTextAreas(true);
		// }
		// catch(e){
			// $.getScript('resources/scripts/formulaeditor-1.1/org/mathdox/formulaeditor/FEConcatenation.js');
		// }
	// }

	//clear any existing notes	
	
	var s = _AppConfig.server,
		dataserver = s.host+s.data, 
		username = s.username, 
		password = s.password;
	
	// delete window['NTIOnStateSetCalled'];
	// NTIOnStateSet(dataserver, username, password);
	// NTIShowNotes();
	// NTIShowHighlights();
	// if(NTIGetPageID().toLowerCase().indexOf('mathcounts')==0){
		// NTICheckForAnswers();
	// }
};
