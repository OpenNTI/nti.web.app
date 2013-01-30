Ext.define('NextThought.util.Parsing',{
	singleton: true,

	requires: ['Ext.data.reader.Json'],

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


	findModel: function(name){
		function recurse(dir, modelName) {
			var sub, o = dir[modelName];

			if(o) {
				return o;
			}

			for( sub in dir ) {
				if( dir.hasOwnProperty(sub) ){
					if(!dir[sub].$isClass && !dir[sub].singleton) {
						o = recurse(dir[sub], modelName);
						if(o){return o;}
					}
				}
			}

			return null;
		}

		return recurse(NextThought.model,name);
	},


	getReaderForModel: function(modelName) {
		this.readers = this.readers || [];

		var o = this.findModel(modelName);
		if (!o) {
			console.error('no model found for ' + modelName);
			return;
		}

		if (!this.readers[o.$className]) {
			this.readers[o.$className] = Ext.data.reader.Json.create({
				model: o.$className, proxy: 'nti'
			});
		}

		return this.readers[o.$className];

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

		if(parts.length < 3 || parts[0] !== 'tag'){
//			console.warn('"'+id+'" is not an NTIID');
			return null;
		}

		if(parts.length>4){
			console.warn('Possibly losing data, this ID has more than 4 parts', id);
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
