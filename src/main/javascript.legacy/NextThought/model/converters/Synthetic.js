Ext.define('NextThought.model.converters.Synthetic', {
	requires: [
		'Ext.data.Types',
		'Ext.data.SortTypes',
		'NextThought.util.Object'
	],

	SYNTHETIC: {
		type: 'Synthetic',
		persist: false,

		convert: function(v, record) {
			var dataName = record.persistenceProperty,
				data = record[dataName],
				config = {},
				fn = this.fn,
				sn = this.fnSet,
				sfn = function(v) { return sn.call(record, record, v); };

			config[this.name] = {
				getter: function() { return fn.call(record, record);},
				setter: sn && sfn,
				configurable: true
			};

			delete data[this.name];
			ObjectUtils.defineAttributes(data, config);
		}
	}

},function() {
	Ext.data.Types.SYNTHETIC = this.prototype.SYNTHETIC;
});
