const Ext = require('extjs');

require('./Hint');


module.exports = exports = Ext.define('NextThought.model.assessment.HTMLHint', {
	extend: 'NextThought.model.assessment.Hint',
	fields: [
		{ name: 'value', type: 'auto' }
	]
});
