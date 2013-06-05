/*jslint */
/*global DomUtils, ParseUtils */
Ext.define('NextThought.model.PlaylistItem', {
	extend: 'Ext.data.Model',

	fields: [
		{name: 'mediaId', type: 'string'},
		{name: 'start', type: 'float', defaultValue: 0.0},
		{name: 'end', type: 'float', defaultValue: -1.0},
		{name: 'sourceIndex', type: 'int', defaultValue: 0},
		{name: 'sources', type: 'auto'},
		{name: 'dom-clone', type: 'auto'}
	],

	statics: {
		fromDom: function(dom){
			var i,
				frag = (dom.ownerDocument||document).createDocumentFragment(),
				el = Ext.get(dom),
				o = {
					'sources': el.query('object[type$=videosource]'),
					'dom-clone': frag
				},
				sourceComparator = function(a, b) {
					var c = 0, $a = a['attribute-data-priority'], $b = b['attribute-data-priority'];
					if($a !== $b){c = $a < $b? -1 : 1;}
					return c;
				};

			for (i=0; i< o.sources.length; i++){
				o.sources[i] = (DomUtils.parseDomObject(o.sources[i]));
			}
			Ext.Array.sort(o.sources, sourceComparator);

			frag.appendChild(dom.cloneNode(true));

			return this.create(o);
		}
	},

	getSources: function(service){
		var i = [];
		Ext.each(this,function(o){
			if(!service || (o && service === o.service)){
				i.push(o.source);
			}
		});
	},

	activeSource: function(){
		return this.get('sources')[this.get('sourceIndex')];
	},

	nextSource: function(){}


});
