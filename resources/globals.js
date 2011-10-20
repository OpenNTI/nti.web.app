
CENTER_WIDTH = 768;
MIN_SIDE_WIDTH = 175;
MIN_WIDTH = 768;


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
	Ext.JSON.encodeDate = function(d){return Ext.Date.format(d, 'U');};

	hooksForIE();

	Ext.Ajax.timeout==60000;
	Ext.Ajax.on('beforerequest', beforeRequest);
	Ext.EventManager.onWindowResize(resizeBlocker);
}


function hooksForIE(){
    if(!Ext.isIE) return;

    Ext.panel.Panel.override({
        render: function(){
            this.callOverridden(arguments);
            var d=this.el.dom;
            d.firstChild.unselectable = true;
            d.unselectable = true;
        }
    });
}


function beforeRequest(connection,options)
{
    if(options&&options.async===false){
        var loc = '';
        try { loc = printStackTrace().splice(7); }
        catch (e) { loc = e.stack || e.stacktrace; }
		var l = (console.warn?console.warn:console.log);
        l.call( console, 'Synchronous Call in: ', loc, ' Options:', options );
    }
}


function resizeBlocker(w, h, e){
    var i = !!(w<MIN_WIDTH), b = Ext.getBody(), m = b.isMasked();
    if(i && !m) b.mask("Your browser window is too narrow","viewport-too-small");
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
