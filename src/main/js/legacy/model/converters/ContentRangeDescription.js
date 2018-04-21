const Ext = require('@nti/extjs');

const ContentRangeDescription = require('../anchorables/ContentRangeDescription');

module.exports = exports = Ext.define('NextThought.model.converters.ContentRangeDescription', {
	override: 'Ext.data.Types',

	CONTENTRANGEDESCRIPTION: {
		type: 'ContentRangeDescription',
		convert: function (v, record) {
			try {
				if (v) {
					return ContentRangeDescription.createFromObject(v);
				}
				else {
					return null;
				}
			}
			catch (e) {
				console.error('CRD: Parsing Error: ', e.message, e.stack, arguments);
				return null;
			}
		}
	}
});
