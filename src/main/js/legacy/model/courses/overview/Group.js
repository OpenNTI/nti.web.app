const Ext = require('extjs');

require('../../Base');
require('../../../mixins/OrderedContents');


module.exports = exports = Ext.define('NextThought.model.courses.overview.Group', {
	extend: 'NextThought.model.Base',

	mixins: {
		OrderedContents: 'NextThought.mixins.OrderedContents'
	},

	statics: {
		mimeType: 'application/vnd.nextthought.nticourseoverviewgroup',

		COLOR_CHOICES: [
			'F9824E',
			'F5D420',
			'81C8DC',
			'A5C959',
			'F9869E',
			'A8699D',
			'C7D470',
			'6B718E',
			'D8AF7E',
			'59C997',
			'5474D6',
			'CE78E0',
			'F5A620',
			'7B8CDF',
			'D3545B',
			'728957'
		]
	},

	mimeType: 'application/vnd.nextthought.nticourseoverviewgroup',

	fields: [
		{name: 'title', type: 'String'},
		{name: 'accentColor', type: 'String'},
		{name: 'Items', type: 'arrayItem'}
	]
});
