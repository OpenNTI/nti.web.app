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
	 * See http://excelsior.nextthought.com/server-docs/ntiid-structure/

	 * @param id
	 * @returns {Object} an object containing the components of the id
	 */
	parseNtiid: function(id) {
		var parts = (typeof id !== 'string' ? (id||'').toString() : id ).split(':'),
			authority, specific,
			result = {};

		if(parts.length < 3 || parts[0] !== 'tag'){
			//console.warn('"'+id+'" is not an NTIID');
			return null;
		}

		//First part is tag, second is authority, third is specific portion

		//authority gets split by comma into name and date
		authority = parts[1].split(',');
		if(authority.length !== 2){
			//invalid authority chunk
			return null;
		}

		result.authority = {
			name: authority[0],
			date: authority[1]
		};

		//join any parts after the 2nd into the specific portion that will
		//then be split back out into the specific parts.
		//TODO yank the fragment off the end
		specific = parts.slice(2).join(':');
		specific = specific.split('-');
		result.specific = {
			provider: specific.length === 3 ? specific[0] : null,
			type: specific.length === 3 ? specific[1] : specific[0],
			typeSpecific: specific.length === 3 ? specific[2] : specific[1]
		};

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

			return ['tag', a.join(','), s.join('-')].join(':');
		};

		//FIXME include authority?
		result.toURLSuffix = function(){
			//#!html/mathcounts/mathcounts2013.warm_up_7
			var m = this, components = [];

			components.push(m.specific.type);
			if(m.specific.provider){
				components.push(m.specific.provider);
			}
			components.push(m.specific.typeSpecific);

			return '#!'+Ext.Array.map(components,encodeURIComponent).join('/');
		};

		return result;
	},


	parseNtiHash: function(hash){
		var authority = 'nextthought.com,2011-10',
			parts, type, provider, typeSpecific;

		if(Ext.isEmpty(hash) || hash.indexOf('#!') !== 0){
			return null;
		}
		hash = hash.slice(2);
		parts = hash.split('/');
		if(parts.length < 2 || parts.length > 3){
			return null;
		}

		type = parts[0];
		provider = parts.length === 3 ? parts[1] : '';
		typeSpecific = parts.length === 3 ? parts[2] : parts[1];

		s = Ext.Array.map([provider,type,typeSpecific],decodeURIComponent);
		if(Ext.isEmpty(provider)){
			s.splice(0, 1);
		}

		return ['tag', authority, s.join('-')].join(':');
	}

},function(){
	window.ParseUtils = this;
});
