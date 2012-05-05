Ext.define('NextThought.view.Widget', {

	mixins: {
		observable: 'Ext.util.Observable'
	},

	constructor: function(){
		this.mixins.observable.constructor.call(this);
	},
	
	createElement: function(tag,parent,cls,css,id){
		var el = document.createElement(tag);
		if(cls) { Ext.get(el).addCls(cls); }
		if(css) { el.setAttribute('style',css); }
		if(id){el.setAttribute('id',id);}
		parent.appendChild(el);
		return el;
	},
	
	createImage: function(src,parent,cls, type, css){
		var el = document.createElement('img'),
			e = Ext.get(el),
			s;

		el.setAttribute('src',src);
		e.addCls([cls,type]);
		el.setAttribute('style',css);
		parent.appendChild(el);

		s = e.getStyle('background-image').replace(/url\((.*?)\)/i, '$1');
		e.removeCls(type);
		el.setAttribute('src', s.replace(/^["']|['"]$/ig,''));

		return el;
	},
	
	cleanup: function(){
		throw 'Must override';
	}
});
