const Ext = require('extjs');

require('./Part');


module.exports = exports = Ext.define('NextThought.model.assessment.FillInTheBlankShortAnswerPart', {
	extend: 'NextThought.model.assessment.Part',
	fields: [
		//remove this field so we do not render it in the 'content' area
		{ name: 'content', type: 'string', mapping: '++does+not+exist++'},
		{ name: 'input', type: 'string', mapping: 'content'}
	]
});
