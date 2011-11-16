
CENTER_WIDTH = 768;
MIN_SIDE_WIDTH = 175;
MIN_WIDTH = 768;

window.onerror = function(message, location, line){
	if(!NextThought.isReady){
		document.body.innerHTML = '';
		Ext.getBody().mask("Ooops, now this is embarrasing...<br/>there was an unexpected error, please try again.","body-mask");
	}
    /*
	else{
		console.error("Error:", message);
	}
	*/
};


function removeLoaderSplash(){
	setTimeout(
		function clearMask(){
			Ext.get('loading').remove();
			Ext.get('loading-mask').fadeOut({remove:true});
			resizeBlocker(Ext.Element.getViewWidth());
		},
		100);

}


function applyHooks(){
	ensureConsole();

	Ext.JSON.encodeDate = function(d){return Ext.Date.format(d, 'U');};

	Ext.Ajax.timeout==10000;
	Ext.Ajax.on('beforerequest', beforeRequest);
	Ext.EventManager.onWindowResize(resizeBlocker);

	//disable selection everywhere except places we specifically enable it.
	Ext.getBody().unselectable();
	Ext.panel.Panel.override({
		render: function(){
			this.callOverridden(arguments);
			if(!this.enableSelect){this.el.unselectable();}
			else{this.el.selectable();}
		}
	});
}


function ensureConsole(){
	if(!console){
		console = {log: function(){}};
	}
	if(!console.debug){
		console.debug = Ext.Function.alias(console, 'log');
	}
	if(!console.info){
		console.info = Ext.Function.alias(console, 'log');
	}
	if(!console.warn){
		console.warn = Ext.Function.alias(console, 'log');
	}
	if(!console.error){
		console.error = Ext.Function.alias(console, 'log');
	}
}


function beforeRequest(connection,options) {
    if(options&&options.async===false){
        var loc = '';
        try { loc = printStackTrace().splice(7); }
        catch (e) { loc = e.stack || e.stacktrace; }
		console.warn( 'Synchronous Call in: ', loc, ' Options:', options );
    }
}


function resizeBlocker(w){
    var i = !!(w<MIN_WIDTH), b = Ext.getBody(), m = b.isMasked();
    if(i && !m) b.mask("Your browser window is too narrow","body-mask");
    else if(!i && m) b.unmask();
}


function arrayEquals(a, b) {
    if (a.length != b.length) return false;
    return Ext.Array.merge(a, b).length == a.length;
}


function SortModelsBy(key,dir,getter){
    var g = getter;
    if(g){
        return function(a,b){
            return dir
                ? g(a).get(key) > g(b).get(key)
                : g(a).get(key) < g(b).get(key);
        };
    }

    return function(a,b){
        return dir
            ? a.get(key) > b.get(key)
            : a.get(key) < b.get(key);
    };
}


//http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
