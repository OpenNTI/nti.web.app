const Ext = require('@nti/extjs');
const B64 = require('internal/legacy/util/Base64');

module.exports = exports = Ext.define('NextThought.cache.IdCache', {
	getIdentifier: function (id) {
		if (!id) {
			return null;
		}
		return B64.encode(id);
	},

	getComponentId: function (rec, subRecordField, prefix) {
		prefix = prefix || '';
		if (!rec) {
			return null;
		}

		var i = typeof rec === 'string' ? rec : rec.getId();

		if (!i && subRecordField) {
			i = rec.get(subRecordField).getId();
		}

		if (!i) {
			Ext.Error.raise({
				msg: 'Could not find NTIID in record',
				args: arguments,
			});
		}

		return 'cmp-' + prefix + '-' + this.getIdentifier(i);
	},
}).create();
