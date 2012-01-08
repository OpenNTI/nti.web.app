/* DATASERVER 2 Constants*/
RECURSIVE_STREAM = 'RecursiveStream';
USER_GENERATED_DATA = 'UserGeneratedData';
USER_SEARCH_REL = 'UserSearch';
USER_GENERATED_DATA_SEARCH_REL = 'UGDSearch';

ASCENDING = {};
DESCENDING = {};

HOST_PATTERN = /^(http(s)?):\/\/([a-z.\-_0-9]+)(:(\d+))?$/i;
HOST_PATTERN_PROTOCOL_MATCH_GROUP = 1;
HOST_PATTERN_DOMAIN_MATCH_GROUP = 3;
HOST_PATTERN_PORT_MATCH_GROUP = 5;

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
	ensureConsole();
	ensureNodePrototypes();

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


	Ext.apply(Ext.Element.prototype,{

		isInView: function(){
			var p = Ext.get(arguments[0]) || this.parent(),
				scroll = p.getScroll(),
				size = p.getSize(),
				y1 = scroll.top,
				y2 = y1 + size.height,

				top = this.getTop()-p.getTop(),
				bottom = top+this.getHeight();

			return y1 <= top	&& top <= y2
				&& bottom<=y2	&& bottom>=y1;

		}

	});
}


function ensureNodePrototypes(){
	Ext.applyIf(Node.prototype, {
		DOCUMENT_POSITION_DISCONNECTED: 1,
		DOCUMENT_POSITION_PRECEDING: 2,
		DOCUMENT_POSITION_FOLLOWING: 4,
		DOCUMENT_POSITION_CONTAINS: 8,
		DOCUMENT_POSITION_CONTAINED_BY: 16,
		DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC: 32,
		TEXT_NODE: 3
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
    var g = getter,
		less = dir===ASCENDING? -1 : 1,
		more = dir===ASCENDING? 1 : -1;

	function _(v){
		return (g? g(v) : v).get(key);
	}

	return function(a,b){
		var c = 0, _a = _(a), _b = _(b);

		if(_a != _b){
			c = _a < _b? less : more;
		}

		return c;

	};
}


//http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}
