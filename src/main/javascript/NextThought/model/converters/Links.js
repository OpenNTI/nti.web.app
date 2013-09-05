Ext.define('NextThought.model.converters.Links', {
	override: 'Ext.data.Types',
	requires:[
		'Ext.data.SortTypes'
	],
	LINKS : {
		type: 'links',
		sortType: null,

		convert: function(v){
			if (v && v.getRelHref) {
				//This happens if you set the links field on one record from another.
				//e.g. calling rec1.copyFields(rec2, 'Links')
				return v;
			}
			return {
				links: v,
				asJSON: function(){return v;},
				getRelHref: function(rel){
					var i, c = this.links,len = c.length;
					if(typeof(c) === 'object'){
						for(i=len-1; i>=0; i--){
							if(c[i].rel === rel) {
								return c[i].href;
							}
						}
					}
					else {
						console.warn('bad Links value: "', c, '" it is a', typeof(c), 'instead of an array');
					}

					return null;
				},
				getLinksForRel: function(rel) {
					var i, c = this.links,len = c.length, results = [];
					if(typeof(c) === 'object'){

						for(i=len-1; i>=0; i--){
							if(c[i].rel === rel) {
								results.push(c[i]);
							}
						}
					}
					else {
						console.warn('bad Links value: "', c, '" it is a', typeof(c), 'instead of an array');
					}
					return results;
				}
			};
		}
	}
},function(){
	this.LINKS.sortType = Ext.data.SortTypes.none;
});

