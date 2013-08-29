Ext.define('NextThought.model.converters.Synthetic', {
	requires: [
		'Ext.data.SortTypes',
		'NextThought.util.Object'
	],

	SYNTHETIC: {
		type:    'Synthetic',
		persist: false,

		convert: function (v, record) {
			var dataName = record.persistenceProperty,
					data = record[dataName],
					config = {},
					fn = this.fn,
					sn = this.fnSet;

			config[this.name] = {
				getter:       function () { return fn.call(record, record);},
				setter:       sn && function (v) { return sn.call(record, record, v);},
				configurable: true
			};

			delete data[this.name];
			ObjectUtils.defineAttributes(data, config);
		}
	}

}, function () {
	Ext.data.Types.SYNTHETIC = this.prototype.SYNTHETIC;
});
