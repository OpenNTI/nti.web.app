Ext.define('NextThought.model.converters.Links', {
	override: 'Ext.data.Types',
	requires: [
		'Ext.data.SortTypes'
	],
	LINKS: {
		type: 'links',
		sortType: null,

		convert: function(v) {
			if (v && v.getRelHref) {
				//This happens if you set the links field on one record from another.
				//e.g. calling rec1.copyFields(rec2, 'Links')
				return v;
			}
			return {
				links: v,
				asJSON: function() {return v;},
				getRelHref: function(rel, raw) {
					var i, c = this.links, len = c.length;
					try {
						for (i = len - 1; i >= 0; i--) {
							if (c[i].rel === rel) {
								c = c[i].href;
								if (c && c.split && !raw) {
									c = c.split('#')[0];
								} else if (raw) {
									console.warn('Returning rel link raw: ', rel, c);
								}
								return c;
							}
						}
					}
					catch (e) {
						console.warn('bad Links value: "', c, '" it is a', typeof(c));
					}

					return null;
				},


				hasLink: function(rel) {
					return !Ext.isEmpty(this.getRelHref(rel));
				}
			};
		}
	}
},function() {
	this.LINKS.sortType = Ext.data.SortTypes.none;
});

