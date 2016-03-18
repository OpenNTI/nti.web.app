var Ext = require('extjs');
var ModelBase = require('../Base');
var ConvertersItems = require('../converters/Items');
var UtilParsing = require('../../util/Parsing');


module.exports = exports = Ext.define('NextThought.model.assessment.AssessedPart', {
    extend: 'NextThought.model.Base',

    fields: [
		{ name: 'explanation', type: 'auto'},
		{ name: 'solutions', type: 'auto'},
		{ name: 'submittedResponse', type: 'auto' },
		{ name: 'assessedValue', type: 'int' }
	],

    isCorrect: function() {
		var a = this.get('assessedValue');
		return Ext.isNumber(a) ? a === 1 : null;//true, false, or null
	}
});
