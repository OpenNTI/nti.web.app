Ext.define('NextThought.view.widgets.Widget', {

	mixins: {
		observable: 'Ext.util.Observable'
	},

	constructor: function(){
		this.mixins.observable.constructor.call(this);
	},
	
	createElement: function(tag,parent,cls,css){
		var el = document.createElement(tag);
		if(cls) { Ext.get(el).addCls(cls); }
		if(css) { el.setAttribute('style',css); }
		parent.appendChild(el);
		return el;
	},
	
	createImage: function(src,parent,cls,css){
		var el = document.createElement('img');
		el.setAttribute('src',src);
		if(cls) { Ext.get(el).addCls(cls); }
		if(css) { el.setAttribute('style',css); }
		parent.appendChild(el);
		return el;
	},
	
	getNodeFromXPath: function(xpath) {
		try {
			return document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null).iterateNext();
		}
		catch(e) {
			console.error('getNodeFromXPath: ',xpath, e.stack);
			return null;
		}
	},
	
	cleanup: function(){
		throw 'Must override';
	}
});
