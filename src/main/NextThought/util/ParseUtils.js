Ext.define('NextThought.util.ParseUtils',{
	alternateClassName: 'ParseUtils',
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

				try{
					results.push( reader.read(item).records[0] );
				}
				catch(e){
					console.error(e.stack);
					if(/user/i.test(item.Class)) {
						results.push( UserRepository.getUser(item.Username) );
					}
					else {
						throw e;
					}
				}
			}
		}

		return results;
	},

	getReaderForModel: function(modelName) {
		this._readers = this._readers || [];

		if (!NextThought.model.hasOwnProperty(modelName)){
			console.error('no model for NextThought.model.' + modelName);
			return;
		}

		if (!this._readers[modelName]) {
			this._readers[modelName] = Ext.create('reader.json',{
				model: 'NextThought.model.'+modelName, proxy: 'nti'
			});
		}

		return this._readers[modelName];

	}


},
	function(){
		window.ParseUtils = this;
	}
);
