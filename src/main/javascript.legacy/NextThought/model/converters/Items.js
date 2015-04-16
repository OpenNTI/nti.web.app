Ext.define('NextThought.model.converters.Items', {
	override: 'Ext.data.Types',
	requires: ['Ext.data.SortTypes'],

	/* converters for models which reference other models*/
	SINGLEITEM: {
		type: 'singleItem',
		convert: function(v, r) {
			if (v instanceof Object) {
				v = !v ? null : ParseUtils.parseItems([v])[0];
				if (v) {
					v.stores.push(r);//make store updates bubble up to this owner record.
				}
				return v;
			}

			if (v) { console.warn('unexpected value', v); }
			return null;
		},
		sortType: 'none'
	},


	ARRAYITEM: {
		type: 'arrayItem',
		convert: function(v, r) {
			var result = null;
			if (Ext.isArray(v)) {
				result = ParseUtils.parseItems(v);
				if (this.limit !== undefined && result.length > this.limit) {
					console.warn('Limiting set of items to the (' + this.name + ') field\'s configured limit of: ' + this.limit + ', was: ' + result.length);
					result = result.slice(0, this.limit);
					result.forEach(function(a) {if (a) {a.stores.push(r);}});
				}
				return result;
			}

			if (v) { console.warn('unexpected value', v); }
			return null;
		},
		sortType: 'none'
	},


	COLLECTIONITEM: {
		type: 'collectionItem',
		convert: function(v, r) {
			var values = [], keys = {}, key, result;
			if (v instanceof Object) {
				for (key in v) {
					if (v.hasOwnProperty(key) && v[key] instanceof Object) {
						keys[key] = values.length;
						values.push(v[key]);
						if (this.limit !== undefined && values.length > this.limit) {
							console.warn('Limiting set of items to the (' + this.name + ') field\'s configured limit of: ' + this.limit + ', was: ' + result.length);
							values.pop();
							delete keys[key];
							break;
						}
					}
				}
				result = ParseUtils.parseItems(values);
				result.forEach(function(a) {if (a) {a.stores.push(r);}});
				result.INDEX_KEYMAP = keys;
				return result;
			}

			if (v) { console.warn('unexpected value', v); }
			return null;

		},
		sortType: 'none'
	}

}, function() {
	function set(o) { o.sortType = Ext.data.SortTypes[o.sortType]; }

	set(this.SINGLEITEM);
	set(this.ARRAYITEM);
	set(this.COLLECTIONITEM);
});
