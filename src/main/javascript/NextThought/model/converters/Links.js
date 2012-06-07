Ext.define('NextThought.model.converters.Links', {
	override: 'Ext.data.Types',
	LINKS : {
		type: 'links',
		sortType: function(){ return ''; },

		convert: function(v){
			if (v && v.getRelHref) {
				console.trace('v already converted, figure out why...');
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
});

