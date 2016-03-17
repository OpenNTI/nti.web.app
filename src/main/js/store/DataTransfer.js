/**
 * Wrap some helper methods around setting and getting data from the dataTransfer object
 *
 * NOTE: if using this wrapper around data from a browser drag/drop event, the data will only be available
 * for that event pump. Afterwards the browser will not let us access it.
 */
Ext.define('NextThought.store.DataTransfer', {

	constructor: function(config) {
		this.dataTransfer = config && config.dataTransfer;
		this.transferData = {};
	},


	/**
	 * Add values to be set on the dataTransfer object.
	 * The value being stored, will either:
	 *
	 * 1) if it implements getDataForTransfer, store that return value
	 * 2) stringify the value
	 *
	 * If no value is passed assume that the key is the value to store and the key is either:
	 *
	 * 1) if the value implements getKeyForTransfer call it
	 * 2) if the value has a mimeType use it
	 * 3) if the value is a string use it
	 *
	 * If no key is provided or we are unable to find one nothing will be added to the data transfer
	 *
	 * @param {String|Mixed} key   the key to store the value on (typically a mimetype), or the object to store
	 * @param {Mixed} value the value to store
	 */
	setData: function(key, value) {
		if (!value) {
			value = key;
			key = '';

			if (value.getKeyForTransfer) {
				key = value.getKeyForTransfer();
			} else if (value.mimeType) {
				key = value.mimeType;
			} else if (typeof value === 'string') {
				key = value;
			} else {
				console.error('Unable to find key for: ', value);
			}
		}

		if (!key) {
			console.error('No key provided for data transfer');
			return;
		}

		if (this.transferData[key]) {
			console.warn('Overriding transfer data: ', key, ' from ', this.transferData[key], ' with ', value);
		}

		if (value.getDataTransferValue) {
			value = value.getDataTransferValue();
		} else {
			value = JSON.stringify(value);
		}

		this.transferData[key] = value;
	},


	/**
	 * Iterate the data that has been set with setData,
	 * call the function with key, value.
	 *
	 * Seemed useful for a functional way to set the data on the event
	 * instead of passing the event.
	 *
	 * @param  {Function} fn callback
	 */
	forEach: function(fn) {
		var data = this.transferData,
			keys = Object.keys(data);

		keys.forEach(function(key) {
			fn(key, data[key]);
		});
	},


	/**
	 * If we've been given dataTransfer from an event check if the key is on there.
	 * If not check if its been set by setData.
	 *
	 * If the data is there, but we are not allowed to access it return true
	 *
	 * @param  {String} key the key to look for
	 * @return {String}     the value on data transfer for that key
	 */
	getData: function(key) {
		var data;

		if (this.dataTransfer) {
			data = this.dataTransfer.getData(key);
			data = data === '' ? true : data;
		}

		return data || this.transferData[key];
	},


	getJSON: function(key) {
		var data = this.getData(key);

		try {
			data = JSON.parse(data);
		} catch (e) {
			data = null;
		} finally {
			return data;
		}
	},


	getModel: function(key) {
		var data = this.getData(key);

		return ParseUtils.parseItems(data)[0];
	},


	findDataFor: function(key) {
		return this.getModel(key) || this.getJSON(key) || this.getData(key);
	},


	containsType: function(key) {
		var types = this.dataTransfer && this.dataTransfer.types;

		if (types) {
			//Firefox returns a DomStringList which doesn't have
			//an indexOf
			if(types.contains){
				return types.contains(key);
			}
			else if(types.indexOf){
				return types.indexOf(key) >= 0;
			}
		}

		//TODO: maybe search things that have been set with setData
	}
});
