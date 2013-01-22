Ext.define('NextThought.model.converters.Items', {
	override: 'Ext.data.Types',

	/* converters for models which reference other models*/
	SINGLEITEM: {
		type: 'singleItem',
		convert: function(v) {
			if (v instanceof Object) {
				return !v ? null : ParseUtils.parseItems([v])[0];
			}

			if(v){ console.warn('unexpected value', v); }
			return null;
		},
		sortType: Ext.data.SortTypes.none
	},


	ARRAYITEM: {
		type: 'arrayItem',
		convert: function(v) {
			var result = null;
			if (Ext.isArray(v)) {
				result =  ParseUtils.parseItems(v);
				if(this.limit !== undefined && result.length > this.limit){
					console.warn('Limiting set of items to the ('+this.name+') field\'s configured limit of: '+this.limit+', was: '+result.length);
					result = result.slice(0,this.limit);
				}
				return result;
			}

			if(v){ console.warn('unexpected value', v); }
			return null;
		},
		sortType: Ext.data.SortTypes.none
	},


	COLLECTIONITEM: {
		type: 'collectionItem',
		convert: function(v) {
			var values = [], key, result;
			if (v instanceof Object) {
				for(key in v) {
					if (v.hasOwnProperty(key) && v[key] instanceof Object) {
						values.push(v[key]);
					}
				}
				result = ParseUtils.parseItems(values);
				if(this.limit !== undefined && result.length > this.limit){
					console.warn('Limiting set of items to the ('+this.name+') field\'s configured limit of: '+this.limit+', was: '+result.length);
					result = result.slice(0,this.limit);
				}
				return result;
			}

			if(v){ console.warn('unexpected value', v); }
			return null;

		},
		sortType: Ext.data.SortTypes.none
	}

});
