Ext.define('NextThought.util.Parsing',{
	singleton: true,

	/**
	 * @param items
	 * @param [supplemental] Properties to add to the parsed items (such as flags)
	 */
	parseItems: function(items, supplemental){
		var key, item, reader, results = [];

		if (!Ext.isArray(items)) {items = [items];}

		for(key in items){
			if(items.hasOwnProperty(key)) {
				item = items[key] || {};

				if (typeof(item) === 'string'){item = Ext.JSON.decode(item);}

				if (item instanceof Ext.data.Model) {
					results.push(item);
					continue;
				}

				reader = this.getReaderForModel(item.Class);
				if(!reader) {
					console.error('No reader for item: ', item);
					continue;
				}

				if(supplemental){
					Ext.applyIf(item, supplemental);
				}

				results.push( reader.read(item).records[0] );
			}
		}

		return results;
	},

	getReaderForModel: function(modelName) {
		this.readers = this.readers || [];
		function recurse(dir, modelName) {
			for (var sub in dir) {
				if (sub == modelName) {
					return dir[sub];
				}
				if (!dir[sub].hasOwnProperty('$className')) {
					var child = recurse(dir[sub],modelName);
					if (child) return child;
				}
			}
		}
		var o = recurse(NextThought.model,modelName);
		if (!o) {
			console.error('no model found for ' + modelName);
			return;
		}
		if (!this.readers[modelName]) {
			this.readers[modelName] = Ext.create('reader.json',{
				model: o.$className, proxy: 'nti'
			});
		}

		return this.readers[modelName];

	},

	/**
	 * Parses an id and returns an object containing the split portions
	 *
	 * @param id
	 * @returns - an object containing the components of the id
	 */
	parseNtiid: function(id) {
		var parts = (typeof id !== 'string' ? (id||'').toString() : id ).split(':'),
			authority = (parts[1] || '').split(','),
			specific = (parts[2] || '').split('-'),
			result = {};

		if(parts.length < 3){
			console.warn('"'+id+'" is not an NTIID');
			return null;
		}

		result.authority = {
			name: authority[0],
			date: authority[1]
		};

		result.specific = {
			provider: specific.length === 3 ? specific[0] : null,
			type: specific.length === 3 ? specific[1] : specific[0],
			typeSpecific: specific.length === 3 ? specific[2] : specific[1]
		};

		result.identifier = parts[3];


		result.toString = function() {
			var m = this,
				a = [
					m.authority.name,
					m.authority.date
				],
				s = [
					m.specific.provider,
					m.specific.type,
					m.specific.typeSpecific
				];
			if (!m.specific.provider) {
				s.splice(0, 1);
			}

			return ['tag', a.join(','), s.join('-'), m.identifier].join(':');
		};

		return result;
	}

},function(){
	window.ParseUtils = this;
});
