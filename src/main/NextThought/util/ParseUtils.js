Ext.define('NextThought.util.ParseUtils',{
	alternateClassName: 'ParseUtils',
	singleton: true,

	parseItems: function(items){
		var key, item, reader, results = [], suppl = arguments[1];
		for(key in items){
			if(!items.hasOwnProperty(key)) continue;
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

			if(suppl){
				Ext.applyIf(item, suppl);
			}

			try{
				results.push( reader.read(item).records[0] );
			}
			catch(e){
				debugger;
				console.error(e.stack);
				if(/user/i.test(item.Class))
					results.push( UserRepository.getUser(item.Username) );
				else
					throw e;
			}
		}

		return results;
	},

	getReaderForModel: function(modelName) {
		if (!modelName){debugger;}
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
