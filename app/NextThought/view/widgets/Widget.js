Ext.define('NextThought.view.widgets.Widget', {
	extend: 'Ext.util.Observable',
	createElement: function(tag,parent,cls,css){
		var el = document.createElement(tag);
		if(cls)Ext.get(el).addCls(cls);
		if(css)el.setAttribute('style',css);
		parent.appendChild(el);
		return el;
	},
	createImage: function(src,parent,cls,css){
		var el = document.createElement('img');
		el.setAttribute('src',src);
		if(cls)Ext.get(el).addCls(cls);
		if(css)el.setAttribute('style',css);
		parent.appendChild(el);
		return el;
	},
	cleanup: function(){
		throw 'Must override';
	}
});