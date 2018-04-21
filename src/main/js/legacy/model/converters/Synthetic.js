const Ext = require('@nti/extjs');

const ObjectUtils = require('legacy/util/Object');


module.exports = exports = Ext.define('NextThought.model.converters.Synthetic', {
	SYNTHETIC: {
		type: 'Synthetic',
		persist: false,

		convert: function (v, record) {
			var dataName = record.persistenceProperty,
				data = record[dataName],
				config = {},
				fn = this.fn,
				sn = this.fnSet,
				sfn = function (val) { return sn.call(record, record, val); };

			config[this.name] = {
				getter: function () { return fn.call(record, record);},
				setter: sn && sfn,
				configurable: true
			};

			delete data[this.name];
			ObjectUtils.defineAttributes(data, config);
		}
	}
},function () {
	Ext.data.Types.SYNTHETIC = this.prototype.SYNTHETIC;
});
