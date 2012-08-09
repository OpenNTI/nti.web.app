Ext.define('NextThought.model.converters.Items', {
	override: 'Ext.data.Types',

	/* converters for models which reference other models*/
	SINGLEITEM: {
		type: 'singleItem',
		convert: function(v) {
			if (v instanceof Object) {
				return !v ? null : ParseUtils.parseItems([v])[0];
			}
			else {
				if(v){ console.warn('unexpected value', v); }
				return null;
			}
		},
		sortType: function(v) {
			console.warn('sort by Item:',arguments);
			return '';
		}
	},


	ARRAYITEM: {
		type: 'arrayItem',
		convert: function(v) {
			if (Ext.isArray(v)) {
				return ParseUtils.parseItems(v);
			}
			else {
				if(v){ console.warn('unexpected value', v); }
				return null;
			}
		},
		sortType: function(v) {
			console.warn('sort by Item:',arguments);
			return '';
		}
	},


	COLLECTIONITEM: {
		type: 'collectionItem',
		convert: function(v) {
			var values = [], key;
			if (v instanceof Object) {
				for(key in v) {
					if (v.hasOwnProperty(key) && v[key] instanceof Object) {
						values.push(v[key]);
					}
				}
				return ParseUtils.parseItems(values) ;
			}
			else {
				if(v){ console.warn('unexpected value', v); }
				return null;
			}
		},
		sortType: function(v) {
			console.warn('sort by Item:',arguments);
			return '';
		}
	}

});
